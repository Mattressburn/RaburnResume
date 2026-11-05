// @vitest-environment node
import { buildSystem, CITE_KEYS } from './prompt'

test('system prompt has two blocks and caches only the facts block', () => {
  const s = buildSystem('FACTS BODY')
  expect(s).toHaveLength(2)
  expect(s[0].cache_control).toBeUndefined()
  expect(s[1].cache_control).toEqual({ type: 'ephemeral' })
  expect(s[1].text).toContain('FACTS BODY')
  for (const k of CITE_KEYS) expect(s[0].text).toContain(`[cite:${k}]`)
  expect(s[0].text).toContain("That's not on this page")
})
