const API_URL = '/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options)

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      message = body.message || message
    } catch {
      // keep default message
    }
    throw new Error(message)
  }

  return response.status === 204 ? null : response.json()
}

function jsonOptions(method, body, apiKey) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
  if (apiKey) options.headers['x-api-key'] = apiKey
  return options
}

export function listCategories() {
  return request('/categories')
}

export function listRecipes({ category, search, page = 1, limit = 9 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (category) params.set('category', category)
  if (search) params.set('search', search)
  return request(`/recipes?${params}`)
}

export function getRecipe(id) {
  return request(`/recipes/${id}`)
}

export function listReviews(id) {
  return request(`/recipes/${id}/reviews`)
}

export function createReview(id, { rating, comment }, apiKey) {
  return request(`/recipes/${id}/reviews`, jsonOptions('POST', { rating, comment }, apiKey))
}

export function registerUser(username, password) {
  return request('/auth/register', jsonOptions('POST', { username, password }))
}