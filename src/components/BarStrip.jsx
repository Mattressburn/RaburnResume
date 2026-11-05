import { m } from 'framer-motion'
import { ease, useReducedMotionPref } from '../lib/motion'

export default function BarStrip({ items, animate }) {
  const reduced = useReducedMotionPref()
  const grow = animate && !reduced
  const max = Math.max(...items.map((i) => i.value))
  return (
    <ul className="space-y-2.5">
      {items.map((it) => {
        const bar = { className: 'h-full rounded-sm bg-accent opacity-80 origin-left', style: { width: `${(it.value / max) * 100}%` } }
        return (
          <li key={it.label} className="flex items-center gap-3">
            <div className="flex-1 h-2">
              {grow ? (
                <m.div {...bar} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, ease }} />
              ) : (
                <div {...bar} />
              )}
            </div>
            <span className="shrink-0 w-[22ch] whitespace-nowrap font-mono text-[12px] text-fg2">
              {it.label} <span className="text-fg tabular">around {it.value.toLocaleString('en-US')}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
