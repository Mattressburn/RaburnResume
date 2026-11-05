import { site } from '../data/site'
import Card from '../components/Card'
import Eyebrow from '../components/Eyebrow'

export default function System() {
  const s = site.system
  const [pre, post] = s.closing.split(s.caseStudy.label)
  return (
    <section id="system" className="py-20">
      <Eyebrow>{s.eyebrow}</Eyebrow>
      <h2 className="font-display font-extrabold text-[32px] lg:text-[40px] tracking-[-0.03em] max-w-[24ch]">{s.heading}</h2>
      <p className="text-fg2 max-w-[68ch] mt-6">{s.problem}</p>
      <p className="text-fg2 max-w-[68ch] mt-4">{s.what}</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {s.numbers.map((g) => (
          <Card key={g.name}>
            <h3 className="font-mono text-[11px] tracking-[.1em] uppercase text-fg3 mb-3">{g.name}</h3>
            <ul>
              {g.items.map((i) => (
                <li key={i.label} className="py-1.5">
                  <span className="font-mono text-[15px] tabular">{i.display}</span>
                  <span className="block text-[13px] text-fg2">{i.label}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
      <p className="font-mono text-[11px] text-fg3 mt-3">{s.numbersCaption}</p>

      <div data-slot="system-diagram" />

      <div className="mt-6 max-w-[68ch]">
        {s.infra.map((i) => (
          <details key={i.label} className="border-b border-line py-3">
            <summary className="cursor-pointer font-mono text-[13px]">{i.label}</summary>
            <p className="text-fg2 text-[14px] mt-2">{i.why}</p>
          </details>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-10">
        {s.incidents.map((i) => (
          <Card key={i.title}>
            <h3 className="font-display font-bold text-[16px]">{i.title}</h3>
            <p className="text-fg2 text-[14px] mt-2">{i.body}</p>
          </Card>
        ))}
      </div>
      <p className="text-fg2 text-[14px] mt-4">{s.heldBack}</p>
      <p className="text-fg2 max-w-[68ch] mt-6">{s.built}</p>
      <p className="mt-6">
        {pre}
        <a href={s.caseStudy.href} target="_blank" rel="noopener noreferrer" className="text-accent underline">
          {s.caseStudy.label}
        </a>
        {post}
      </p>
    </section>
  )
}
