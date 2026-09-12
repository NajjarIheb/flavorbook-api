import * as recipeService from '../services/recipe.service.js'
import * as reviewService from '../services/review.service.js'
import { HttpError, parsePagination } from '../utils/helpers.js'

export function listRecipes(req, res, next) {
  try {
    const { page, limit } = parsePagination(req.query)
    const { categorySlug, search } = req.query
    const result = recipeService.listRecipes({ categorySlug, search, page, limit })
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export function getRecipe(req, res, next) {
  try {
    const recipe = recipeService.findRecipeById(Number(req.params.id))
    if (!recipe) throw new HttpError(404, 'NOT_FOUND', 'Recipe not found')
    res.json({ data: recipe })
  } catch (error) {
    next(error)
  }
}

export function createRecipe(req, res, next) {
  try {
    const recipe = recipeService.createRecipe({ authorId: req.user.id, ...req.body })
    res.status(201).json({ data: recipe })
  } catch (error) {
    next(error)
  }
}

export function getRecipeReviews(req, res, next) {
  try {
    const recipe = recipeService.findRecipeById(Number(req.params.id))
    if (!recipe) throw new HttpError(404, 'NOT_FOUND', 'Recipe not found')

    const { page, limit } = parsePagination(req.query)
    const reviews = reviewService.listReviewsByRecipe(recipe.id, { page, limit })
    res.json(reviews)
  } catch (error) {
    next(error)
  }
}

export function createRecipeReview(req, res, next) {
  try {
    const recipe = recipeService.findRecipeById(Number(req.params.id))
    if (!recipe) throw new HttpError(404, 'NOT_FOUND', 'Recipe not found')

    const review = reviewService.createReview({
      recipeId: recipe.id,
      userId: req.user.id,
      ...req.body,
    })
    res.status(201).json({ data: review })
  } catch (error) {
    next(error)
  }
}

export function updateRecipe(req, res, next) {
  try {
    const recipe = findOwnedRecipe(req.params.id, req.user.id)
    const updated = recipeService.updateRecipe(recipe.id, req.body)
    res.json({ data: updated })
  } catch (error) {
    next(error)
  }
}

export function deleteRecipe(req, res, next) {
  try {
    findOwnedRecipe(req.params.id, req.user.id)
    recipeService.deleteRecipe(Number(req.params.id))
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}

function findOwnedRecipe(id, ownerId) {
  const recipe = recipeService.findRecipeById(Number(id))
  if (!recipe) throw new HttpError(404, 'NOT_FOUND', 'Recipe not found')
  if (recipe.author_id !== ownerId) {
    throw new HttpError(403, 'FORBIDDEN', 'You can only modify your own recipes')
  }
  return recipe
}