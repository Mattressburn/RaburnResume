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

const askQ = (q) => {
  fireEvent.change(screen.getByLabelText('Ask about Matt'), { target: { value: q } })
  fireEvent.submit(screen.getByRole('form', { name: /ask/i }))
}

test('prototype-member text does not crash the paused path', async () => {
  client.ask.mockResolvedValue({ status: 'global', text: '' })
  render(<Ask />)
  askQ('constructor')
  await waitFor(() => expect(screen.getByText(/Can't answer live right now\. Email Matt\./)).toBeInTheDocument())
})

test('an empty 200 shows a visible line and stays out of history as empty', async () => {
  client.ask.mockResolvedValue({ status: 'ok', text: '' })
  render(<Ask />)
  askQ('hello')
  await waitFor(() => expect(screen.getByText('No answer was produced.')).toBeInTheDocument())
  fireEvent.change(screen.getByLabelText('Your question'), { target: { value: 'again' } })
  fireEvent.submit(screen.getByRole('form', { name: /follow-up/i }))
  await waitFor(() => expect(client.ask).toHaveBeenCalledTimes(2))
  expect(client.ask.mock.calls[1][0].every((x) => x.content !== '')).toBe(true)
})

test('paused answers do not count toward the cap', async () => {
  client.ask.mockResolvedValue({ status: 'paused', text: '' })
  render(<Ask />)
  askQ('Has he run anything in production?')
  await waitFor(() => expect(screen.getByText(/pre-written/)).toBeInTheDocument())
  expect(screen.getByText('0 of 6')).toBeInTheDocument()
})

test('closing the panel aborts the request and drops the unanswered turn', async () => {
  client.ask.mockImplementation((_h, { signal }) => new Promise((resolve) => {
    signal.addEventListener('abort', () => resolve({ status: 'aborted', text: '' }))
  }))
  render(<Ask />)
  askQ('hello')
  await waitFor(() => expect(client.ask).toHaveBeenCalledTimes(1))
  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(client.ask.mock.calls[0][1].signal.aborted).toBe(true)
  askQ('again')
  await waitFor(() => expect(client.ask).toHaveBeenCalledTimes(2))
  expect(client.ask.mock.calls[1][0]).toEqual([{ role: 'user', content: 'again' }])
  expect(screen.getByText('1 of 6')).toBeInTheDocument()
})

test('an about cite is a plain chip, not a link, since there is no about section on the page', async () => {
  client.ask.mockResolvedValue({ status: 'ok', text: 'Steady. [cite:about]' })
  render(<Ask />)
  askQ("What's he like?")
  await waitFor(() => expect(screen.getByText('About Matt')).toBeInTheDocument())
  expect(screen.queryByRole('link', { name: 'About Matt' })).toBeNull()
})
