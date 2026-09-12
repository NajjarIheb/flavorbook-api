export default function EmptyState({ title = 'Nothing here yet', hint, children }) {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <span className="text-4xl">🍽️</span>
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint && <p className="max-w-sm text-sm text-ink-dim">{hint}</p>}
      {children}
    </div>
  )
}