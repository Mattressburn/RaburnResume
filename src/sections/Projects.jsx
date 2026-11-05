import { site } from '../data/site'
import Card from '../components/Card'
import Chip from '../components/Chip'
import Reveal from '../components/Reveal'
import Eyebrow from '../components/Eyebrow'

export default function Projects() {
  return (
    <section id="projects" className="py-20">
      <Eyebrow>03 · Projects</Eyebrow>
      <Reveal as="h2" className="font-display font-extrabold text-[32px] lg:text-[40px] tracking-[-0.03em]">Projects</Reveal>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {site.projects.map((p, idx) => (
          <Reveal key={p.name} delay={(idx % 3) * 0.06}>
          <a href={p.href} target="_blank" rel="noopener noreferrer" className="block rounded-lg h-full">
            <Card interactive className="h-full">
              <h3 className="font-display font-bold text-[18px]">{p.name}</h3>
              <p className="text-fg2 text-[14px] mt-2">{p.blurb}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {p.stack.map((t) => (
                  <Chip key={t}>{t}</Chip>
                ))}
              </div>
            </Card>
          </a>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
