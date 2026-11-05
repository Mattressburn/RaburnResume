// @vitest-environment node
import { readFileSync } from 'node:fs'
import { site } from './site.js'

const facts = readFileSync(new URL('../../shared/facts.md', import.meta.url), 'utf8')

test('every displayed metric appears verbatim in shared/facts.md', () => {
  const displays = [
    ...site.hero.metrics.map(m => m.display),
    ...site.system.numbers.flatMap(g => g.items.map(i => i.display)),
  ]
  for (const d of displays) expect(facts).toContain(d)
})

test('hero copy never names the product', () => {
  const hero = JSON.stringify([site.hero, site.system, site.projects, site.stack, site.meta])
  // spec 5: visible text only; the case-study URL slug carries the name and is allowed
  const visible = hero.replace(/https?:\/\/[^"]*/g, '')
  expect(visible.toLowerCase()).not.toContain('rumil')
})

test('experience names it exactly once per JCI bullet set', () => {
  const jci = site.experience[0]
  expect(jci.bullets.join(' ')).toContain('Rumil')
})
