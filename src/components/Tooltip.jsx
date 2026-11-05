// Positioned from the anchor's viewBox rect as percentages, so it tracks the scaled SVG without measuring.
// Opens toward the middle of the diagram so it stays inside the card.
export default function Tooltip({ id, text, anchorRect, open }) {
  const { x, y, w, h, vw, vh } = anchorRect
  const right = x + w / 2 > vw / 2
  const below = y + h / 2 < vh / 2
  const pct = (n, d) => `${(n / d) * 100}%`
  const style = {
    [right ? 'right' : 'left']: pct(right ? vw - x - w : x, vw),
    [below ? 'top' : 'bottom']: pct(below ? y + h : vh - y, vh),
  }
  return (
    <div
      id={id}
      role="tooltip"
      hidden={!open}
      style={style}
      className={`absolute z-10 w-max max-w-[28ch] ${below ? 'mt-1.5' : 'mb-1.5'} font-mono text-[11px] leading-snug text-fg bg-bg2 border border-line2 rounded-md p-2 pointer-events-none`}
    >
      {text}
    </div>
  )
}
