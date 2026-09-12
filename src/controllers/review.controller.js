import * as reviewService from '../services/review.service.js'
import { HttpError } from '../utils/helpers.js'

export function listReview(_req, res, next) {
  try {
    res.status(400).json({
      error: { message: 'Reviews are nested under /recipes/:recipeId/reviews', code: 'BAD_REQUEST' },
    })
  } catch (error) {
    next(error)
  }
}

export function updateReview(req, res, next) {
  try {
    const review = findOwnedReview(req.params.id, req.user.id)
    const updated = reviewService.updateReview(review.id, req.body)
    res.json({ data: updated })
  } catch (error) {
    next(error)
  }
}

export function deleteReview(req, res, next) {
  try {
    findOwnedReview(req.params.id, req.user.id)
    reviewService.deleteReview(Number(req.params.id))
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}

function findOwnedReview(id, ownerId) {
  const review = reviewService.findReviewById(Number(id))
  if (!review) throw new HttpError(404, 'NOT_FOUND', 'Review not found')
  if (review.user_id !== ownerId) {
    throw new HttpError(403, 'FORBIDDEN', 'You can only modify your own reviews')
  }
  return review
}