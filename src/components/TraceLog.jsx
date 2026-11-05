import { useEffect, useState } from 'react'
import { heroTimings, useReducedMotionPref } from '../lib/motion'

const START = heroTimings.flow * 1000
const PER_CHAR = 18
const LATENCY = /\d+ ms/

// Line 0's latency token renders green, however much of it has been typed.
function paint(line, typed, i) {
  const m = i === 0 && LATENCY.exec(line)
  if (!m) return typed
  const end = m.index + m[0].length
  return (
    <>
      {typed.slice(0, m.index)}
      <span className="text-ok">{typed.slice(m.index, end)}</span>
      {typed.slice(end)}
    </>
  )
}

export default function TraceLog({ lines, animate }) {
  const reduced = useReducedMotionPref()
  const typing = animate && !reduced
  const total = lines.join('').length
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!typing) return undefined
    let raf
    const timer = setTimeout(() => {
      const t0 = performance.now()
      const tick = () => {
        const c = Math.min(total, Math.floor((performance.now() - t0) / PER_CHAR))
        setN(c)
        if (c < total) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, START)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [typing, total])

  const shown = typing ? n : total
  let start = 0
  return (
    <div className="font-mono text-[11px] leading-5 text-fg2">
      {lines.map((line, i) => {
        const from = start
        start += line.length
        const typed = line.slice(0, Math.max(0, shown - from))
        const active = shown >= from && (shown < from + line.length || i === lines.length - 1)
        return (
          <p key={i} className="relative whitespace-pre-wrap">
            <span className="sr-only">{line}</span>
            {/* The invisible copy reserves the finished line's space so typing never reflows the card. */}
            <span aria-hidden="true" className="invisible">{line}</span>
            <span aria-hidden="true" className="absolute inset-0">
              {paint(line, typed, i)}
              {active && (
                <span
                  className="inline-block w-[7px] h-[12px] bg-accent align-[-2px] ml-px"
                  style={typing ? { animation: 'blink 1s steps(2) infinite' } : undefined}
                />
              )}
            </span>
          </p>
        )
      })}
    </div>
  )
}
