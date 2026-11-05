// @vitest-environment node
import { checkAndCount, hashIp, normalizeIp, type CounterStore } from './ratelimit'

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

function slowStore(): CounterStore & { map: Map<string, string> } {
  const inner = memStore()
  const wait = () => new Promise(r => setTimeout(r, 5 + Math.random() * 15))
  return {
    map: inner.map,
    async getWithMetadata(k) { await wait(); return inner.getWithMetadata(k) },
    async set(k, v, o) { await wait(); return inner.set(k, v, o) },
    list: inner.list,
    delete: inner.delete,
  }
}

test('a concurrent burst from one address never exceeds the limit', async () => {
  // With 3 attempts per slot, losers fail closed, so fewer than 10 may get in; never more.
  const store = slowStore()
  const results = await Promise.all(Array.from({ length: 50 }, () => checkAndCount(store, { ...base, ip: '1.2.3.4' })))
  const allowed = results.filter(r => r.allowed).length
  expect(allowed).toBeGreaterThan(0)
  expect(allowed).toBeLessThanOrEqual(10)
  const ipKey = [...store.map.keys()].find(k => k.includes('/ip/'))!
  expect(Number(store.map.get(ipKey))).toBeGreaterThanOrEqual(allowed) // ip slots can be burned by a lost global race
  expect(Number(store.map.get(ipKey))).toBeLessThanOrEqual(10)
  expect(store.map.get('test/global/2026-11-04')).toBe(String(allowed))
})
test('three lost races end refused', async () => {
  const store = memStore()
  store.set = async () => ({ modified: false })
  expect(await checkAndCount(store, { ...base, ip: '1.2.3.4' })).toEqual({ allowed: false, reason: 'ip' })
})
test('a refused call performs no write', async () => {
  const store = memStore()
  for (let i = 0; i < 10; i++) await checkAndCount(store, { ...base, ip: '1.2.3.4' })
  const before = new Map(store.map)
  let writes = 0
  const set = store.set
  store.set = async (...a) => { writes++; return set(...a) }
  expect(await checkAndCount(store, { ...base, ip: '1.2.3.4' })).toEqual({ allowed: false, reason: 'ip' })
  expect(writes).toBe(0)
  expect(store.map).toEqual(before)
})
test('the next hour allows the same address again', async () => {
  const store = memStore()
  for (let i = 0; i < 11; i++) await checkAndCount(store, { ...base, ip: '1.2.3.4' })
  expect(await checkAndCount(store, { ...base, ip: '1.2.3.4', now: new Date('2026-11-04T21:00:00Z') })).toEqual({ allowed: true })
})
test('keeps a two-hour-old ip key and prunes a three-hour-old one', async () => {
  const store = memStore()
  await checkAndCount(store, { ...base, ip: '1.1.1.1', now: new Date('2026-11-04T17:00:00Z') })
  await checkAndCount(store, { ...base, ip: '2.2.2.2', now: new Date('2026-11-04T18:00:00Z') })
  await checkAndCount(store, { ...base, ip: '3.3.3.3' })
  const keys = [...store.map.keys()]
  expect(keys.some(k => k.includes('T17'))).toBe(false)
  expect(keys.some(k => k.includes('T18'))).toBe(true)
})
test('corrupt counters and a missing etag fail closed', async () => {
  for (const bad of ['abc', '-1', 'Infinity', '']) {
    const store = memStore()
    const ipKey = `test/ip/2026-11-04T20/${await hashIp('1.2.3.4', 's')}`
    store.map.set(ipKey, bad)
    expect(await checkAndCount(store, { ...base, ip: '1.2.3.4' })).toEqual({ allowed: false, reason: 'ip' })
    expect(store.map.get(ipKey)).toBe(bad)
  }
  const store = memStore()
  const g = store.getWithMetadata
  store.getWithMetadata = async k => { const r = await g(k); return r && { data: r.data } }
  store.map.set(`test/ip/2026-11-04T20/${await hashIp('1.2.3.4', 's')}`, '1')
  expect(await checkAndCount(store, { ...base, ip: '1.2.3.4' })).toEqual({ allowed: false, reason: 'ip' })
})
test('a failing prune does not fail a counted request', async () => {
  const store = memStore()
  store.list = async () => { throw new Error('boom') }
  expect(await checkAndCount(store, { ...base, ip: '1.2.3.4' })).toEqual({ allowed: true })
})
test('an empty salt throws', async () => {
  await expect(checkAndCount(memStore(), { ...base, salt: '', ip: '1.2.3.4' })).rejects.toThrow(/salt/)
})
test('normalizeIp maps mapped IPv4, groups by /64 and leaves IPv4 alone', async () => {
  expect(normalizeIp('::ffff:1.2.3.4')).toBe('1.2.3.4')
  expect(normalizeIp('::ffff:102:304')).toBe('1.2.3.4')
  expect(normalizeIp('1.2.3.4')).toBe('1.2.3.4')
  expect(normalizeIp('not an ip')).toBe('not an ip')
  expect(normalizeIp('2001:db8:0:1::5')).toBe('2001:db8:0:1::')
  expect(await hashIp(normalizeIp('2001:db8:0:1::5'), 's')).toBe(await hashIp(normalizeIp('2001:db8:0:1:aaaa:bbbb:cccc:dddd'), 's'))
})
