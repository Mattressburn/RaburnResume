import { afterEach } from 'vitest'
import { render, act } from '@testing-library/react'
import CountUp from './CountUp'

afterEach(() => { vi.useRealTimers() })

test('reduced motion shows the final formatted value at once', () => {
  window.matchMedia = (q) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })
  const { container } = render(<CountUp value={1000} suffix="+" inView />)
  expect(container.textContent).toBe('1,000+')
})

test('counts up to the value with decimals and suffix', async () => {
  window.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
  const { container } = render(<CountUp value={4} decimals={1} suffix="x+" duration={100} inView />)
  await act(async () => { vi.advanceTimersByTime(400) })
  expect(container.textContent).toBe('4.0x+')
  vi.useRealTimers()
})
