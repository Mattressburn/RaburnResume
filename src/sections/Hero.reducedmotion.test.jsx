import { render } from '@testing-library/react'
import { LazyMotion, domAnimation } from 'framer-motion'
import Hero from './Hero'

// Reduced motion on, desktop width so the full diagram renders.
beforeEach(() => {
  window.matchMedia = (q) => ({ matches: q.includes('reduce') || q.includes('min-width'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })
})

test('under reduced motion the hero renders in its final state with nothing moving', () => {
  const { container } = render(<LazyMotion features={domAnimation} strict><Hero /></LazyMotion>)
  const h1 = container.querySelector('h1')
  expect(h1).toHaveTextContent('Production RAG.')
  const inner = [...h1.querySelectorAll('span span')]
  expect(inner.length).toBeGreaterThan(0)
  for (const s of inner) expect(s.style.transform).toBe('')
  expect([...container.querySelectorAll('span.tabular')].map((s) => s.textContent)).toEqual(['1M+', '8', '1,000+', '4x+'])
  expect(container.querySelectorAll('path.pulse').length).toBe(0)
  expect(container.querySelector('img[src="/media/hero-poster.jpg"]')).not.toBeNull()
  expect(container.querySelector('video')).toBeNull()
})
