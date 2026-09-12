import { Router } from 'express'
import * as reviewController from '../controllers/review.controller.js'
import { requireApiKey } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { updateReviewSchema } from '../validators/review.validator.js'

const router = Router()

router.use(requireApiKey)

router.get('/', reviewController.listReview)
router.put('/:id', validate(updateReviewSchema), reviewController.updateReview)
router.patch('/:id', validate(updateReviewSchema), reviewController.updateReview)
router.delete('/:id', reviewController.deleteReview)

export default router