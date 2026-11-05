import { render, screen } from '@testing-library/react'
import App from './App'
import { site } from './data/site'

const headings = ['A production RAG assistant', 'Experience', 'Projects', 'Stack', 'Hiring for applied AI']

test('renders every section heading and the hero headline', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Production RAG.')
  for (const h of headings) expect(screen.getByRole('heading', { name: new RegExp(h, 'i') })).toBeInTheDocument()
})

test('no product name in visible text before the Experience heading', () => {
  const { container } = render(<App />)
  const exp = container.querySelector('#experience')
  const before = []
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let n
  while ((n = walker.nextNode())) {
    if (exp.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING) before.push(n.textContent)
  }
  expect(before.join(' ').toLowerCase()).not.toContain('rumil')
  expect(container.querySelector('#experience').textContent).toContain('Rumil')
})

test('growth and tool-mix figures render once each, in the chart cards, with none dropped', () => {
  const { container } = render(<App />)
  const text = container.querySelector('#system').textContent
  const count = (s) => text.split(s).length - 1
  for (const g of site.system.numbers.filter((g) => /^(Growth|Tool mix)/.test(g.name))) {
    for (const i of g.items) expect(count(i.display), i.display).toBeGreaterThanOrEqual(1)
  }
  expect(count('around 300 → around 850 → around 1,100')).toBe(1)
  expect(count('over 1,300')).toBe(1)
  expect(count('around 700')).toBe(1)
})
