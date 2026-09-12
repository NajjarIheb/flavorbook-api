import * as userService from '../services/user.service.js'
import { HttpError } from '../utils/helpers.js'

export async function register(req, res, next) {
  try {
    const existing = userService.findUserByUsername(req.body.username)
    if (existing) {
      throw new HttpError(409, 'USERNAME_TAKEN', 'Username is already taken')
    }

    const passwordHash = await userService.hashPassword(req.body.password)
    const user = userService.createUser({ username: req.body.username, password: passwordHash })

    res.status(201).json({
      user: userService.toPublicUser(user),
      apiKey: user.api_key,
    })
  } catch (error) {
    next(error)
  }
}

export function me(req, res) {
  res.json({ user: userService.toPublicUser(req.user) })
}