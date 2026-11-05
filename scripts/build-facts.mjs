import { readFileSync, writeFileSync } from 'node:fs'

const src = new URL('../shared/facts.md', import.meta.url)
const out = new URL('../shared/facts.generated.js', import.meta.url)
writeFileSync(out, `export const FACTS = ${JSON.stringify(readFileSync(src, 'utf8'))}\n`)
