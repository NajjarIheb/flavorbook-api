import db from '../config/db.js'

export function listReviewsByRecipe(recipeId, { page, limit }) {
  const offset = (page - 1) * limit

  const total = db
    .prepare('SELECT COUNT(*) AS count FROM reviews WHERE recipe_id = ?')
    .get(recipeId).count

  const data = db
    .prepare(
      `SELECT rv.id, rv.recipe_id, rv.rating, rv.comment, rv.created_at,
              u.id AS user_id, u.username AS user_name
       FROM reviews rv JOIN users u ON u.id = rv.user_id
       WHERE rv.recipe_id = ?
       ORDER BY rv.created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .all(recipeId, limit, offset)

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) || 1 }
}

export function findReviewById(id) {
  return db.prepare('SELECT * FROM reviews WHERE id = ?').get(id)
}

export function createReview({ recipeId, userId, rating, comment }) {
  const result = db
    .prepare('INSERT INTO reviews (recipe_id, user_id, rating, comment) VALUES (?, ?, ?, ?)')
    .run(recipeId, userId, rating, comment || null)
  return findReviewById(result.lastInsertRowid)
}

export function updateReview(id, { rating, comment }) {
  const review = findReviewById(id)
  if (!review) return null

  db.prepare('UPDATE reviews SET rating = ?, comment = ? WHERE id = ?')
    .run(rating ?? review.rating, comment ?? review.comment, id)
  return findReviewById(id)
}

export function deleteReview(id) {
  const result = db.prepare('DELETE FROM reviews WHERE id = ?').run(id)
  return result.changes > 0
}