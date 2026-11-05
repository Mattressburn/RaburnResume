import { useRef, useState } from 'react'
import { site } from '../data/site'
import { btn } from './buttonClass'
import { LIMITS } from '../lib/ask-client'
import AskPanel from './AskPanel'

function dayOfYear(d = new Date()) {
  return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000)
}

export default function Ask() {
  const { placeholder, suggestions } = site.ask
  const [value, setValue] = useState('')
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState(null)
  const inputRef = useRef(null)
  const day = useRef(dayOfYear()).current
  const chips = [0, 1, 2].map((i) => suggestions[(i + day) % suggestions.length])

  const submit = (q) => {
    const text = q.trim()
    if (!text) return
    setQuestion(text)
    setOpen(true)
    setValue('')
  }
  const close = () => {
    setOpen(false)
    setQuestion(null)
    // the panel's inert/portal teardown runs in its effect cleanup; focus after it
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div className="mt-8">
      <form aria-label="Ask about Matt form" onSubmit={(e) => { e.preventDefault(); submit(value) }} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={value}
          maxLength={LIMITS.maxChars}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Ask about Matt"
          placeholder={placeholder}
          className="flex-1 min-w-0 rounded-md border border-line2 bg-bg2 px-3 py-[11px] text-[13px] text-fg placeholder:text-fg3"
        />
        <button type="submit" className={`${btn} bg-accent text-bg`}>Ask</button>
      </form>
      <div className="flex flex-wrap gap-2 mt-3">
        {chips.map((q) => (
          <button key={q} type="button" onClick={() => submit(q)} className="rounded-full border border-line2 px-3 py-1 text-[12px] text-fg2 hover:text-fg">
            {q}
          </button>
        ))}
      </div>
      <AskPanel open={open} initialQuestion={question} onClose={close} />
    </div>
  )
}
