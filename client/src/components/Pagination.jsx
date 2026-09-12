export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded-md border border-line px-3 py-1.5 text-sm text-ink-dim transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-40"
      >
        ← Prev
      </button>
      <span className="px-3 text-sm text-ink-dim">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-md border border-line px-3 py-1.5 text-sm text-ink-dim transition hover:border-brand disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  )
}