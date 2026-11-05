import TopBar from './components/TopBar'
import Hero from './sections/Hero'
import System from './sections/System'
import Experience from './sections/Experience'
import Projects from './sections/Projects'
import Stack from './sections/Stack'
import Contact from './sections/Contact'

export default function App() {
  return (
    <>
      <a href="#system" className="sr-only focus:not-sr-only">
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
    </>
  )
}
