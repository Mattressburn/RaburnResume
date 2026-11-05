import Anthropic from '@anthropic-ai/sdk'
import { getStore } from '@netlify/blobs'
import type { Context } from '@netlify/functions'
import { FACTS } from '../../shared/facts.generated.js'
import { buildSystem } from '../lib/prompt'
import { checkAndCount, type CounterStore } from '../lib/ratelimit'
import { validateBody } from '../lib/validate'

const MAX_BODY = 24_576
const DEADLINE_MS = 50_000 // our own budget inside the platform's 60 s limit

type Usage = {
  cache_read_input_tokens?: number | null
  cache_creation_input_tokens?: number | null
  input_tokens?: number
  output_tokens?: number
}
type AskStream =
  | ReturnType<Anthropic['messages']['stream']>
  | ReturnType<Anthropic['beta']['messages']['stream']>

// One line per request. Never the question text, the answer text, the IP or the key.
function log(model: string, status: number, usage?: Usage, stopReason?: string | null) {
  console.log(JSON.stringify({
    model,
    status,
    stop_reason: stopReason ?? null,
    cache_read_input_tokens: usage?.cache_read_input_tokens ?? null,
    cache_creation_input_tokens: usage?.cache_creation_input_tokens ?? null,
    input_tokens: usage?.input_tokens ?? null,
    output_tokens: usage?.output_tokens ?? null,
  }))
}

export default async (req: Request, context: Context) => {
  const model = (process.env.ASK_MODEL || '').trim() || 'claude-haiku-5-5'
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
  let raw: string
  try { raw = await req.text() } catch { return json(500, { error: 'internal' }) }
  if (raw.length > MAX_BODY) return json(400, { error: 'body too large' })
  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { return json(400, { error: 'invalid JSON' }) }
  const valid = validateBody(parsed)
  if (!valid.ok) return json(400, { error: valid.error })

  try {
    // ponytail: cast because Store.set types onlyIfMatch/onlyIfNew as exclusive variants; same runtime shape
    const store = getStore({ name: 'ask-limits', consistency: 'strong' }) as CounterStore
    // No usable address still counts, under one shared key, so the hash stays stable.
    const ip = typeof context.ip === 'string' && context.ip ? context.ip : 'unknown'
    const limit = await checkAndCount(store, { ip, salt, ctx: process.env.CONTEXT ?? 'dev', now: new Date() })
    if (!limit.allowed) return json(429, { reason: limit.reason })
  } catch {
    return json(429, { reason: 'global' }) // the limiter fails closed
  }

  let stream: AskStream
  let it: ReturnType<AskStream[typeof Symbol.asyncIterator]>
  let pending: Awaited<ReturnType<typeof it.next>> | null
  let deadline: ReturnType<typeof setTimeout> | undefined
  try {
    // 20 s per attempt, one retry: both attempts fit inside the 50 s deadline.
    const client = new Anthropic({ maxRetries: 1, timeout: 20_000 })
    const params = {
      model,
      output_config: { effort: 'low' as const },
      system: buildSystem(FACTS),
      messages: valid.messages,
    }
    // Opus: thinking stays adaptive (it cannot be disabled), so its 1,200 tokens cover thinking and the answer;
    // server-side fallback exists for Opus only. Everything else: thinking off (Haiku 5.5 accepts it at effort low).
    // ponytail: 'disabled' 400s on Sonnet 5.5 and Fable; branch here if ASK_MODEL ever points at them.
    stream = model.startsWith('claude-opus')
      ? client.beta.messages.stream({
        ...params,
        max_tokens: 1200,
        thinking: { type: 'adaptive' },
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
      })
      : client.messages.stream({ ...params, max_tokens: 600, thinking: { type: 'disabled' } })
    // Take the iterator in the same tick: it registers the stream's error listeners.
    it = stream[Symbol.asyncIterator]()
    deadline = setTimeout(() => stream.abort(), DEADLINE_MS)
    // Await the first event so API errors become real statuses, not a broken stream.
    // A deadline abort here rejects with APIUserAbortError, an APIError, so it maps to 502.
    pending = await it.next()
  } catch (err) {
    clearTimeout(deadline)
    if (err instanceof Anthropic.AuthenticationError) return json(503, { reason: 'nokey' })
    if (err instanceof Anthropic.RateLimitError) return json(503, { reason: 'upstream' })
    if (err instanceof Anthropic.APIError) return json(502, { reason: 'upstream' })
    return json(500, { error: 'internal' })
  }

  const enc = new TextEncoder()
  let closed = false
  let sent = false
  const finish = async (ctrl: ReadableStreamDefaultController<Uint8Array>) => {
    if (closed) return
    closed = true
    clearTimeout(deadline)
    // Nothing arrived (refusal before output, failure right after message_start): error the body
    // so the client takes its "nothing arrived" branch instead of showing an empty answer.
    if (sent) ctrl.close()
    else ctrl.error(new Error('empty'))
    try {
      const final = await stream.finalMessage()
      log(final.model, 200, final.usage, final.stop_reason)
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
            if (!ev.delta.text) continue
            sent = true
            ctrl.enqueue(enc.encode(ev.delta.text))
            return
          }
          if (ev.type === 'message_delta' && ev.delta.stop_reason === 'refusal') return await finish(ctrl)
          if (ev.type === 'message_stop') return await finish(ctrl)
        }
      } catch {
        await finish(ctrl) // mid-stream failure or deadline: the client sees no cite token and shows it as truncated
      }
    },
    cancel() { // the visitor closed the panel: stop paying for tokens
      if (!closed) log(model, 200)
      closed = true
      clearTimeout(deadline)
      stream.abort()
    },
  })

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
  })
}
