import Anthropic from '@anthropic-ai/sdk'
import { getStore } from '@netlify/blobs'
import type { Context } from '@netlify/functions'
import { FACTS } from '../../shared/facts.generated.js'
import { buildSystem } from '../lib/prompt'
import { checkAndCount, type CounterStore } from '../lib/ratelimit'
import { validateBody } from '../lib/validate'

const MAX_BODY = 16_384

type Usage = { cache_read_input_tokens?: number | null, input_tokens?: number, output_tokens?: number }

// One line per request. Never the question text, the IP or the key.
function log(model: string, status: number, usage?: Usage) {
  console.log(JSON.stringify({
    model,
    status,
    cache_read_input_tokens: usage?.cache_read_input_tokens ?? null,
    input_tokens: usage?.input_tokens ?? null,
    output_tokens: usage?.output_tokens ?? null,
  }))
}

export default async (req: Request, context: Context) => {
  const model = (process.env.ASK_MODEL || '').trim() || 'claude-opus-5-5'
  const json = (status: number, body: object) => {
    log(model, status)
    return Response.json(body, { status })
  }

  if (req.method !== 'POST') return json(405, { error: 'POST only' })
  if (!process.env.ANTHROPIC_API_KEY) return json(503, { reason: 'nokey' })
  const salt = process.env.RATE_SALT
  if (!salt) return json(503, { reason: 'nosalt' })

  // content-length can be absent (chunked), so the text length is the real check
  if (Number(req.headers.get('content-length')) > MAX_BODY) return json(400, { error: 'body too large' })
  const raw = await req.text()
  if (raw.length > MAX_BODY) return json(400, { error: 'body too large' })
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { return json(400, { error: 'invalid JSON' }) }
  const valid = validateBody(parsed)
  if (!valid.ok) return json(400, { error: valid.error })

  try {
    // ponytail: cast because Store.set types onlyIfMatch/onlyIfNew as exclusive variants; same runtime shape
    const store = getStore({ name: 'ask-limits', consistency: 'strong' }) as CounterStore
    const limit = await checkAndCount(store, { ip: context.ip, salt, ctx: process.env.CONTEXT ?? 'dev', now: new Date() })
    if (!limit.allowed) return json(429, { reason: limit.reason })
  } catch {
    return json(429, { reason: 'global' }) // the limiter fails closed
  }

  const client = new Anthropic()
  const params = {
    model,
    max_tokens: 600,
    output_config: { effort: 'low' as const },
    system: buildSystem(FACTS),
    messages: valid.messages,
  }
  // Server-side fallback exists for Opus only; Haiku has none.
  const stream = model.startsWith('claude-opus')
    ? client.beta.messages.stream({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' })
    : client.messages.stream(params)
  // Take the iterator in the same tick: it registers the stream's error listeners.
  const it = stream[Symbol.asyncIterator]()

  // Await the first event so API errors become real statuses, not a broken stream.
  let pending: Awaited<ReturnType<typeof it.next>> | null
  try {
    pending = await it.next()
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) return json(503, { reason: 'nokey' })
    if (err instanceof Anthropic.RateLimitError) return json(503, { reason: 'upstream' })
    if (err instanceof Anthropic.APIError) return json(502, { reason: 'upstream' })
    return json(500, { error: 'internal' })
  }

  const enc = new TextEncoder()
  let closed = false
  const finish = async (ctrl: ReadableStreamDefaultController<Uint8Array>) => {
    if (closed) return
    closed = true
    ctrl.close()
    try {
      const final = await stream.finalMessage()
      log(final.model, 200, final.usage)
    } catch {
      log(model, 200)
    }
  }

  const body = new ReadableStream<Uint8Array>({
    async pull(ctrl) {
      try {
        for (;;) {
          const r = pending ?? await it.next()
          pending = null
          if (r.done) return await finish(ctrl)
          const ev = r.value
          if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
            ctrl.enqueue(enc.encode(ev.delta.text))
            return
          }
          if (ev.type === 'message_delta' && ev.delta.stop_reason === 'refusal') return await finish(ctrl)
          if (ev.type === 'message_stop') return await finish(ctrl)
        }
      } catch {
        await finish(ctrl) // mid-stream failure: the client sees no cite token and shows it as truncated
      }
    },
    cancel() { // the visitor closed the panel: stop paying for tokens
      if (!closed) log(model, 200)
      closed = true
      stream.abort()
    },
  })

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  })
}
