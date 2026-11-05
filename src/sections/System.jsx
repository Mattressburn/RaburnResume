import { site } from '../data/site'
import Card from '../components/Card'
import Reveal from '../components/Reveal'
import CountUp from '../components/CountUp'
import Eyebrow from '../components/Eyebrow'
import RequestPath from '../components/RequestPath'
import Sparkline from '../components/Sparkline'
import BarStrip from '../components/BarStrip'

const BARE = /^(\d[\d,]*(?:\.\d+)?)(.*)$/

function Num({ display }) {
  const m = BARE.exec(display)
  if (!m || /\s/.test(m[2]) || m[2].includes('→')) return display
  const decimals = (m[1].split('.')[1] || '').length
  return <CountUp value={Number(m[1].replace(/,/g, ''))} decimals={decimals} suffix={m[2]} />
}

const around = (n) => `around ${n.toLocaleString('en-US')}`

function Items({ items }) {
  return (
    <ul>
      {items.map((i) => (
        <li key={i.label} className="py-1.5">
          <span className="font-mono text-[15px] tabular"><Num display={i.display} /></span>
          <span className="block text-[13px] text-fg2">{i.label}</span>
        </li>
      ))}
    </ul>
  )
}

export default function System() {
  const s = site.system
  const growthText = s.growth.values.map(around).join(' → ')
  // Growth and tool mix render once, as the chart cards; their items that a chart already shows as text are left out.
  const charted = new Set([growthText, ...s.toolMix.map((t) => around(t.value))])
  const growthGroup = s.numbers.find((g) => g.name === 'Growth')
  const toolGroup = s.numbers.find((g) => g.name.startsWith('Tool mix'))
  const gridGroups = s.numbers.filter((g) => g !== growthGroup && g !== toolGroup)
  const rest = (g) => g.items.filter((i) => !charted.has(i.display))
  const [pre, post] = s.closing.split(s.caseStudy.label)
  return (
    <section id="system" className="py-20">
      <Eyebrow>{s.eyebrow}</Eyebrow>
      <Reveal as="h2" className="font-display font-extrabold text-[32px] lg:text-[40px] tracking-[-0.03em] max-w-[24ch]">{s.heading}</Reveal>
      <Reveal as="p" className="text-fg2 max-w-[68ch] mt-6">{s.problem}</Reveal>
      <Reveal as="p" className="text-fg2 max-w-[68ch] mt-4">{s.what}</Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
        {gridGroups.map((g, gi) => (
          <Reveal key={g.name} delay={(gi % 3) * 0.06}>
          <Card className="h-full">
            <h3 className="font-mono text-[11px] tracking-[.1em] uppercase text-fg3 mb-3">{g.name}</h3>
            <Items items={g.items} />
          </Card>
          </Reveal>
        ))}
      </div>
      <p className="font-mono text-[11px] text-fg3 mt-3">{s.numbersCaption}</p>

      <Reveal className="mt-10">
        <Card>
          <div data-slot="system-diagram">
            <RequestPath size="full" animate />
          </div>
        </Card>
      </Reveal>

      <div className="mt-6 max-w-[68ch]">
        {s.infra.map((i) => (
          <details key={i.label} className="border-b border-line py-3">
            <summary className="cursor-pointer font-mono text-[13px]">{i.label}</summary>
            <p className="text-fg2 text-[14px] mt-2">{i.why}</p>
          </details>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 mt-10">
        <Reveal>
          <Card className="h-full">
            <h3 className="font-mono text-[11px] tracking-[.1em] uppercase text-fg3 mb-3">{growthGroup.name}</h3>
            <Sparkline labels={s.growth.labels} values={s.growth.values} animate />
            <p className="font-mono text-[13px] text-fg2 mt-3">{growthText} questions, August to October</p>
            <div className="mt-2">
              <Items items={rest(growthGroup)} />
            </div>
          </Card>
        </Reveal>
        <Reveal delay={0.06}>
          <Card className="h-full">
            <h3 className="font-mono text-[11px] tracking-[.1em] uppercase text-fg3 mb-3">{toolGroup.name}</h3>
            <Items items={rest(toolGroup)} />
            <div className="mt-3">
              <BarStrip items={s.toolMix} animate />
            </div>
          </Card>
        </Reveal>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-10">
        {s.incidents.map((i, ii) => (
          <Reveal key={i.title} delay={ii * 0.06}>
          <Card className="h-full">
            <h3 className="font-display font-bold text-[16px]">{i.title}</h3>
            <p className="text-fg2 text-[14px] mt-2">{i.body}</p>
          </Card>
          </Reveal>
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
