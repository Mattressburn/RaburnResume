import { m } from 'framer-motion'
import { ease, useReducedMotionPref } from '../lib/motion'

const W = 160
const H = 48

export default function Sparkline({ labels, values, animate }) {
  const reduced = useReducedMotionPref()
  const draw = animate && !reduced
  const max = Math.max(...values)
  // Zero-based y so the slope is honest; x inset 16 so the centered labels stay inside.
  const pts = values.map((v, i) => [16 + (i * (W - 32)) / (values.length - 1), 32 - (v / max) * 28])
  const points = pts.map((p) => p.join(',')).join(' ')
  const Line = draw ? m.polyline : 'polyline'
  const motion = draw
    ? { initial: { pathLength: 0 }, whileInView: { pathLength: 1 }, viewport: { once: true }, transition: { duration: 0.6, ease } }
    : {}
  return (
    <svg role="img" viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="block font-mono">
      <title>{labels.map((l, i) => `${l} around ${values[i].toLocaleString('en-US')}`).join(', ')}</title>
      <Line points={points} fill="none" stroke="var(--accent)" strokeWidth={1.5} {...motion} />
      {pts.map(([x, y], i) => (
        <g key={labels[i]}>
          <circle cx={x} cy={y} r={2} fill="var(--accent)" />
          <text x={x} y={H - 2} fontSize={10} textAnchor="middle" fill="var(--fg-3)">
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  )
}
