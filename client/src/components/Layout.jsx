import { NavLink, Link } from 'react-router-dom'
import { useState } from 'react'
import { useApiKey } from '../hooks/useApiKey'

const navClass = ({ isActive }) =>
  `rounded-md px-3 py-1.5 transition ${
    isActive ? 'bg-card text-brand-deep' : 'text-ink-dim hover:text-brand-deep'
  }`

export default function Layout({ children }) {
  const { apiKey } = useApiKey()
  const [open, setOpen] = useState(false)

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4">
      <header className="sticky top-0 z-40 border-b border-line bg-cream/95 backdrop-blur">
        <div className="flex items-center justify-between gap-4 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <span className="text-2xl">🥘</span> FlavorBook
          </Link>

          <nav className="hidden items-center gap-1 text-sm sm:flex">
            <NavLink to="/" className={navClass}>
              Recipes
            </NavLink>
            <NavLink to="/settings" className={navClass}>
              API Key
            </NavLink>
            <span
              className={`ml-2 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                apiKey ? 'bg-leaf/15 text-leaf' : 'bg-ink-dim/10 text-ink-dim'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${apiKey ? 'bg-leaf' : 'bg-ink-dim'}`}
              />
              {apiKey ? 'Key set' : 'No key'}
            </span>
          </nav>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="rounded-md border border-line px-3 py-1.5 text-ink-dim sm:hidden"
          >
            ☰
          </button>
        </div>

        {open && (
          <nav className="flex flex-col gap-1 border-t border-line py-2 text-sm sm:hidden">
            <NavLink to="/" onClick={() => setOpen(false)} className={navClass}>
              Recipes
            </NavLink>
            <NavLink to="/settings" onClick={() => setOpen(false)} className={navClass}>
              API Key{' '}
              <span className={`ml-1 text-xs ${apiKey ? 'text-leaf' : ''}`}>
                · {apiKey ? 'set' : 'not set'}
              </span>
            </NavLink>
          </nav>
        )}
      </header>

      <main className="flex-1 py-6 pb-16">{children}</main>

      <footer className="border-t border-line py-4 text-center text-xs text-ink-dim">
        FlavorBook · powered by the recipe-api (Express + SQLite)
      </footer>
    </div>
  )
}