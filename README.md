# default-full-app

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Router, Express, TRPC, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Express** - Fast, unopinionated web framework
- **tRPC** - End-to-end type-safe APIs
- **Node.js** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## Getting Started

All configuration lives in a single root `.env` file. Apps, Drizzle, and Docker Compose load from it.

1. Copy the example env and install dependencies:

```bash
cp .env.example .env
npm install
```

2. Start PostgreSQL, apply the schema, and run the full stack:

```bash
npm run db:start
npm run db:push
npm run start:all
```

`start:all` starts Postgres (if needed) and runs `npm run dev` for web + server.

Open [http://localhost:3001](http://localhost:3001) for the web app.  
API: [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `WEB_PORT` | `3001` | Host port for the web app (dev server / Compose publish) |
| `SERVER_PORT` | `3000` | Port for the API server in local dev (Compose maps this host port to container `3000`) |
| `POSTGRES_PORT` | `5432` | Host port for PostgreSQL |
| `POSTGRES_PASSWORD` | `password` | PostgreSQL password |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/default-full-app` | DB connection string (local host) |
| `BETTER_AUTH_SECRET` | (placeholder) | Auth secret (≥ 32 chars) |
| `BETTER_AUTH_URL` | `http://localhost:3000` | Better Auth base URL |
| `CORS_ORIGIN` | `http://localhost:3001` | Allowed CORS origin (web URL) |
| `VITE_SERVER_URL` | `http://localhost:3000` | Server URL used by the web client |

If you change ports, also update `DATABASE_URL`, `BETTER_AUTH_URL`, `CORS_ORIGIN`, and `VITE_SERVER_URL` so they stay in sync.

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@default-full-app/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the shadcn CLI from `apps/web`.

## Deployment

### Docker Compose

- Target: web + server + postgres
- Config: `docker-compose.yml` (app Dockerfiles live in `apps/*/Dockerfile`)
- Build images: `npm run docker:build`
- Start full stack: `npm run docker:up`
- Logs: `npm run docker:logs`
- Stop: `npm run docker:down`

Environment variables are read from the root `.env`. Host ports use `WEB_PORT`, `SERVER_PORT`, and `POSTGRES_PORT`. Inside the Compose network, services still use container ports `80` (web), `3000` (server), and `5432` (postgres).

For more details, see the guide on [Deploying with Docker Compose](https://www.better-t-stack.dev/docs/guides/docker).

## Project Structure

```
default-full-app/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Express, TRPC)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   ├── api/         # API layer / business logic
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `npm run start:all`: Start Postgres and all apps in development mode
- `npm run dev`: Start all applications in development mode
- `npm run build`: Build all applications
- `npm run dev:web`: Start only the web application
- `npm run dev:server`: Start only the server
- `npm run check-types`: Check TypeScript types across all apps
- `npm run db:push`: Push schema changes to database
- `npm run db:generate`: Generate database client/types
- `npm run db:migrate`: Run database migrations
- `npm run db:studio`: Open database studio UI
- `npm run db:start`: Start only the Postgres container
- `npm run docker:build`: Build the Docker Compose images
- `npm run docker:up`: Build and start the Docker Compose stack
- `npm run docker:logs`: Tail logs from the Docker Compose stack
- `npm run docker:down`: Stop the Docker Compose stack
