import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import yaml from 'yamljs'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import authRoutes from './routes/auth.routes.js'
import categoryRoutes from './routes/category.routes.js'
import recipeRoutes from './routes/recipe.routes.js'
import reviewRoutes from './routes/review.routes.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const swaggerDocument = yaml.load(path.join(__dirname, 'openapi.yaml'))

export default function createApp() {
  const app = express()

  app.use(cors())
  app.use(express.json())

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
  app.get('/api/openapi.yaml', (_req, res) => {
    res.type('yaml').sendFile(path.join(__dirname, 'openapi.yaml'))
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/categories', categoryRoutes)
  app.use('/api/recipes', recipeRoutes)
  app.use('/api/reviews', reviewRoutes)

  const clientDist = path.join(__dirname, '..', 'client', 'dist')
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist))
    app.use((req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/api-docs')) return next()
      res.sendFile(path.join(clientDist, 'index.html'))
    })
  }

  app.use(notFound)
  app.use(errorHandler)

  return app
}