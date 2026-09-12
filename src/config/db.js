import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const schemaPath = path.join(__dirname, '..', 'models', 'schema.sql')

export function openDatabase(dbPath) {
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  }
  const db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  return db
}

export function migrate(dbInstance = db) {
  dbInstance.exec(fs.readFileSync(schemaPath, 'utf8'))
}

const dbPath = process.env.DB_PATH || path.join(path.dirname(__dirname), '..', 'data', 'recipes.db')
const db = openDatabase(dbPath)
migrate(db)

export default db