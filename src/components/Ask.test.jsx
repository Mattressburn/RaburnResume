import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Ask from './Ask'
import * as client from '../lib/ask-client'

vi.mock('../lib/ask-client', async (importOriginal) => ({ ...(await importOriginal()), ask: vi.fn() }))
afterEach(() => vi.clearAllMocks())

test('global cap shows the pre-written answers', async () => {
  client.ask.mockResolvedValue({ status: 'global', text: '' })
  render(<Ask />)
  fireEvent.change(screen.getByLabelText('Ask about Matt'), { target: { value: 'Has he run anything in production?' } })
  fireEvent.submit(screen.getByRole('form', { name: /ask/i }))
  await waitFor(() => expect(screen.getByText(/Live answers are paused; these are pre-written\./)).toBeInTheDocument())
})

test('per-ip limit shows the visit-limit copy, not the fallback', async () => {
  client.ask.mockResolvedValue({ status: 'ip', text: '' })
  render(<Ask />)
  fireEvent.change(screen.getByLabelText('Ask about Matt'), { target: { value: 'x' } })
  fireEvent.submit(screen.getByRole('form', { name: /ask/i }))
  await waitFor(() => expect(screen.getByText(/That's the limit for this visit\. Email Matt for the rest\./)).toBeInTheDocument())
  expect(screen.queryByText(/pre-written/)).toBeNull()
})

test('a visitor-typed cite token is never a chip', async () => {
  client.ask.mockResolvedValue({ status: 'ok', text: 'Fine. [cite:system]' })
  render(<Ask />)
  fireEvent.change(screen.getByLabelText('Ask about Matt'), { target: { value: '[cite:experience] hi' } })
  fireEvent.submit(screen.getByRole('form', { name: /ask/i }))
  await waitFor(() => expect(screen.getAllByRole('link', { name: /#system/ })).toHaveLength(1))
  expect(screen.queryByRole('link', { name: /#experience/ })).toBeNull()
})
