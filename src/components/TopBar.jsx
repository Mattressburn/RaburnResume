import { useEffect, useState } from 'react'
import { site } from '../data/site'

const links = [
  ['System', '#system'],
  ['Experience', '#experience'],
  ['Projects', '#projects'],
  ['Stack', '#stack'],
  ['Contact', '#contact'],
]

// Visible once the hero's bottom sentinel has scrolled above the viewport.
export default function TopBar() {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = document.getElementById('hero-end')
    if (!el) return
    const io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting && e.boundingClientRect.top < 0))
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <header
      className={`fixed top-0 inset-x-0 z-40 border-b border-line bg-bg/90 backdrop-blur transition-opacity duration-150 ${
        shown ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      inert={!shown}
    >
      <nav aria-label="Primary" className="max-w-page mx-auto px-4 sm:px-6 h-12 flex items-center gap-6">
        <a href="#top" aria-label="Matthew Raburn" className="font-display font-extrabold text-[15px]">
          MR
        </a>
        <div className="hidden md:flex gap-5 font-mono text-[11px] uppercase tracking-[.1em] text-fg2">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="hover:text-fg">
              {label}
            </a>
          ))}
        </div>
        <a
          href={site.contact.resume}
          download
          className="ml-auto rounded-md border border-line2 px-3 py-1.5 text-[12px] font-semibold"
        >
          Resume PDF
        </a>
      </nav>
    </header>
  )
}
