// @vitest-environment node
import { checkAndCount, hashIp, type CounterStore } from './ratelimit'

function memStore(): CounterStore & { map: Map<string, string> } {
  const map = new Map<string, string>()
  return {
    map,
    async getWithMetadata(k) { return map.has(k) ? { data: map.get(k)!, etag: 'e' + map.get(k) } : null },
    async set(k, v, o) {
      if (o.onlyIfNew && map.has(k)) return { modified: false }
      if (o.onlyIfMatch && o.onlyIfMatch !== 'e' + map.get(k)) return { modified: false }
      map.set(k, v); return { modified: true }
    },
    async list({ prefix }) { return { blobs: [...map.keys()].filter(k => k.startsWith(prefix)).map(key => ({ key })) } },
    async delete(k) { map.delete(k) },
  }
}
const base = { salt: 's', ctx: 'test', now: new Date('2026-11-04T20:00:00Z') }

test('hashIp is stable, salted and 16 hex chars', async () => {
  expect(await hashIp('1.2.3.4', 's')).toMatch(/^[0-9a-f]{16}$/)
  expect(await hashIp('1.2.3.4', 's')).not.toBe(await hashIp('1.2.3.4', 't'))
})
test('11th question in an hour from one address is refused with reason ip', async () => {
  const store = memStore()
  for (let i = 0; i < 10; i++) expect(await checkAndCount(store, { ...base, ip: '1.2.3.4' })).toEqual({ allowed: true })
  expect(await checkAndCount(store, { ...base, ip: '1.2.3.4' })).toEqual({ allowed: false, reason: 'ip' })
  expect(await checkAndCount(store, { ...base, ip: '5.6.7.8' })).toEqual({ allowed: true })
})
test('301st question in a day is refused with reason global', async () => {
  const store = memStore()
  for (let i = 0; i < 300; i++) await checkAndCount(store, { ...base, ip: `10.0.${Math.floor(i / 9)}.${i % 9}` })
  expect(await checkAndCount(store, { ...base, ip: '9.9.9.9' })).toEqual({ allowed: false, reason: 'global' })
})
test('prunes ip keys older than two hours and never stores the raw ip', async () => {
  const store = memStore()
  await checkAndCount(store, { ...base, ip: '1.2.3.4', now: new Date('2026-11-04T17:00:00Z') })
  await checkAndCount(store, { ...base, ip: '1.2.3.4' })
  expect([...store.map.keys()].some(k => k.includes('T17'))).toBe(false)
  expect([...store.map.keys()].some(k => k.includes('1.2.3.4'))).toBe(false)
})
