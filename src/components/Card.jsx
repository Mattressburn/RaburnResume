export default function Card({ children, className = '', interactive = false }) {
  return (
    <div
      className={`rounded-lg border border-line bg-bg2 p-5 transition-[border-color,transform] duration-150 ${
        interactive ? 'hover:border-line2 hover:-translate-y-[2px]' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
