import { site } from '../data/site'

const PHRASE = 'Source on GitHub'

export default function Footer() {
  const [pre, post] = site.contact.footer.split(PHRASE)
  const href = site.projects.find((p) => p.name === 'This site').href
  return (
    <footer className="max-w-page mx-auto px-4 sm:px-6 mt-16 py-6 border-t border-line text-[12px] text-fg3">
      {pre}
      <a href={href} target="_blank" rel="noopener noreferrer" className="underline">
        {PHRASE}
      </a>
      {post}
    </footer>
  )
}
