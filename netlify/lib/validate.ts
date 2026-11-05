export type Message = { role: 'user' | 'assistant'; content: string }
export type ValidateResult =
  | { ok: true; messages: Message[] }
  | { ok: false; status: 400; error: string }

const MAX_MESSAGES = 12
const MAX_USER_TURNS = 6
const MAX_USER_CHARS = 500
const MAX_ASSISTANT_CHARS = 2000

const bad = (error: string): ValidateResult => ({ ok: false, status: 400, error })

export function validateBody(json: unknown): ValidateResult {
  const raw = (json as { messages?: unknown } | null)?.messages
  if (!Array.isArray(raw)) return bad('messages must be an array')
  if (raw.length < 1 || raw.length > MAX_MESSAGES) return bad(`messages must have 1 to ${MAX_MESSAGES} entries`)

  const messages: Message[] = []
  let userTurns = 0
  for (let i = 0; i < raw.length; i++) {
    const m = raw[i] as { role?: unknown; content?: unknown } | null
    const expected = i % 2 === 0 ? 'user' : 'assistant'
    if (m?.role !== expected) return bad(`message ${i} must have role ${expected}`)
    if (typeof m.content !== 'string') return bad(`message ${i} content must be a string`)
    const content = m.content.trim()
    if (!content) return bad(`message ${i} content must not be empty`)
    if (expected === 'user') {
      if (++userTurns > MAX_USER_TURNS) return bad(`at most ${MAX_USER_TURNS} user messages allowed`)
      if (content.length > MAX_USER_CHARS) return bad(`user message ${i} exceeds ${MAX_USER_CHARS} characters`)
    } else if (content.length > MAX_ASSISTANT_CHARS) {
      return bad(`assistant message ${i} exceeds ${MAX_ASSISTANT_CHARS} characters`)
    }
    messages.push({ role: expected, content })
  }
  if (messages[messages.length - 1].role !== 'user') return bad('last message must have role user')
  return { ok: true, messages }
}
