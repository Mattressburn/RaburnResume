import { site } from '../data/site'
import Card from '../components/Card'
import Reveal from '../components/Reveal'
import Eyebrow from '../components/Eyebrow'

export default function Experience() {
  return (
    <section id="experience" className="py-20">
      <Eyebrow>02 · Experience</Eyebrow>
      <Reveal as="h2" className="font-display font-extrabold text-[32px] lg:text-[40px] tracking-[-0.03em]">Experience</Reveal>
      <div className="grid gap-4 mt-8">
        {site.experience.map((e, idx) => (
          <Reveal key={e.company} delay={idx * 0.06}>
          <Card>
            <h3 className="font-display font-bold text-[20px]">{e.company}</h3>
            <p className="font-mono text-[12px] text-fg3 mt-1">
              {e.title} · {e.period} · {e.location}
            </p>
            <ul className="mt-4 grid gap-2 text-fg2 text-[14px] list-disc pl-5 max-w-[80ch]">
              {e.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            {e.link && (
              <p className="mt-4 text-[14px]">
                <a href={e.link.href} target="_blank" rel="noopener noreferrer" className="text-accent underline">
                  {e.link.label}
                </a>
              </p>
            )}
          </Card>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
