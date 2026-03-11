# Bookora Project Guide

## 1. Product architecture

Bookora is split into two deployable applications:

- `frontend`: Next.js App Router application for marketing, authentication, dashboard, reading/listening experiences, store, checkout, and admin panel.
- `backend`: Express API with Prisma and PostgreSQL for auth, catalog, progress, gamification, quiz, commerce, and admin analytics.

### Core domains

- `Identity`: sign up, sign in, session bridge through NextAuth credentials + backend JWT.
- `Catalog`: audio books, PDF books, store items, categories, featured content, quotes.
- `Consumption`: audio listening progress, PDF reading progress, annotations, discussions.
- `Gamification`: streaks, points, reward events, leaderboard, weekly quiz.
- `Commerce`: cart, checkout, orders, points redemption.
- `Operations`: admin overview, user list, book list, order list.

### Request flow

1. User authenticates in NextAuth credentials flow.
2. Frontend receives backend-issued JWT and stores it in NextAuth session.
3. Protected frontend pages call Express API with `Authorization: Bearer <token>`.
4. Express validates JWT, runs Prisma queries, and returns typed JSON.
5. Prisma persists data into PostgreSQL.

## 2. Folder structure

```text
BOOKS/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── app.ts
│   │   └── server.ts
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   └── types/
│   └── .env.example
├── PROJECT_GUIDE.md
├── SETUP.md
└── package.json
```

## 3. Database schema

Main Prisma models:

- `User`: auth, role, avatar, headline, points, streaks, preferences.
- `Category`: content taxonomy and accent color.
- `Book`: shared content entity for audio, PDF, and store inventory.
- `Progress`: reading/listening sync state.
- `Annotation`: highlight, underline, and note storage.
- `Discussion`: book-level comments.
- `Quote`: curated literary quotes.
- `Quiz`, `QuizQuestion`, `QuizAttempt`: weekly challenge system.
- `RewardEvent`: auditable gamification events.
- `Cart`, `CartItem`, `Order`, `OrderItem`: commerce pipeline.

Schema source: [schema.prisma](/home/fsociety/Codes/BOOKS/backend/prisma/schema.prisma)

## 4. API routes

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Catalog

- `GET /api/catalog/home`
- `GET /api/catalog/quotes`
- `GET /api/books`
- `GET /api/books/:slug`
- `GET /api/books/:slug/discussions`
- `POST /api/books/:slug/discussions`
- `GET /api/books/:slug/annotations`
- `POST /api/books/:slug/annotations`

### Progress and gamification

- `GET /api/progress/me`
- `PUT /api/progress`
- `GET /api/quizzes/weekly`
- `POST /api/quizzes/weekly/submit`
- `GET /api/users/leaderboard`
- `GET /api/users/dashboard`
- `GET /api/users/recommendations`

### Store

- `GET /api/store/cart`
- `POST /api/store/cart/items`
- `PATCH /api/store/cart/items/:itemId`
- `DELETE /api/store/cart/items/:itemId`
- `POST /api/store/checkout`
- `GET /api/store/orders`

### Admin

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `GET /api/admin/books`
- `GET /api/admin/orders`

## 5. UI page plan

- `/`: premium landing page with hero, metrics, featured catalog, categories, quotes.
- `/login`, `/register`: secure auth entry points.
- `/dashboard`: rewards, streak, continue reading/listening, recommendations, quiz, orders.
- `/audio-books`: audiobook catalog.
- `/audio-books/[slug]`: audio player, progress sync, notes, discussions, related books.
- `/pdf-books`: PDF catalog.
- `/pdf-books/[slug]`: PDF reader, page sync, annotations, discussions, related books.
- `/store`: commerce catalog.
- `/cart`: cart management.
- `/checkout`: checkout + points redemption.
- `/quiz`: weekly quiz flow.
- `/leaderboard`: public leaderboard.
- `/admin`: admin console.

## 6. Full frontend code

Frontend source lives in: [frontend/src](/home/fsociety/Codes/BOOKS/frontend/src)

Key implementation areas:

- App shell and global theme: [layout.tsx](/home/fsociety/Codes/BOOKS/frontend/src/app/layout.tsx), [globals.css](/home/fsociety/Codes/BOOKS/frontend/src/app/globals.css)
- Auth bridge: [auth.ts](/home/fsociety/Codes/BOOKS/frontend/src/lib/auth.ts)
- API client and shared types: [api.ts](/home/fsociety/Codes/BOOKS/frontend/src/lib/api.ts), [types.ts](/home/fsociety/Codes/BOOKS/frontend/src/lib/types.ts)
- Reusable UI: [components](/home/fsociety/Codes/BOOKS/frontend/src/components)

## 7. Full backend code

Backend source lives in: [backend/src](/home/fsociety/Codes/BOOKS/backend/src)

Key implementation areas:

- Express composition: [app.ts](/home/fsociety/Codes/BOOKS/backend/src/app.ts)
- Auth and security: [auth.controller.ts](/home/fsociety/Codes/BOOKS/backend/src/controllers/auth.controller.ts), [auth.middleware.ts](/home/fsociety/Codes/BOOKS/backend/src/middlewares/auth.middleware.ts)
- Domain services: [gamification.service.ts](/home/fsociety/Codes/BOOKS/backend/src/services/gamification.service.ts)
- Prisma singleton: [prisma.ts](/home/fsociety/Codes/BOOKS/backend/src/lib/prisma.ts)

## 8. Admin panel

Admin UI route: [admin/page.tsx](/home/fsociety/Codes/BOOKS/frontend/src/app/admin/page.tsx)

Admin API routes:

- [admin.routes.ts](/home/fsociety/Codes/BOOKS/backend/src/routes/admin.routes.ts)
- [admin.controller.ts](/home/fsociety/Codes/BOOKS/backend/src/controllers/admin.controller.ts)

Coverage:

- topline metrics
- recent orders
- users overview
- catalog overview

## 9. Seed data

Seed source: [seed.ts](/home/fsociety/Codes/BOOKS/backend/prisma/seed.ts)

Included:

- admin user
- reader users
- audio books
- PDF books
- store inventory
- quotes
- weekly quiz
- progress, rewards, cart, and orders

## 10. Run instructions

Detailed setup: [SETUP.md](/home/fsociety/Codes/BOOKS/SETUP.md)

Quick start:

1. Copy env examples for frontend and backend.
2. Install dependencies from repo root with `npm install --legacy-peer-deps`.
3. Generate Prisma client with `npm run prisma:generate --workspace=backend`.
4. Push schema with `npm run prisma:push --workspace=backend`.
5. Seed demo data with `npm run seed --workspace=backend`.
6. Start both apps with `npm run dev`.
