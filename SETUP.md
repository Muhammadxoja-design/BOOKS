# Bookora Setup

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm 10+

## Environment

1. Copy [backend/.env.example](/home/fsociety/Codes/BOOKS/backend/.env.example) to `backend/.env`
2. Copy [frontend/.env.example](/home/fsociety/Codes/BOOKS/frontend/.env.example) to `frontend/.env`

## Install

From repo root:

```bash
npm install --legacy-peer-deps
```

## Database

```bash
npm run prisma:generate --workspace=backend
npm run prisma:push --workspace=backend
npm run seed --workspace=backend
```

Seeded demo accounts:

- Admin: `admin@bookora.app` / `password123`
- Reader: `reader@bookora.app` / `password123`
- Listener: `listener@bookora.app` / `password123`

## Development

Run both apps together:

```bash
npm run dev
```

Or separately:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

URLs:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

## Production checks

```bash
cd backend && npm run build
cd frontend && npm run build
```

## Vercel deployment

Use 2 separate Vercel projects.

### 1. Backend API project

- Project root: repository root
- Config file used: [vercel.json](/home/fsociety/Codes/BOOKS/vercel.json)
- Result: `/api/*` routes served from [api/index.ts](/home/fsociety/Codes/BOOKS/api/index.ts)
- Root URL `/` returns API status payload
- Health URL `/health` returns health payload
- Required env:
  - `DATABASE_URL`
  - `JWT_SECRET`

### 2. Frontend project

- Project root directory: `frontend`
- Framework: Next.js
- Output Directory: leave empty
- Required env:
  - `NEXT_PUBLIC_API_URL=/backend`
  - `BACKEND_INTERNAL_URL=https://books-kappa-drab.vercel.app/api`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL=https://<your-frontend-domain>`

This gives you one public frontend domain while forwarding `/backend/*` from the frontend project to the backend Vercel project.

Do not deploy the repository root as a single combined frontend+backend Vercel app. According to Vercel monorepo docs, each app directory should be its own Vercel project, and if you want one public domain you should proxy one project to the other with rewrites.

## Notes

- Frontend build passes with image optimization warnings because seeded remote assets use raw `<img>` tags for portability.
- Backend uses Prisma + PostgreSQL and expects a valid `DATABASE_URL`.
- Product architecture, page map, and route inventory live in [PROJECT_GUIDE.md](/home/fsociety/Codes/BOOKS/PROJECT_GUIDE.md).
