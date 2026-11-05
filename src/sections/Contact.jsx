import { site } from '../data/site'
import { btn } from '../components/buttonClass'
import Eyebrow from '../components/Eyebrow'

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
    </section>
  )
}
