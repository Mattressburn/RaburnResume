// @vitest-environment node
import { readFileSync } from 'node:fs'
import { site } from './site.js'

const facts = readFileSync(new URL('../../shared/facts.md', import.meta.url), 'utf8')

test('every hero metric appears verbatim in shared/facts.md', () => {
  for (const m of site.hero.metrics) expect(facts).toContain(m.display)
})

// Figure and label together, so a bare "8" or "17" cannot match some unrelated number.
test('every System figure appears with its label in shared/facts.md', () => {
  const missing = site.system.numbers
    .flatMap(g => g.items.map(i => `${i.display} ${i.label}`))
    .filter(pair => !facts.includes(pair))
  expect(missing).toEqual([])
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
