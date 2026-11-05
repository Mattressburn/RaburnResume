import { site } from '../data/site'
import { btn } from '../components/buttonClass'

export default function Hero() {
  const { hero } = site
  return (
    <section id="top" className="pt-16 pb-20">
      <div className="grid lg:grid-cols-[52fr_48fr] gap-10">
        <div>
          <p className="font-mono text-[11px] tracking-[.1em] uppercase text-accent flex items-center gap-2 mb-6">
            <span aria-hidden="true" className="inline-block w-[7px] h-[7px] rounded-full bg-accent shrink-0" />
            {hero.status}
          </p>
          <h1 className="font-display font-extrabold text-[40px] lg:text-[60px] leading-none tracking-[-0.035em]">
            {hero.headline.map((line) => (
              <span key={line} className="block">
                {line.includes(hero.accentWord) ? (
                  <>
                    {line.split(hero.accentWord)[0]}
                    <span className="text-accent">{hero.accentWord}</span>
                    {line.split(hero.accentWord)[1]}
                  </>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>
          <p className="text-fg2 max-w-[46ch] mt-6">{hero.lede}</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-7 mt-8">
            {hero.metrics.map((m) => (
              <div key={m.label}>
                <div className="font-mono text-[26px] tabular">{m.display}</div>
                <div className="text-[11px] uppercase text-fg3">{m.label}</div>
              </div>
            ))}
          </div>
          <p className="font-mono text-[11px] text-fg3 mt-3">{hero.metricsCaption}</p>
          <div className="flex flex-wrap gap-3 mt-8">
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
          </div>
          <div data-slot="ask" />
        </div>
        <div data-slot="diagram" className="order-last" />
      </div>
      <div id="hero-end" aria-hidden="true" />
    </section>
  )
}
