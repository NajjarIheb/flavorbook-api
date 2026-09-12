import 'dotenv/config'
import bcrypt from 'bcryptjs'
import db, { migrate } from '../src/config/db.js'
import * as categoryService from '../src/services/category.service.js'
import * as recipeService from '../src/services/recipe.service.js'
import * as reviewService from '../src/services/review.service.js'
import * as userService from '../src/services/user.service.js'

migrate()

const existing = userService.findUserByUsername('chef')

if (existing) {
  console.log('Seed skipped — user "chef" already exists.')
} else {
  const hash = bcrypt.hashSync('chef-password', 10)
  const chef = userService.createUser({ username: 'chef', password: hash })
  console.log('User created:  chef / chef-password')
  console.log(`API key:        ${chef.api_key}`)

  const categories = {
    mains: categoryService.createCategory({ name: 'Main Courses' }),
    desserts: categoryService.createCategory({ name: 'Desserts' }),
    salads: categoryService.createCategory({ name: 'Salads' }),
  }

  const couscous = recipeService.createRecipe({
    authorId: chef.id,
    categoryId: categories.mains.id,
    title: 'Couscous Royale',
    description: 'A Tunisian classic with lamb, vegetables and steamed couscous.',
    preparedInMinutes: 120,
    ingredients: 'couscous, lamb, chickpeas, onion, tomato, harissa, carrots, zucchini',
    steps: '1) Steam the couscous. 2) Brown the lamb. 3) Add vegetables, tomato, harissa and simmer. 4) Serve meat + vegetables over couscous.',
  })

  recipeService.createRecipe({
    authorId: chef.id,
    categoryId: categories.mains.id,
    title: 'Spaghetti Carbonara',
    description: 'A creamy classic done the traditional way — no cream, just eggs and pecorino.',
    preparedInMinutes: 30,
    ingredients: 'spaghetti, eggs, pancetta, pecorino, black pepper',
    steps: '1) Cook spaghetti. 2) Fry pancetta until crisp. 3) Whisk eggs with pecorino. 4) Toss hot pasta with pancetta, then beat in the egg mix off the heat.',
  })

  recipeService.createRecipe({
    authorId: chef.id,
    categoryId: categories.desserts.id,
    title: 'Chocolate Lava Cake',
    description: 'A rich molten-center chocolate cake that takes 20 minutes from oven to table.',
    preparedInMinutes: 20,
    ingredients: 'dark chocolate, butter, eggs, sugar, flour',
    steps: '1) Melt chocolate and butter. 2) Whisk eggs with sugar. 3) Fold in the chocolate and flour. 4) Bake at 200°C for 12 minutes.',
  })

  reviewService.createReview({
    recipeId: couscous.id,
    userId: chef.id,
    rating: 5,
    comment: 'The harissa gives it a perfect kick. Family favourite!',
  })
  reviewService.createReview({
    recipeId: couscous.id,
    userId: chef.id,
    rating: 4,
    comment: 'Takes a while but worth the effort.',
  })

  console.log('Seed complete: 3 recipes, 3 categories, 2 reviews.')
}