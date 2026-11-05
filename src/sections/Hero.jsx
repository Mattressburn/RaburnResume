import { useEffect, useRef, useState } from 'react'
import { site } from '../data/site'
import Reveal from '../components/Reveal'
import MaskedLines from '../components/MaskedLines'
import CountUp from '../components/CountUp'
import { heroTimings, useReducedMotionPref } from '../lib/motion'
import { btn } from '../components/buttonClass'
import Card from '../components/Card'
import RequestPath from '../components/RequestPath'
import TraceLog from '../components/TraceLog'
import Ask from '../components/Ask'

const layerClass = 'w-full h-full object-cover opacity-[.07]'

// Ambient loop: sources stay unset until window load so it never competes with the LCP.
function HeroLoop() {
  const reduced = useReducedMotionPref()
  const [loaded, setLoaded] = useState(() => document.readyState === 'complete')
  const video = useRef(null)
  useEffect(() => {
    if (loaded) return
    const onLoad = () => setLoaded(true)
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [loaded])
  useEffect(() => {
    if (loaded) video.current?.load()
  }, [loaded])
  if (reduced) return <img src="/media/hero-poster.jpg" alt="" className={layerClass} />
  if (navigator.connection?.saveData) return null
  return (
    <video ref={video} className={layerClass} autoPlay muted loop playsInline preload="none" poster="/media/hero-poster.jpg">
      <source src={loaded ? '/media/hero-loop.webm' : undefined} type="video/webm" />
      <source src={loaded ? '/media/hero-loop.mp4' : undefined} type="video/mp4" />
    </video>
  )
}

export default function Hero() {
  const { hero } = site
  return (
    <section id="top" className="relative isolate bg-bg pt-16 pb-20">
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden pointer-events-none [mask-image:radial-gradient(ellipse_at_center,#000_45%,transparent_78%)]">
        <HeroLoop />
      </div>
      <div className="relative grid lg:grid-cols-[52fr_48fr] gap-10">
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
            <div data-slot="ask"><Ask /></div>
          </Reveal>
        </div>
        <Reveal delay={heroTimings.diagram} className="order-last">
          <Card>
            <div data-slot="diagram">
              <div className="flex justify-between font-mono text-[10px] text-fg3 mb-3">
                <span>REQUEST PATH</span>
                <span>trace 7f3a…</span>
              </div>
              <RequestPath size="card" animate />
              <div className="border-t border-line mt-4 pt-3">
                <TraceLog lines={site.trace} animate />
              </div>
              <p className="font-mono text-[10px] text-fg3 mt-2">example trace</p>
            </div>
          </Card>
        </Reveal>
      </div>
      <div id="hero-end" aria-hidden="true" />
    </section>
  )
}
