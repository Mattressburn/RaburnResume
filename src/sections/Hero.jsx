import { site } from '../data/site'
import Reveal from '../components/Reveal'
import MaskedLines from '../components/MaskedLines'
import CountUp from '../components/CountUp'
import { heroTimings } from '../lib/motion'
import { btn } from '../components/buttonClass'

export default function Hero() {
  const { hero } = site
  return (
    <section id="top" className="pt-16 pb-20">
      <div className="grid lg:grid-cols-[52fr_48fr] gap-10">
        <div>
          <Reveal as="p" delay={heroTimings.status} className="font-mono text-[11px] tracking-[.1em] uppercase text-accent flex items-center gap-2 mb-6">
            <span aria-hidden="true" className="inline-block w-[7px] h-[7px] rounded-full bg-accent shrink-0" />
            {hero.status}
          </Reveal>
          <h1 className="font-display font-extrabold text-[40px] lg:text-[60px] leading-none tracking-[-0.035em]">
            <MaskedLines lines={hero.headline} accentWord={hero.accentWord} delay={heroTimings.headline} />
          </h1>
          <Reveal as="p" delay={heroTimings.lede} className="text-fg2 max-w-[46ch] mt-6">{hero.lede}</Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-7 mt-8">
            {hero.metrics.map((m, i) => (
              <Reveal key={m.label} delay={heroTimings.metrics + i * heroTimings.metricsStagger}>
                <div className="font-mono text-[26px]">
                  <CountUp value={m.value} decimals={m.decimals} suffix={m.suffix} inView startDelay={heroTimings.countDelay * 1000} duration={heroTimings.countDuration * 1000} />
                </div>
                <div className="text-[11px] uppercase text-fg3">{m.label}</div>
              </Reveal>
            ))}
          </div>
          <p className="font-mono text-[11px] text-fg3 mt-3">{hero.metricsCaption}</p>
          <Reveal delay={heroTimings.actions} className="flex flex-wrap gap-3 mt-8">
            {hero.actions.map((a) => (
              <a
                key={a.label}
                href={a.href}
                className={`${btn} ${a.kind === 'primary' ? 'bg-accent text-bg' : 'border border-line2'}`}
                {...(a.download ? { download: true } : {})}
                {...(a.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {a.label}
              </a>
            ))}
          </Reveal>
          <Reveal delay={heroTimings.actions}>
            <div data-slot="ask" />
          </Reveal>
        </div>
        <Reveal delay={heroTimings.diagram} className="order-last">
          <div data-slot="diagram" />
        </Reveal>
      </div>
      <div id="hero-end" aria-hidden="true" />
    </section>
  )
}
