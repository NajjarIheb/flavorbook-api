import { z } from 'zod'

const recipeFields = {
  categoryId: z.coerce.number().int().positive('A valid category is required'),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
  preparedInMinutes: z.coerce.number().int().positive('Time must be a positive number').max(6000),
  ingredients: z.string().trim().min(3, 'List the ingredients').max(5000),
  steps: z.string().trim().min(10, 'Write the steps').max(10000),
}

export const createRecipeSchema = z.object(recipeFields)

export const updateRecipeSchema = z
  .object(recipeFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, 'At least one field is required')