// @vitest-environment node
import { validateBody } from './validate'
const u = (c: string) => ({ role: 'user', content: c })
const a = (c: string) => ({ role: 'assistant', content: c })

test('accepts a well-formed conversation', () => {
  const r = validateBody({ messages: [u('hi'), a('yes'), u('more')] })
  expect(r.ok).toBe(true)
})
test('rejects oversize, empty, wrong order and too many turns', () => {
  expect(validateBody({ messages: [u('x'.repeat(501))] }).ok).toBe(false)
  expect(validateBody({ messages: [u('   ')] }).ok).toBe(false)
  expect(validateBody({ messages: [a('x'), u('y')] }).ok).toBe(false)
  expect(validateBody({ messages: [u('1'), a('r'), u('2'), a('r'), u('3'), a('r'), u('4'), a('r'), u('5'), a('r'), u('6'), a('r'), u('7')] }).ok).toBe(false)
  expect(validateBody({}).ok).toBe(false)
  expect(validateBody('nope').ok).toBe(false)
})

test('returns trimmed, whitelisted messages', () => {
  const r = validateBody({ messages: [{ role: 'user', content: '  hi  ', extra: 1 }, { role: 'assistant', content: ' yes ', x: 2 }, u('q')] })
  expect(r).toEqual({ ok: true, messages: [u('hi'), a('yes'), u('q')] })
})
test('user length boundary is 500', () => {
  expect(validateBody({ messages: [u('x'.repeat(500))] }).ok).toBe(true)
  expect(validateBody({ messages: [u('x'.repeat(501))] }).ok).toBe(false)
})
test('rejects 13 entries, a wrong role and numeric content', () => {
  const thirteen = Array.from({ length: 13 }, (_, i) => (i % 2 ? a('r') : u('q')))
  expect(validateBody({ messages: thirteen }).ok).toBe(false)
  expect(validateBody({ messages: [{ role: 'system', content: 'x' }] }).ok).toBe(false)
  expect(validateBody({ messages: [{ role: 'user', content: 5 }] }).ok).toBe(false)
})
