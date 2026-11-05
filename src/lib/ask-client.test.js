// @vitest-environment node
import { splitCites, ask } from './ask-client.js'

test('splitCites strips known tokens and keeps unknown text', () => {
  expect(splitCites('Yes. [cite:system] [cite:bogus] [cite:system]')).toEqual({ body: 'Yes.  [cite:bogus] ', cites: ['system'] })
})

const res = (status, body, type = 'application/json') => new Response(body, { status, headers: { 'content-type': type } })

test('maps statuses', async () => {
  expect((await ask([], { fetchImpl: async () => res(429, '{"reason":"global"}') })).status).toBe('global')
  expect((await ask([], { fetchImpl: async () => res(429, '{"reason":"ip"}') })).status).toBe('ip')
  expect((await ask([], { fetchImpl: async () => res(503, '') })).status).toBe('paused')
  expect((await ask([], { fetchImpl: async () => res(500, '') })).status).toBe('paused')
  expect((await ask([], { fetchImpl: async () => res(400, '') })).status).toBe('bad')
  expect((await ask([], { fetchImpl: async () => { throw new Error('net') } })).status).toBe('error')
})

test('passes the signal through and treats an AbortError as a silent stop', async () => {
  const ac = new AbortController()
  const r = await ask([], { signal: ac.signal, fetchImpl: async (_url, init) => { expect(init.signal).toBe(ac.signal); throw new DOMException('closed', 'AbortError') } })
  expect(r).toEqual({ status: 'aborted', text: '' })
})

test('streams chunks and returns the full text', async () => {
  const chunks = []
  const r = await ask([{ role: 'user', content: 'hi' }], { fetchImpl: async () => res(200, 'Hel' + 'lo [cite:system]', 'text/plain'), onChunk: (t) => chunks.push(t) })
  expect(r.status).toBe('ok'); expect(r.text).toBe('Hello [cite:system]'); expect(chunks.at(-1)).toBe('Hello [cite:system]')
})

test('splitCites accepts the about token', () => {
  expect(splitCites('Steady. [cite:about]')).toEqual({ body: 'Steady. ', cites: ['about'] })
})
