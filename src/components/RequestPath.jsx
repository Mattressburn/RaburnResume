import { useId, useState, useSyncExternalStore } from 'react'
import { site } from '../data/site'
import { useReducedMotionPref } from '../lib/motion'
import Tooltip from './Tooltip'

const WIDE = '(min-width: 640px)'
const hasMM = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function'
const subscribe = (cb) => {
  if (!hasMM()) return () => {}
  const mq = window.matchMedia(WIDE)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
// No matchMedia (jsdom without a stub): fall back to the desktop layout.
const isWide = () => !hasMM() || window.matchMedia(WIDE).matches

// An edge as [x, y] waypoints: the layout's hand-drawn route, else straight between the box centers.
export function routeOf(edge, layout) {
  const r = layout.routes?.[`${edge.from}>${edge.to}`]
  if (r) return r
  const a = layout.pos[edge.from]
  const b = layout.pos[edge.to]
  const x = a.x + a.w / 2
  return b.y > a.y ? [[x, a.y + a.h], [x, b.y]] : [[x, a.y], [x, b.y + b.h]]
}

const toD = (pts) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join('')

// Static 6-unit marker centered at half the route's length, along the segment it lands on.
function midDash(pts) {
  const segs = pts.slice(1).map((b, i) => [pts[i], b, Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1])])
  let half = segs.reduce((s, g) => s + g[2], 0) / 2
  for (const [a, b, len] of segs) {
    if (half <= len) {
      const ux = (b[0] - a[0]) / len
      const uy = (b[1] - a[1]) / len
      const mx = a[0] + ux * half
      const my = a[1] + uy * half
      return toD([[mx - ux * 3, my - uy * 3], [mx + ux * 3, my + uy * 3]])
    }
    half -= len
  }
  return ''
}

export default function RequestPath({ size = 'card', animate = true }) {
  const wide = useSyncExternalStore(subscribe, isWide)
  const reduced = useReducedMotionPref()
  const pulse = animate && !reduced
  const [open, setOpen] = useState(null)
  const uid = useId()
  const L = site.diagram.layouts[wide ? 'desktop' : 'phone']
  const [vw, vh] = L.viewBox
  const tipId = (id) => `${uid}-why-${id}`
  const close = (id) => setOpen((o) => (o === id ? null : o))

  return (
    <div className={`relative ${size === 'full' ? 'max-w-[640px] mx-auto' : ''}`}>
      <svg role="img" aria-label="Request path through the assistant" viewBox={`0 0 ${vw} ${vh}`} className="block w-full h-auto font-mono">
        {site.diagram.edges.map((e) => {
          const pts = routeOf(e, L)
          return (
            <g key={`${e.from}>${e.to}`}>
              <path d={toD(pts)} fill="none" stroke="var(--line-2)" strokeWidth={1.5} />
              {pulse ? (
                <path d={toD(pts)} className="pulse" style={{ animationDelay: `${e.delay}s` }} />
              ) : (
                <path d={midDash(pts)} fill="none" stroke="var(--accent)" strokeWidth={1.5} />
              )}
            </g>
          )
        })}
        {site.diagram.nodes.map((n) => {
          const p = L.pos[n.id]
          if (n.kind === 'label') {
            return (
              <text key={n.id} x={p.x} y={p.y + p.h - 3} fontSize={9.5} fill="var(--fg-3)">
                {n.label}
              </text>
            )
          }
          const cx = p.x + p.w / 2
          const base = n.sub ? p.y + p.h / 2 - 2 : p.y + p.h / 2 + 4
          const body = (
            <>
              <rect x={p.x} y={p.y} width={p.w} height={p.h} rx={4} fill="var(--bg-2)" stroke="var(--line-2)" />
              <text x={cx} y={base} fontSize={11} fill="var(--fg)" textAnchor="middle">
                {n.label}
              </text>
              {n.sub && (
                <text x={cx} y={base + 12} fontSize={9.5} fill="var(--fg-3)" textAnchor="middle">
                  {n.sub}
                </text>
              )}
            </>
          )
          if (!n.why) return <g key={n.id}>{body}</g>
          return (
            <g
              key={n.id}
              role="button"
              tabIndex={0}
              aria-describedby={tipId(n.id)}
              className="node cursor-pointer"
              onMouseEnter={() => setOpen(n.id)}
              onMouseLeave={() => close(n.id)}
              onFocus={() => setOpen(n.id)}
              onBlur={() => close(n.id)}
              // Click opens rather than toggles: a tap fires focus then click, and a toggle would shut it again.
              onClick={() => setOpen(n.id)}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.preventDefault()
                  setOpen((o) => (o === n.id ? null : n.id))
                } else if (ev.key === 'Escape') close(n.id)
              }}
            >
              {body}
            </g>
          )
        })}
      </svg>
      {site.diagram.nodes
        .filter((n) => n.why)
        .map((n) => (
          <Tooltip key={n.id} id={tipId(n.id)} text={n.why} open={open === n.id} anchorRect={{ ...L.pos[n.id], vw, vh }} />
        ))}
    </div>
  )
}
