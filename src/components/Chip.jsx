export default function Chip({ children }) {
  return (
    <span className="inline-block rounded border border-line2 px-2 py-1 font-mono text-[12px] text-fg2">
      {children}
    </span>
  )
}
