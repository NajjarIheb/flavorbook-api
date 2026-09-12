import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, before, describe, test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const dbPath = path.join(tmpdir(), `recipe-api-test-${Date.now()}.db`)
process.env.DB_PATH = dbPath

const bcrypt = require('bcryptjs')
const { default: createApp } = await import('../src/app.js')
const { migrate } = await import('../src/config/db.js')
const { default: db } = await import('../src/config/db.js')
const userService = await import('../src/services/user.service.js')
const categoryService = await import('../src/services/category.service.js')

let baseUrl
let userName
let userApiKey
let server
let categoryId
let recipeId

async function request(method, route, { body, apiKey } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (apiKey) headers['x-api-key'] = apiKey
  const res = await fetch(`${baseUrl}${route}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  return { status: res.status, body: res.status === 204 ? null : await res.json() }
}

before(async () => {
  migrate()

  const hash = bcrypt.hashSync('secret123', 10)
  const user = userService.createUser({ username: 'alice', password: hash })
  userName = user.username
  userApiKey = user.api_key

  const category = categoryService.createCategory({ name: 'Main Courses' })
  categoryId = category.id

  server = createApp().listen(0)
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(() => {
  server.close()
  db.close()
})

describe('auth', () => {
  test('register returns a user and API key', async () => {
    const { status, body } = await request('POST', '/api/auth/register', {
      body: { username: 'bob', password: 'password123' },
    })
    assert.equal(status, 201)
    assert.equal(body.user.username, 'bob')
    assert.ok(body.apiKey)
  })

  test('register rejects duplicate username with 409', async () => {
    const { status } = await request('POST', '/api/auth/register', {
      body: { username: 'alice', password: 'password123' },
    })
    assert.equal(status, 409)
  })

  test('register rejects short password with 400', async () => {
    const { status, body } = await request('POST', '/api/auth/register', {
      body: { username: 'carl', password: 'short' },
    })
    assert.equal(status, 400)
    assert.equal(body.error.code, 'VALIDATION_ERROR')
  })

  test('GET /api/auth/me requires valid API key', async () => {
    const { status } = await request('GET', '/api/auth/me')
    assert.equal(status, 401)

    const { status: okStatus, body } = await request('GET', '/api/auth/me', { apiKey: userApiKey })
    assert.equal(okStatus, 200)
    assert.equal(body.user.username, userName)
  })
})

describe('categories', () => {
  test('GET /api/categories is public', async () => {
    const { status, body } = await request('GET', '/api/categories')
    assert.equal(status, 200)
    assert.ok(body.data.length >= 1)
  })

  test('POST /api/categories requires auth', async () => {
    const { status } = await request('POST', '/api/categories', {
      body: { name: 'Soup' },
    })
    assert.equal(status, 401)
  })

  test('authenticated user can create a category', async () => {
    const { status, body } = await request('POST', '/api/categories', {
      apiKey: userApiKey,
      body: { name: 'Soups' },
    })
    assert.equal(status, 201)
    assert.equal(body.data.slug, 'soups')
  })

  test('DELETE /api/categories/:id works', async () => {
    const created = await request('POST', '/api/categories', {
      apiKey: userApiKey,
      body: { name: 'Throwaway' },
    })
    const { status } = await request('DELETE', `/api/categories/${created.body.data.id}`, {
      apiKey: userApiKey,
    })
    assert.equal(status, 204)
  })
})

describe('recipes CRUD', () => {
  const recipeInput = {
    categoryId,
    title: 'Test Tajine',
    description: 'A simple test recipe',
    preparedInMinutes: 40,
    ingredients: 'eggs, chicken',
    steps: '1) Mix. 2) Cook.',
  }

  test('GET /api/recipes is public', async () => {
    const { status, body } = await request('GET', '/api/recipes')
    assert.equal(status, 200)
    assert.ok(Array.isArray(body.data))
  })

  test('POST /api/recipes requires auth', async () => {
    const { status } = await request('POST', '/api/recipes', { body: recipeInput })
    assert.equal(status, 401)
  })

  test('authenticated user can create a recipe', async () => {
    const { status, body } = await request('POST', '/api/recipes', {
      apiKey: userApiKey,
      body: recipeInput,
    })
    assert.equal(status, 201)
    assert.equal(body.data.title, 'Test Tajine')
    assert.equal(body.data.author_name, userName)
    recipeId = body.data.id
  })

  test('create rejects missing fields with 400', async () => {
    const { status, body } = await request('POST', '/api/recipes', {
      apiKey: userApiKey,
      body: { title: 'X' },
    })
    assert.equal(status, 400)
    assert.equal(body.error.code, 'VALIDATION_ERROR')
  })

  test('GET /api/recipes/:id returns one recipe', async () => {
    const { status, body } = await request('GET', `/api/recipes/${recipeId}`)
    assert.equal(status, 200)
    assert.equal(body.data.id, recipeId)
  })

  test('owner can update their recipe', async () => {
    const { status, body } = await request('PATCH', `/api/recipes/${recipeId}`, {
      apiKey: userApiKey,
      body: { preparedInMinutes: 25 },
    })
    assert.equal(status, 200)
    assert.equal(body.data.prepared_in_minutes, 25)
  })

  test('another user cannot update the recipe', async () => {
    const other = await request('POST', '/api/auth/register', {
      body: { username: 'mallory', password: 'password123' },
    })
    const { status } = await request('PATCH', `/api/recipes/${recipeId}`, {
      apiKey: other.body.apiKey,
      body: { title: 'Hacked' },
    })
    assert.equal(status, 403)
  })

  test('GET /api/recipes/:id returns 404 for unknown id', async () => {
    const { status } = await request('GET', '/api/recipes/99999')
    assert.equal(status, 404)
  })

  test('owner can delete their recipe', async () => {
    const { status } = await request('DELETE', `/api/recipes/${recipeId}`, {
      apiKey: userApiKey,
    })
    assert.equal(status, 204)
  })
})

describe('reviews', () => {
  let reviewId

  before(async () => {
    const { body } = await request('POST', '/api/recipes', {
      apiKey: userApiKey,
      body: {
        categoryId,
        title: 'Recipe for review',
        description: 'A recipe that will receive reviews',
        preparedInMinutes: 15,
        ingredients: 'tomato',
        steps: '1) Chop. 2) Serve.',
      },
    })
    recipeId = body.data.id
  })

  test('POST /api/recipes/:id/reviews creates a review', async () => {
    const { status, body } = await request('POST', `/api/recipes/${recipeId}/reviews`, {
      apiKey: userApiKey,
      body: { rating: 5, comment: 'Delicious!' },
    })
    assert.equal(status, 201)
    assert.equal(body.data.rating, 5)
    reviewId = body.data.id
  })

  test('review with rating out of range rejected', async () => {
    const { status } = await request('POST', `/api/recipes/${recipeId}/reviews`, {
      apiKey: userApiKey,
      body: { rating: 9 },
    })
    assert.equal(status, 400)
  })

  test('GET /api/recipes/:id/reviews lists reviews', async () => {
    const { status, body } = await request('GET', `/api/recipes/${recipeId}/reviews`)
    assert.equal(status, 200)
    assert.ok(body.data.some((r) => r.id === reviewId))
  })

  test('author can delete their review', async () => {
    const { status } = await request('DELETE', `/api/reviews/${reviewId}`, {
      apiKey: userApiKey,
    })
    assert.equal(status, 204)
  })
})

describe('pagination and search', () => {
  before(async () => {
    for (let i = 1; i <= 15; i++) {
      await request('POST', '/api/recipes', {
        apiKey: userApiKey,
        body: {
          categoryId,
          title: `Bulk Recipe ${i}`,
          description: 'Generated for pagination testing',
          preparedInMinutes: 10 + i,
          ingredients: 'flour, water',
          steps: '1) Mix. 2) Bake.',
        },
      })
    }
  })

  test('pagination returns limited pages', async () => {
    const page1 = await request('GET', '/api/recipes?page=1&limit=5')
    assert.equal(page1.body.data.length, 5)
    assert.equal(page1.body.totalPages, Math.ceil(page1.body.total / 5))

    const page2 = await request('GET', '/api/recipes?page=2&limit=5')
    assert.equal(page2.body.data.length, 5)
    const ids1 = new Set(page1.body.data.map((r) => r.id))
    const ids2 = new Set(page2.body.data.map((r) => r.id))
    assert.equal([...ids1].filter((id) => ids2.has(id)).length, 0)
  })

  test('search filters recipes', async () => {
    const { body } = await request('GET', '/api/recipes?search=Bulk+Recipe+1')
    assert.ok(body.data.length >= 1)
    assert.ok(body.data.every((r) => r.title.includes('Bulk Recipe 1')))
  })
})

describe('404 handler', () => {
  test('unknown route returns consistent error shape', async () => {
    const { status, body } = await request('GET', '/api/nonsense')
    assert.equal(status, 404)
    assert.equal(body.error.code, 'NOT_FOUND')
    assert.ok(body.error.message)
  })
})