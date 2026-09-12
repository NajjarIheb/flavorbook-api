import * as categoryService from '../services/category.service.js'
import { HttpError } from '../utils/helpers.js'

export function listCategories(_req, res, next) {
  try {
    res.json({ data: categoryService.listCategories() })
  } catch (error) {
    next(error)
  }
}

export function createCategory(req, res, next) {
  try {
    const category = categoryService.createCategory(req.body)
    res.status(201).json({ data: category })
  } catch (error) {
    next(error)
  }
}

export function updateCategory(req, res, next) {
  try {
    const existing = categoryService.findCategoryById(Number(req.params.id))
    if (!existing) throw new HttpError(404, 'NOT_FOUND', 'Category not found')

    const category = categoryService.updateCategory(existing.id, req.body)
    res.json({ data: category })
  } catch (error) {
    next(error)
  }
}

export function deleteCategory(req, res, next) {
  try {
    const existing = categoryService.findCategoryById(Number(req.params.id))
    if (!existing) throw new HttpError(404, 'NOT_FOUND', 'Category not found')

    categoryService.deleteCategory(existing.id)
    res.status(204).end()
  } catch (error) {
    next(error)
  }
}