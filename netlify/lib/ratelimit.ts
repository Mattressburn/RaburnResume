// Rate limiter over a store shaped like the @netlify/blobs Store.
// The caller must open the store with `consistency: 'strong'` (conditional writes need fresh reads)
// and must treat any error thrown from checkAndCount as a refusal (fail closed).
import { isIPv6 } from 'node:net'

export interface CounterStore {
  getWithMetadata(key: string): Promise<{ data: string, etag?: string } | null>
  set(key: string, value: string, opts: { onlyIfMatch?: string, onlyIfNew?: boolean }): Promise<{ modified: boolean }>
  list(opts: { prefix: string }): Promise<{ blobs: { key: string }[] }>
  delete(key: string): Promise<void>
}

export type LimitResult = { allowed: true } | { allowed: false, reason: 'ip' | 'global' }

const MAX_ATTEMPTS = 3

export async function hashIp(ip: string, salt: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(salt + ip))
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

// Expand any valid IPv6 string (compressed, zone id, dotted IPv4 tail) into 8 numeric groups.
function expandIpv6(ip: string): number[] {
  let s = ip.split('%')[0]
  const dotted = s.match(/^(.*:)(\d+)\.(\d+)\.(\d+)\.(\d+)$/)
  if (dotted) {
    const [, head, a, b, c, d] = dotted
    s = head + ((Number(a) << 8) | Number(b)).toString(16) + ':' + ((Number(c) << 8) | Number(d)).toString(16)
  }
  const [head, tail] = s.split('::')
  const h = head ? head.split(':') : []
  const t = tail === undefined ? [] : tail ? tail.split(':') : []
  const zeros = tail === undefined ? [] : Array(8 - h.length - t.length).fill('0')
  return [...h, ...zeros, ...t].map(g => parseInt(g, 16))
}

// IPv4-mapped IPv6 becomes plain IPv4; other IPv6 collapses to its /64; anything else is unchanged.
export function normalizeIp(ip: string): string {
  if (!isIPv6(ip)) return ip
  const g = expandIpv6(ip)
  if (g.slice(0, 5).every(x => x === 0) && g[5] === 0xffff) {
    return `${g[6] >> 8}.${g[6] & 255}.${g[7] >> 8}.${g[7] & 255}`
  }
  return g.slice(0, 4).map(x => x.toString(16)).join(':') + '::'
}

type Reserve = 'created' | 'updated' | 'refused'

// Takes one slot by writing count+1 conditionally; the write is the reservation.
// Refuses at the limit, on unreadable counters, or after MAX_ATTEMPTS lost races.
async function reserve(store: CounterStore, key: string, limit: number): Promise<Reserve> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const got = await store.getWithMetadata(key)
    let count = 0
    if (got) {
      count = /^\d+$/.test(got.data) ? Number(got.data) : NaN
      if (!Number.isSafeInteger(count) || !got.etag) return 'refused'
    }
    if (count >= limit) return 'refused'
    const res = await store.set(key, String(count + 1), got ? { onlyIfMatch: got.etag } : { onlyIfNew: true })
    if (res.modified) return got ? 'updated' : 'created'
  }
  return 'refused'
}

export async function checkAndCount(
  store: CounterStore,
  opts: { ip: string, salt: string, ctx: string, now: Date, perIpLimit?: number, globalLimit?: number },
): Promise<LimitResult> {
  const { ip, salt, ctx, now, perIpLimit = 10, globalLimit = 300 } = opts
  if (typeof salt !== 'string' || salt === '') throw new Error('ratelimit: salt must be a non-empty string')
  const iso = now.toISOString() // always UTC
  const ipPrefix = `${ctx}/ip/`
  const ipKey = `${ipPrefix}${iso.slice(0, 13)}/${await hashIp(normalizeIp(ip), salt)}`

  // ip first, so a burst refused for ip never burns global budget
  const ipRes = await reserve(store, ipKey, perIpLimit)
  if (ipRes === 'refused') return { allowed: false, reason: 'ip' }
  if ((await reserve(store, `${ctx}/global/${iso.slice(0, 10)}`, globalLimit)) === 'refused') {
    return { allowed: false, reason: 'global' }
  }

  // Best-effort prune, once per new ip key. Keep the current hour and the two before it.
  if (ipRes === 'created') {
    try {
      const cutoff = new Date(now.getTime() - 2 * 3600_000).toISOString().slice(0, 13)
      const { blobs } = await store.list({ prefix: ipPrefix })
      await Promise.all(blobs
        .filter(({ key }) => key.slice(ipPrefix.length, ipPrefix.length + 13) < cutoff)
        .map(({ key }) => store.delete(key)))
    } catch { /* the request is already counted */ }
  }
  return { allowed: true }
}
