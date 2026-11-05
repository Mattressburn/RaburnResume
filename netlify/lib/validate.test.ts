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
