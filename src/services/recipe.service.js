import db from '../config/db.js'

const BASE_SELECT = `
  SELECT
    r.*,
    c.name AS category_name,
    u.username AS author_name,
    (SELECT ROUND(AVG(rv.rating), 1)
       FROM reviews rv WHERE rv.recipe_id = r.id) AS average_rating,
    (SELECT COUNT(*) FROM reviews rv WHERE rv.recipe_id = r.id) AS review_count
  FROM recipes r
  JOIN categories c ON c.id = r.category_id
  JOIN users u ON u.id = r.author_id
`

function buildWhere({ categorySlug, search }) {
  const conditions = []
  const params = []

  if (categorySlug) {
    conditions.push('c.slug = ?')
    params.push(categorySlug)
  }
  if (search) {
    conditions.push(
      '(r.title LIKE ? OR r.description LIKE ? OR r.ingredients LIKE ?)',
    )
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', params }
}

export function listRecipes({ categorySlug, search, page, limit }) {
  const { where, params } = buildWhere({ categorySlug, search })
  const offset = (page - 1) * limit

  const total = db
    .prepare(`SELECT COUNT(*) AS count FROM recipes r JOIN categories c ON c.id = r.category_id ${where}`)
    .get(...params).count

  const data = db
    .prepare(`${BASE_SELECT} ${where} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, offset)

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) || 1 }
}

export function findRecipeById(id) {
  return db.prepare(`${BASE_SELECT} WHERE r.id = ?`).get(id)
}

export function createRecipe({ authorId, categoryId, title, description, preparedInMinutes, ingredients, steps }) {
  const result = db
    .prepare(
      `INSERT INTO recipes
       (author_id, category_id, title, description, prepared_in_minutes, ingredients, steps)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(authorId, categoryId, title, description, preparedInMinutes, ingredients, steps)
  return findRecipeById(result.lastInsertRowid)
}

export function updateRecipe(id, fields) {
  const recipe = findRecipeById(id)
  if (!recipe) return null

  const next = {
    categoryId: fields.categoryId ?? recipe.category_id,
    title: fields.title ?? recipe.title,
    description: fields.description ?? recipe.description,
    preparedInMinutes: fields.preparedInMinutes ?? recipe.prepared_in_minutes,
    ingredients: fields.ingredients ?? recipe.ingredients,
    steps: fields.steps ?? recipe.steps,
  }

  db.prepare(
    `UPDATE recipes
     SET category_id = ?, title = ?, description = ?, prepared_in_minutes = ?,
         ingredients = ?, steps = ?, updated_at = datetime('now')
     WHERE id = ?`,
  ).run(next.categoryId, next.title, next.description, next.preparedInMinutes, next.ingredients, next.steps, id)

  return findRecipeById(id)
}

export function deleteRecipe(id) {
  const result = db.prepare('DELETE FROM recipes WHERE id = ?').run(id)
  return result.changes > 0
}