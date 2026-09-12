import { Router } from 'express'
import * as categoryController from '../controllers/category.controller.js'
import { requireApiKey } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import {
  createCategorySchema,
  updateCategorySchema,
} from '../validators/category.validator.js'

const router = Router()

router.get('/', categoryController.listCategories)

router.use(requireApiKey)

router.post('/', validate(createCategorySchema), categoryController.createCategory)
router.put('/:id', validate(updateCategorySchema), categoryController.updateCategory)
router.patch('/:id', validate(updateCategorySchema), categoryController.updateCategory)
router.delete('/:id', categoryController.deleteCategory)

export default router