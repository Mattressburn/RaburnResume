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

test('streams chunks and returns the full text', async () => {
  const chunks = []
  const r = await ask([{ role: 'user', content: 'hi' }], { fetchImpl: async () => res(200, 'Hel' + 'lo [cite:system]', 'text/plain'), onChunk: (t) => chunks.push(t) })
  expect(r.status).toBe('ok'); expect(r.text).toBe('Hello [cite:system]'); expect(chunks.at(-1)).toBe('Hello [cite:system]')
})
