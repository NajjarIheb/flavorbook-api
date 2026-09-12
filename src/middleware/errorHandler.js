import { HttpError } from '../utils/helpers.js'

export function notFound() {
  throw new HttpError(404, 'NOT_FOUND', 'Resource not found')
}

export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500
  const code = err.code || 'INTERNAL_ERROR'
  const message = err.message || 'Something went wrong'

  if (status >= 500) console.error(err)

  const body = { error: { message, code } }
  if (err.details) body.error.details = err.details

  res.status(status).json(body)
}