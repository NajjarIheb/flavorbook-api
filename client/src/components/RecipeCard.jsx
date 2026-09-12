import { Link } from 'react-router-dom'
import StarRating from './StarRating'

export default function RecipeCard({ recipe }) {
  return (
    <Link
      to={`/recipe/${recipe.id}`}
      className="flex flex-col gap-3 rounded-xl border border-line bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold leading-snug">{recipe.title}</h3>
          <p className="text-xs text-ink-dim">
            {recipe.category_name} · by {recipe.author_name}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-sand px-2.5 py-1 text-xs font-medium">
          ⏱ {recipe.prepared_in_minutes} min
        </span>
      </div>

      <p className="line-clamp-2 text-sm leading-relaxed text-ink-dim">{recipe.description}</p>

      <div className="mt-auto flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5">
          <StarRating value={recipe.average_rating} size="sm" />
          <span className="text-xs text-ink-dim">
            {recipe.review_count > 0
              ? `${recipe.average_rating ?? '—'} (${recipe.review_count})`
              : 'No reviews yet'}
          </span>
        </span>
        <span className="text-xs font-medium text-brand">Details →</span>
      </div>
    </Link>
  )
}