import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { createReview, getRecipe, listReviews } from '../api/recipes'
import { useApiKey } from '../hooks/useApiKey'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import StarRating from '../components/StarRating'

function splitList(value) {
  return (value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function formatDate(value) {
  if (!value) return ''
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}

function StepBadge({ children }) {
  return (
    <span className="h-6 w-6 shrink-0 rounded-full bg-brand/15 text-xs font-bold text-brand-deep grid place-items-center">
      {children}
    </span>
  )
}

export default function RecipeDetailPage() {
  const { id } = useParams()
  const { apiKey } = useApiKey()
  const [recipe, setRecipe] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formMsg, setFormMsg] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    Promise.all([getRecipe(id), listReviews(id)])
      .then(([r, rev]) => {
        setRecipe(r.data)
        setReviews(rev.data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  async function submitReview(e) {
    e.preventDefault()
    setSubmitting(true)
    setFormMsg('')
    try {
      const res = await createReview(id, { rating, comment: comment.trim() || undefined }, apiKey)
      const updated = await listReviews(id)
      setReviews(updated.data)
      const re = await getRecipe(id)
      setRecipe(re.data)
      setRating(0)
      setComment('')
      if (res?.data) setFormMsg('Review added!')
    } catch (err) {
      setFormMsg(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />
  if (error)
    return (
      <EmptyState
        title="Could not load this recipe"
        hint={error}
      >
        <Link to="/" className="text-sm text-brand hover:underline">
          ← Back to recipes
        </Link>
      </EmptyState>
    )
  if (!recipe) return null

  const ingredients = splitList(recipe.ingredients)
  const stepLines = (recipe.steps || '').split(/\n+/).map((s) => s.trim()).filter(Boolean)
  const steps = stepLines.length > 1 ? stepLines : [recipe.steps]

  return (
    <div className="flex flex-col gap-6">
      <Link to="/" className="text-sm text-ink-dim transition hover:text-brand">
        ← Back to recipes
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-dim">
            {recipe.category_name} · by {recipe.author_name}
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">{recipe.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-dim">
            <span className="flex items-center gap-1.5">
              <StarRating value={recipe.average_rating} size="sm" />
              <span>
                {recipe.average_rating ? `${recipe.average_rating} / 5` : 'No reviews'} (
                {recipe.review_count})
              </span>
            </span>
            <span className="rounded-full bg-sand px-2.5 py-1 font-medium">⏱ {recipe.prepared_in_minutes} min</span>
          </div>
        </div>
      </header>

      <p className="text-sm leading-relaxed text-ink-dim sm:text-base">{recipe.description}</p>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-dim">
            🧺 Ingredients
          </h2>
          <ul className="flex flex-col gap-2">
            {ingredients.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-brand" />
                <span className="capitalize">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-line bg-card p-5">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ink-dim">
            📝 Method
          </h2>
          <ol className="flex flex-col gap-3">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
                <StepBadge>{i + 1}</StepBadge>
                <span>{step.replace(/^\d+\)\s*/, '')}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">
          Reviews ({reviews.length})
        </h2>

        {apiKey ? (
          <form onSubmit={submitReview} className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <StarRating value={rating} onChange={setRating} size="lg" />
              <span className="text-sm text-ink-dim">
                {rating ? `${rating} / 5` : 'Pick a rating'}
              </span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="What did you think?"
              className="rounded-lg border border-line bg-cream px-4 py-2.5 text-sm outline-none transition focus:border-brand"
            />
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={submitting || !rating}
                className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:opacity-40"
              >
                {submitting ? 'Posting…' : 'Submit review'}
              </button>
              {formMsg && (
                <span
                  className={`text-sm ${formMsg.includes('added') ? '' : 'text-red-600'}`}
                >
                  {formMsg}
                </span>
              )}
            </div>
          </form>
        ) : (
          <p className="mt-4 text-sm text-ink-dim">
            <Link to="/settings" className="font-medium text-brand hover:underline">
              Add an API key
            </Link>{' '}
            to rate and review this recipe.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-ink-dim">No reviews yet — be the first!</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-line bg-cream p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-brand/15 text-xs font-bold text-brand-deep uppercase">
                      {review.user_name?.charAt(0) || '?'}
                    </span>
                    <span className="text-sm font-medium">{review.user_name}</span>
                  </div>
                  <span className="text-xs text-ink-dim">
                    {formatDate(review.created_at)}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <StarRating value={review.rating} size="sm" />
                  <span className="text-xs text-ink-dim">{review.rating} / 5</span>
                </div>
                {review.comment && (
                  <p className="mt-2 text-sm leading-relaxed">{review.comment}</p>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}