import { useEffect, useState } from 'react'
import { listCategories, listRecipes } from '../api/recipes'
import Loader from '../components/Loader'
import EmptyState from '../components/EmptyState'
import RecipeCard from '../components/RecipeCard'
import Pagination from '../components/Pagination'

const PER_PAGE = 9

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [input, setInput] = useState('')
  const [page, setPage] = useState(1)
  const [recipes, setRecipes] = useState(null)
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    listCategories()
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    listRecipes({ category, search, page, limit: PER_PAGE })
      .then((res) => {
        setRecipes(res.data)
        setMeta(res)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [category, search, page])

  function submitSearch(e) {
    e.preventDefault()
    setSearch(input.trim())
    setPage(1)
  }

  function selectCategory(slug) {
    setCategory(slug === category ? '' : slug)
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col items-center gap-4 py-6 text-center">
        <h1 className="text-3xl font-bold leading-tight">
          Recipes from the <span className="text-brand">recipe-api</span>
        </h1>
        <p className="max-w-lg text-sm text-ink-dim">
          Browse, search and review dishes served straight from an Express + SQLite API.
        </p>
        <form
          onSubmit={submitSearch}
          className="flex w-full max-w-xl gap-2"
          role="search"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search recipes, ingredients…"
            className="w-full rounded-lg border border-line bg-card px-4 py-2.5 text-sm outline-none transition focus:border-brand"
          />
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-deep"
          >
            Search
          </button>
        </form>
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => selectCategory('')}
          className={`rounded-full px-3.5 py-1.5 text-sm transition ${
            !category
              ? 'bg-brand text-white'
              : 'border border-line bg-card text-ink-dim hover:border-brand'
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCategory(c.slug)}
            className={`rounded-full px-3.5 py-1.5 text-sm capitalize transition ${
              category === c.slug
                ? 'bg-brand text-white'
                : 'border border-line bg-card text-ink-dim hover:border-brand'
            }`}
          >
            {c.name.toLowerCase()}
          </button>
        ))}
      </div>

      {search && !loading && (
        <p className="text-sm text-ink-dim">
          {meta.total} result{meta.total === 1 ? '' : 's'} for “{search}”
        </p>
      )}

      {loading ? (
        <Loader />
      ) : error ? (
        <EmptyState title="Something went wrong" hint={error} />
      ) : recipes && recipes.length === 0 ? (
        <EmptyState
          title="No recipes found"
          hint="Try a different search term or category."
        />
      ) : recipes ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : null}

      <Pagination page={page} totalPages={meta.totalPages || 1} onPageChange={setPage} />
    </div>
  )
}