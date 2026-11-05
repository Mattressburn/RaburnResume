// Shaped like the @netlify/blobs Store so the function can pass the real store in.
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

async function read(store: CounterStore, key: string) {
  const got = await store.getWithMetadata(key)
  return { count: got ? Number(got.data) || 0 : 0, etag: got?.etag, exists: got !== null }
}

// Conditional increment, re-reading on conflict. Gives up after MAX_ATTEMPTS (the request still
// goes through; an undercount under heavy contention beats failing a visitor's question).
async function increment(store: CounterStore, key: string): Promise<void> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const cur = await read(store, key)
    const value = String(cur.count + 1)
    const res = await store.set(key, value, cur.exists && cur.etag ? { onlyIfMatch: cur.etag } : { onlyIfNew: true })
    if (res.modified) return
  }
}

export async function checkAndCount(
  store: CounterStore,
  opts: { ip: string, salt: string, ctx: string, now: Date, perIpLimit?: number, globalLimit?: number },
): Promise<LimitResult> {
  const { ip, salt, ctx, now, perIpLimit = 10, globalLimit = 300 } = opts
  const iso = now.toISOString() // always UTC
  const globalKey = `${ctx}/global/${iso.slice(0, 10)}`
  const hour = iso.slice(0, 13)
  const ipPrefix = `${ctx}/ip/`
  const ipKey = `${ipPrefix}${hour}/${await hashIp(ip, salt)}`

  if ((await read(store, globalKey)).count >= globalLimit) return { allowed: false, reason: 'global' }
  if ((await read(store, ipKey)).count >= perIpLimit) return { allowed: false, reason: 'ip' }

  await increment(store, globalKey)
  await increment(store, ipKey)

  // Keep the current and previous two hours; the hour segment sorts lexically.
  const cutoff = new Date(now.getTime() - 2 * 3600_000).toISOString().slice(0, 13)
  const { blobs } = await store.list({ prefix: ipPrefix })
  for (const { key } of blobs) {
    if (key.slice(ipPrefix.length, ipPrefix.length + 13) < cutoff) await store.delete(key)
  }
  return { allowed: true }
}
