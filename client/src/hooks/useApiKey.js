import { useEffect, useState } from 'react'

const KEY = 'recipeapi:apikey'

export function useApiKey() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(KEY) || '')

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(KEY, apiKey)
    } else {
      localStorage.removeItem(KEY)
    }
  }, [apiKey])

  return { apiKey, setApiKey }
}