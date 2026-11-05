import { LazyMotion, domAnimation } from 'framer-motion'
import TopBar from './components/TopBar'
import Hero from './sections/Hero'
import System from './sections/System'
import Experience from './sections/Experience'
import Projects from './sections/Projects'
import Stack from './sections/Stack'
import Contact from './sections/Contact'
import Footer from './components/Footer'

export default function App() {
  return (
    <LazyMotion features={domAnimation} strict>
      <a href="#system" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-bg focus:px-3 focus:py-2">
        Skip to the system
      </a>
      <TopBar />
      <main className="max-w-page mx-auto px-4 sm:px-6">
        <Hero />
        <System />
        <Experience />
        <Projects />
        <Stack />
        <Contact />
      </main>
      <Footer />
    </LazyMotion>
  )
}
