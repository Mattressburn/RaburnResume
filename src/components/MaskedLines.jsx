import { m } from 'framer-motion'
import { ease, useReducedMotionPref } from '../lib/motion'

function renderLine(line, accentWord) {
  if (!accentWord || !line.includes(accentWord)) return line
  const [a, b] = line.split(accentWord)
  return (
    <>
      {a}
      <span className="text-accent">{accentWord}</span>
      {b}
    </>
  )
}

export default function MaskedLines({ lines, accentWord, className = '', delay = 0 }) {
  const reduced = useReducedMotionPref()
  return lines.map((line, i) => (
    <span key={line} className={`block overflow-hidden pb-[0.08em] -mb-[0.08em] ${className}`}>
      {reduced ? (
        <span className="block">{renderLine(line, accentWord)}</span>
      ) : (
        <m.span
          className="block"
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          transition={{ duration: 0.9, ease, delay: delay + i * 0.08 }}
        >
          {renderLine(line, accentWord)}
        </m.span>
      )}
    </span>
  ))
}
