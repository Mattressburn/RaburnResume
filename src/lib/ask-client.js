import { CASE_STUDY } from '../data/site'

export const LIMITS = { maxChars: 500, maxQuestions: 6 }

// The server's fixed vocabulary is system, experience, projects, stack, case-study.
// `contact` exists only so the client can map the pre-written fallback answer that ends "(Contact)".
export const CITES = {
  system: '#system',
  experience: '#experience',
  projects: '#projects',
  stack: '#stack',
  'case-study': CASE_STUDY,
  contact: '#contact',
}

export function splitCites(text) {
  const cites = []
  const body = String(text).replace(/\[cite:([a-z-]+)\]/g, (tok, key) => {
    if (!Object.hasOwn(CITES, key)) return tok
    if (!cites.includes(key)) cites.push(key)
    return ''
  })
  return { body, cites }
}

// `signal` aborts the request (the panel closed); that returns status 'aborted', never an error.
export async function ask(messages, { fetchImpl = (...a) => fetch(...a), onChunk, signal } = {}) {
  const stopped = (err) => signal?.aborted || err?.name === 'AbortError'
  let res
  try {
    res = await fetchImpl('/.netlify/functions/ask', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal,
    })
  } catch (err) {
    return { status: stopped(err) ? 'aborted' : 'error', text: '' }
  }
  if (res.status === 429) {
    let reason = 'ip'
    try { reason = (await res.json()).reason } catch { /* keep default */ }
    return { status: reason === 'global' ? 'global' : 'ip', text: '' }
  }
  if (res.status >= 500) return { status: 'paused', text: '' }
  if (!res.ok) return { status: 'bad', text: '' }

  let acc = ''
  try {
    if (!res.body) {
      acc = await res.text()
      onChunk?.(acc)
    } else {
      const reader = res.body.getReader()
      const dec = new TextDecoder()
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += dec.decode(value, { stream: true })
        onChunk?.(acc)
      }
      acc += dec.decode()
    }
  } catch (err) {
    if (stopped(err)) return { status: 'aborted', text: acc }
    // Stream died midway: keep what arrived (the UI shows it as truncated); nothing arrived is an error.
    if (!acc) return { status: 'error', text: '' }
  }
  return { status: 'ok', text: acc }
}
