export default function StarRating({ value, onChange, size = 'md' }) {
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-4.5 w-4.5', lg: 'h-5 w-5' }

  return (
    <div
      className="flex items-center gap-0.5"
      role={onChange ? 'radiogroup' : undefined}
      aria-label="Rating"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(value || 0)
        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange?.(star)}
            disabled={!onChange}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            className={onChange ? 'cursor-pointer transition hover:scale-110' : 'cursor-default'}
          >
            <svg
              viewBox="0 0 20 20"
              className={`${sizes[size]} ${filled ? 'text-amber-500' : 'text-line'}`}
              fill={filled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.1"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.367 2.447a1 1 0 00-.363 1.118l1.286 3.958c.3.922-.755 1.688-1.54 1.118l-3.366-2.446a1 1 0 00-1.175 0l-3.366 2.447c-.784.57-1.838-.197-1.539-1.119l1.286-3.958a1 1 0 00-.363-1.118L2.562 9.385c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.287-3.958z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}