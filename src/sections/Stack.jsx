import { site } from '../data/site'
import Chip from '../components/Chip'
import Reveal from '../components/Reveal'
import Eyebrow from '../components/Eyebrow'

export default function Stack() {
  return (
    <section id="stack" className="py-20">
      <Eyebrow>04 · Stack</Eyebrow>
      <Reveal as="h2" className="font-display font-extrabold text-[32px] lg:text-[40px] tracking-[-0.03em]">Stack</Reveal>
      <div className="mt-8 grid gap-6">
        {site.stack.map((g, idx) => (
          <Reveal key={g.group} delay={idx * 0.06}>
            <h3 className="font-mono text-[11px] tracking-[.1em] uppercase text-fg3 mb-2">{g.group}</h3>
            <div className="flex flex-wrap gap-2">
              {g.items.map((i) => (
                <Chip key={i}>{i}</Chip>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
      <p className="text-fg2 mt-8">{site.stackNote}</p>
    </section>
  )
}
