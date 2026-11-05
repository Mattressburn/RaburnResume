// Generate the hero ambient loop through the ArtCraft Omni API and download the mp4.
// Usage: node --env-file=.env.artcraft scripts/gen-hero-loop.mjs <out-dir> [model]
// (reads ARTCRAFT_API_KEY from the environment)
//
// The committed assets in public/media were derived from the downloaded mp4 with:
//   webm:   ffmpeg -i hero-loop.mp4 -vf "scale=1280:720,fade=t=out:st=7.4:d=0.6" -c:v libvpx-vp9 -b:v 0 -crf 38 -row-mt 1 -an hero-loop.webm
//   mp4:    ffmpeg -i hero-loop.mp4 -vf "scale=1280:720,fade=t=out:st=7.4:d=0.6" -c:v libx264 -crf 30 -preset slow -pix_fmt yuv420p -an -movflags +faststart hero-loop.mp4
//   poster: ffmpeg -i hero-loop.mp4 -ss 4 -frames:v 1 hero-poster.jpg
import { writeFileSync, mkdirSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'

const [outDir, modelArg] = process.argv.slice(2)
const key = process.env.ARTCRAFT_API_KEY
if (!key) { console.error('no key'); process.exit(2) }
mkdirSync(outDir, { recursive: true })

const BASE = 'https://api.storyteller.ai'
const headers = { Authorization: `Bearer ${key}`, 'content-type': 'application/json' }
const prompt = 'Abstract slow-motion loop, near-black background, faint amber and slate light trails drifting diagonally like data moving along fiber, very low contrast, seamless loop, no text, no objects, 16:9, 8 seconds.'

async function generate(model) {
  const body = {
    model, prompt, duration_seconds: 8, aspect_ratio: 'wide_sixteen_by_nine', resolution: 'ten_eighty_p',
    generate_audio: false, idempotency_token: randomUUID(),
  }
  const r = await fetch(`${BASE}/v1/omni_api/generate/video`, { method: 'POST', headers, body: JSON.stringify(body) })
  const j = await r.json().catch(() => ({}))
  console.log('generate', model, r.status, JSON.stringify(j).slice(0, 300))
  if (!r.ok || !j.inference_job_token) throw new Error(`generate failed: ${r.status}`)
  return j.inference_job_token
}

async function poll(token) {
  for (let i = 0; i < 120; i++) {
    const r = await fetch(`${BASE}/v1/omni_api/job_status/job/${token}`, { headers })
    const j = await r.json().catch(() => ({}))
    const st = j?.state?.status?.status
    console.log(new Date().toISOString(), 'status', st, j?.state?.status?.progress_percentage ?? '')
    if (st === 'complete_success') return j.state.maybe_result.media_links.cdn_url
    if (['complete_failure', 'dead', 'cancelled_by_user', 'cancelled_by_system'].includes(st)) throw new Error(`job ${st}: ${JSON.stringify(j?.state?.status).slice(0, 300)}`)
    await new Promise(res => setTimeout(res, 10000))
  }
  throw new Error('timeout')
}

const models = modelArg ? [modelArg] : ['veo_3p1_fast', 'kling_2p6_pro']
let url
for (const m of models) {
  try { url = await poll(await generate(m)); break } catch (e) { console.error(m, 'failed:', e.message) }
}
if (!url) process.exit(1)
const out = join(outDir, 'hero-loop.mp4')
const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
writeFileSync(out, buf)
console.log('wrote', out, buf.length, 'bytes from', url)
