import { m } from 'framer-motion'
import { ease, useReducedMotionPref } from '../lib/motion'

export default function Reveal({ children, delay = 0, as = 'div', className }) {
  const reduced = useReducedMotionPref()
  if (reduced) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }
  const Comp = m[as]
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease, delay }}
    >
      {children}
    </Comp>
  )
}
