import { render } from '@testing-library/react'
import { LazyMotion, domAnimation } from 'framer-motion'
import Reveal from './Reveal'

function mockReduced(matches) {
  window.matchMedia = (q) => ({ matches: matches && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })
}

test('reduced motion renders children visible with no transform', () => {
  mockReduced(true)
  const { getByText } = render(<LazyMotion features={domAnimation}><Reveal><p>Hello</p></Reveal></LazyMotion>)
  const el = getByText('Hello').parentElement
  expect(el.style.opacity === '' || el.style.opacity === '1').toBe(true)
  expect(el.style.transform).toBe('')
})

test('normal motion starts hidden', () => {
  mockReduced(false)
  const { getByText } = render(<LazyMotion features={domAnimation}><Reveal><p>Hello</p></Reveal></LazyMotion>)
  expect(getByText('Hello').parentElement.style.opacity).toBe('0')
})
