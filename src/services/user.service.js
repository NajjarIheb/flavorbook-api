import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import db from '../config/db.js'

export function generateApiKey() {
  return crypto.randomBytes(24).toString('hex')
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash)
}

export function createUser({ username, password, apiKey = generateApiKey() }) {
  const result = db
    .prepare('INSERT INTO users (username, password_hash, api_key) VALUES (?, ?, ?)')
    .run(username, password, apiKey)
  return findUserById(result.lastInsertRowid)
}

export function findUserById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id)
}

export function findUserByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(username)
}

export function findUserByApiKey(apiKey) {
  return db.prepare('SELECT * FROM users WHERE api_key = ?').get(apiKey)
}

export function findUserByCredentials(username, apiKey) {
  if (apiKey) return findUserByApiKey(apiKey)
  if (username) return findUserByUsername(username)
  return null
}

export function toPublicUser(user) {
  return { id: user.id, username: user.username }
}