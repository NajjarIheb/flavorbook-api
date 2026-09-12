import { findUserByApiKey } from '../services/user.service.js'
import { HttpError } from '../utils/helpers.js'

export function requireApiKey(req, _res, next) {
  const apiKey = req.header('x-api-key')
  if (!apiKey) {
    return next(new HttpError(401, 'MISSING_API_KEY', 'x-api-key header is required'))
  }
  const user = findUserByApiKey(apiKey)
  if (!user) {
    return next(new HttpError(401, 'INVALID_API_KEY', 'Unknown API key'))
  }
  req.user = user
  next()
}

export function optionalAuth(req, _res, next) {
  const apiKey = req.header('x-api-key')
  if (apiKey) req.user = findUserByApiKey(apiKey)
  next()
}