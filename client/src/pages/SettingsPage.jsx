import { useState } from 'react'
import { registerUser } from '../api/recipes'
import { useApiKey } from '../hooks/useApiKey'

export default function SettingsPage() {
  const { apiKey, setApiKey } = useApiKey()
  const [keyInput, setKeyInput] = useState(apiKey)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [registering, setRegistering] = useState(false)
  const [registerMsg, setRegisterMsg] = useState('')
  const [newKey, setNewKey] = useState('')

  function saveKey(e) {
    e.preventDefault()
    setApiKey(keyInput.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function register(e) {
    e.preventDefault()
    setRegistering(true)
    setRegisterMsg('')
    setNewKey('')
    try {
      const res = await registerUser(username, password)
      setNewKey(res.apiKey)
      setApiKey(res.apiKey)
      setKeyInput(res.apiKey)
      setRegisterMsg('Account created. Your API key is ready to copy below.')
      setUsername('')
      setPassword('')
    } catch (err) {
      setRegisterMsg(err.message)
    } finally {
      setRegistering(false)
    }
  }

  async function copy(value) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">API settings</h1>
        <p className="mt-1 text-sm text-ink-dim">
          Choose a key to unlock <span className="font-medium text-ink">POST</span> requests —
          like submitting reviews.
        </p>
      </header>

      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">
          Your API key
        </h2>
        <form onSubmit={saveKey} className="mt-3 flex flex-col gap-3">
          <input
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="Paste your x-api-key here"
            className="rounded-lg border border-line bg-cream px-4 py-2.5 text-sm font-mono outline-none transition focus:border-brand"
          />
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-deep"
            >
              Save key
            </button>
            {saved && <span className="text-sm text-leaf">Saved ✓</span>}
          </div>
        </form>
        {apiKey && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-cream px-4 py-3">
            <span className="truncate font-mono text-xs text-ink-dim">{apiKey}</span>
            <button
              onClick={() => copy(apiKey)}
              className="ml-auto shrink-0 rounded-md border border-line px-3 py-1.5 text-xs text-ink-dim transition hover:border-brand hover:text-brand"
            >
              {copied ? 'Copied ✓' : 'Copy'}
            </button>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-line bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">
          Get a key — register
        </h2>
        <p className="mt-2 text-sm text-ink-dim">
          The recipe-api returns a fresh API key when you sign up.
        </p>
        <form onSubmit={register} className="mt-4 flex flex-col gap-3">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username (min 3 characters)"
            className="rounded-lg border border-line bg-cream px-4 py-2.5 text-sm outline-none transition focus:border-brand"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 characters)"
            className="rounded-lg border border-line bg-cream px-4 py-2.5 text-sm outline-none transition focus:border-brand"
          />
          <button
            type="submit"
            disabled={registering}
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-deep disabled:opacity-40"
          >
            {registering ? 'Registering…' : 'Register'}
          </button>
          {registerMsg && (
            <p className={`text-sm ${newKey ? 'text-leaf' : 'text-red-600'}`}>{registerMsg}</p>
          )}
          {newKey && (
            <div className="flex items-center gap-2 rounded-lg border border-leaf/40 bg-leaf/10 px-4 py-3">
              <span className="truncate font-mono text-xs">{newKey}</span>
              <button
                type="button"
                onClick={() => copy(newKey)}
                className="ml-auto shrink-0 rounded-md border border-line bg-card px-3 py-1.5 text-xs transition hover:border-brand hover:text-brand"
              >
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>
          )}
        </form>
      </section>

      <section className="rounded-xl border border-line bg-card p-5 text-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-dim">
          How it works
        </h2>
        <ul className="mt-3 flex flex-col gap-2 text-ink-dim">
          <li>
            Public reads — <code className="font-mono text-xs">GET /api/recipes</code> — need no key.
          </li>
          <li>
            Writes —{' '}
            <code className="font-mono text-xs">POST /api/recipes/:id/reviews</code> — send the key
            in the <code className="font-mono text-xs">x-api-key</code> header.
          </li>
          <li>
            Explore the full contract in the{' '}
            <a
              href="/api-docs"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-brand hover:underline"
            >
              Swagger docs
            </a>
            .
          </li>
        </ul>
      </section>
    </div>
  )
}