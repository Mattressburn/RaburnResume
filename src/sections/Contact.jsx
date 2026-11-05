import { site } from '../data/site'
import Eyebrow from '../components/Eyebrow'

const btn = 'rounded-md px-4 py-[11px] text-[13px] font-semibold'

export default function Contact() {
  const c = site.contact
  return (
    <section id="contact" className="py-20">
      <Eyebrow>{c.eyebrow}</Eyebrow>
      <h2 className="font-display font-extrabold text-[32px] lg:text-[40px] tracking-[-0.03em] max-w-[24ch]">{c.line}</h2>
      <div className="flex flex-wrap gap-3 mt-8">
        <a href={`mailto:${c.email}`} className={`${btn} bg-accent text-bg`}>
          {c.email}
        </a>
        <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className={`${btn} border border-line2`}>
          LinkedIn
        </a>
        <a href={c.github} target="_blank" rel="noopener noreferrer" className={`${btn} border border-line2`}>
          GitHub
        </a>
        <a href={c.resume} download className={`${btn} border border-line2`}>
          Resume PDF
        </a>
      </div>
      <footer className="mt-16 pt-6 border-t border-line text-[12px] text-fg3">
        {c.footer}{' '}
        <a
          href="https://github.com/Mattressburn/RaburnResume"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          github.com/Mattressburn/RaburnResume
        </a>
      </footer>
    </section>
  )
}
