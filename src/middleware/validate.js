import { ZodError } from 'zod'

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    try {
      req[source] = schema.parse(req[source])
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }))
        const err = new Error('Validation failed')
        err.status = 400
        err.code = 'VALIDATION_ERROR'
        err.details = details
        return next(err)
      }
      next(error)
    }
  }
}