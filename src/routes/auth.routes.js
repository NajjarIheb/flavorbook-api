import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { requireApiKey } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { registerSchema } from '../validators/auth.validator.js'

const router = Router()

router.post('/register', validate(registerSchema), authController.register)
router.get('/me', requireApiKey, authController.me)

export default router