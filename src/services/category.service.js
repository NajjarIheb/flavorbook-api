import db from '../config/db.js'

export function listCategories() {
  return db
    .prepare('SELECT id, name, slug, created_at FROM categories ORDER BY name ASC')
    .all()
}

export function findCategoryById(id) {
  return db.prepare('SELECT * FROM categories WHERE id = ?').get(id)
}

export function findCategoryBySlug(slug) {
  return db.prepare('SELECT * FROM categories WHERE slug = ?').get(slug)
}

export function createCategory({ name }) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const result = db
    .prepare('INSERT INTO categories (name, slug) VALUES (?, ?)')
    .run(name, slug)
  return findCategoryById(result.lastInsertRowid)
}

export function updateCategory(id, { name }) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  db.prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?').run(name, slug, id)
  return findCategoryById(id)
}

export function deleteCategory(id) {
  const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id)
  return result.changes > 0
}