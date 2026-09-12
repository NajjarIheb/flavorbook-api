import { Router } from 'express'
import * as recipeController from '../controllers/recipe.controller.js'
import { requireApiKey } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createRecipeSchema, updateRecipeSchema } from '../validators/recipe.validator.js'
import { createReviewSchema } from '../validators/review.validator.js'

const router = Router()

router.get('/', recipeController.listRecipes)
router.get('/:id', recipeController.getRecipe)
router.get('/:id/reviews', recipeController.getRecipeReviews)

router.post('/:id/reviews', requireApiKey, validate(createReviewSchema), recipeController.createRecipeReview)

router.use(requireApiKey)

router.post('/', validate(createRecipeSchema), recipeController.createRecipe)
router.put('/:id', validate(updateRecipeSchema), recipeController.updateRecipe)
router.patch('/:id', validate(updateRecipeSchema), recipeController.updateRecipe)
router.delete('/:id', recipeController.deleteRecipe)

export default router