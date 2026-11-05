import { render, screen } from '@testing-library/react'
import App from './App'

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
