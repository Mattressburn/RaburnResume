import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { useReducedMotionPref } from '../lib/motion'

// inView=true starts the count on mount (hero); otherwise it starts when scrolled into view.
export default function CountUp({ value, decimals = 0, suffix = '', duration = 1200, startDelay = 0, inView = false }) {
  const reduced = useReducedMotionPref()
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, amount: 0.5 })
  const go = inView || seen
  const [n, setN] = useState(reduced ? value : 0)

  useEffect(() => {
    if (reduced) {
      setN(value)
      return undefined
    }
    if (!go) return undefined
    let raf
    let t0
    const tick = () => {
      const p = Math.min((performance.now() - t0) / duration, 1)
      setN(value * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    const timer = setTimeout(() => {
      t0 = performance.now()
      raf = requestAnimationFrame(tick)
    }, startDelay)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(raf)
    }
  }, [go, reduced, value, duration, startDelay])

  const text = n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return (
    <span ref={ref} className="tabular">
      {text}
      {suffix}
    </span>
  )
}
