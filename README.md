# Recipe API

A clean, layered REST API for a recipe database — **Recipes**, **Categories**, and **Reviews** — with API-key auth, pagination, search/filtering, consistent error handling, and auto-generated OpenAPI/Swagger documentation.

![Express](https://img.shields.io/badge/Express-5-000) ![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003b57) ![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-85ea2d)

## Features

- **3 related resources**: recipes → categories (many-to-one), recipes → reviews (one-to-many)
- **Full CRUD** over REST for every resource with correct status codes (200/201/204/400/401/403/404/500)
- **API-key auth**: public read endpoints, protected write endpoints (`x-api-key` header)
- **Pagination** on all list endpoints (`?page=` / `?limit=`)
- **Search + filtering** (`?search=` matches title/description/ingredients, `?category=` by slug)
- **Consistent JSON error format** everywhere via one error middleware
- **Ownership rules**: you can only modify your own recipes and reviews
- **24 automated integration tests** (node:test)
- **Full React frontend** ("FlavorBook") — browse, search, filter by category, read recipes, and rate/review them with your API key

## Quick start

```bash
npm install
copy .env.example .env
npm run seed        # creates demo user + recipes
npm run dev         # API on http://localhost:5001
```

**App + API:** http://localhost:5001 — the Express server also serves the built React frontend from `client/` and falls back to `index.html` for client routes.

Build the frontend (optional, needed for the served UI):

```bash
cd client
npm install
npm run build
cd ..
```

**Interactive API docs:** http://localhost:5001/api-docs

Seed demo user:

```
username: chef
password: chef-password
apiKey:   <printed by the seed script, also stored in the DB>
```

## Folder structure (layered)

```
recipe-api/
├── src/
│   ├── config/db.js            → SQLite connection + migrations
│   ├── models/schema.sql       → tables, foreign keys, indexes
│   ├── services/               → business logic (recipes, categories, reviews, users)
│   ├── controllers/            → thin HTTP handlers only
│   ├── routes/                 → one file per resource
│   ├── validators/             → zod schemas, one file per resource
│   ├── middleware/             → auth, validation, error handling
│   ├── openapi.yaml            → full OpenAPI 3 spec
│   ├── utils/helpers.js        → HttpError + pagination helpers
│   ├── app.js                  → app factory (swagger UI, routes, middleware)
│   └── server.js               → entry point
├── scripts/seed.js             → sample data
├── client/                     → React + Vite frontend (FlavorBook)
└── tests/api.test.js           → 24 integration tests
```

## API map

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | public | Register → returns your API key |
| GET | `/api/auth/me` | key | Current user |
| GET | `/api/categories` | public | List categories |
| POST | `/api/categories` | key | Create category |
| PUT/PATCH/DELETE | `/api/categories/:id` | key | Update / delete category |
| GET | `/api/recipes?page&limit&search&category` | public | List (paginated + filtered) |
| POST | `/api/recipes` | key | Create recipe |
| GET | `/api/recipes/:id` | public | One recipe (with avg rating + review count) |
| PUT/PATCH/DELETE | `/api/recipes/:id` | key (owner) | Update / delete recipe |
| GET | `/api/recipes/:id/reviews` | public | List a recipe's reviews |
| POST | `/api/recipes/:id/reviews` | key | Review a recipe |
| PUT/PATCH/DELETE | `/api/reviews/:id` | key (author) | Update / delete review |
| GET | `/api-docs` | public | Swagger UI |

## Error format

Every error uses the same shape:

```json
{ "error": { "message": "Unknown API key", "code": "INVALID_API_KEY" } }
```

Validation failures add a `details` array listing offending fields.

## Architecture rules followed

- **Strict layering** — `routes → controllers → services → DB`. Zero SQL in route/controller files.
- **One file per resource** per layer — adding a field to a resource means editing one schema file and one validator.
- **Centralized errors** — a single error middleware formats every failure; controllers never repeat try/catch formatting.
- **Validation at the gate** — zod parses request bodies before they reach services.
- **Adding a field** — edit `src/models/schema.sql`, the service, and the validator for that resource. No cross-file hunting.

## Tests

```bash
npm test
```

Covers auth, CRUD for all 3 resources, ownership enforcement, pagination, search, and error formats against a throwaway SQLite DB.