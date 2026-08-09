# default-full-app

Starter kit SaaS full-stack criado com [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack): React, TanStack Router, Express, tRPC, Drizzle, PostgreSQL e Better Auth.

## Stack

- **TypeScript** — tipagem strict
- **TanStack Router** — file-based routing
- **TailwindCSS** + **shadcn/ui** (`packages/ui`)
- **Express** + **tRPC**
- **Drizzle ORM** + **PostgreSQL**
- **Better Auth** — email/senha
- **Turborepo** — monorepo

## Getting Started

Toda configuração fica no `.env` da raiz.

```bash
cp .env.example .env
npm install
npm run db:start
npm run db:push      # schema (dev) — em prod use db:migrate
npm run db:seed      # cria admin padrão
npm run start:all    # Postgres + web + server
```

- Web: [http://localhost:3001](http://localhost:3001)
- API: [http://localhost:3000](http://localhost:3000)

### Usuário administrador (seed)

| Campo | Valor |
|---|---|
| Nome | Administrador |
| E-mail | `admin@admin.com` |
| Senha | `1234567890` |

A senha é hasheada pelo Better Auth (nunca em texto puro no banco).

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `WEB_PORT` | `3001` | Porta do front |
| `SERVER_PORT` | `3000` | Porta da API |
| `POSTGRES_PORT` | `5432` | Porta do Postgres |
| `POSTGRES_PASSWORD` | `password` | Senha do Postgres |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/default-full-app` | Connection string |
| `BETTER_AUTH_SECRET` | (placeholder) | Secret ≥ 32 chars |
| `BETTER_AUTH_URL` | `http://localhost:3000` | Base URL do Better Auth |
| `CORS_ORIGIN` | `http://localhost:3001` | Origin CORS do web |
| `VITE_SERVER_URL` | `http://localhost:3000` | URL da API no client |

Se mudar portas, sincronize `DATABASE_URL`, `BETTER_AUTH_URL`, `CORS_ORIGIN` e `VITE_SERVER_URL`.

## Recursos do starter

- Login (bloco **login-01** shadcn) com e-mail/senha, lembre-me, loading e erros
- Layout admin (**dashboard-01**): sidebar colapsável, navbar, breadcrumb
- Rotas protegidas: `/dashboard`, `/users`, `/settings`, `/profile`
- Dark/Light/System (persistido)
- Dashboard com métricas e últimos acessos (dados reais)
- Perfil editável (nome, cargo)
- Domínio via tRPC; sessão via Better Auth (`/api/auth/*`)

## UI

Primitives shadcn em `packages/ui`:

```bash
npx shadcn@latest add accordion dialog popover sheet -c packages/ui
```

Import:

```tsx
import { Button } from "@default-full-app/ui/components/button";
```

Tokens globais: `packages/ui/src/styles/globals.css`.

## Structure

```
apps/
  web/          # React + TanStack Router
  server/       # Express + tRPC + Better Auth handler
packages/
  ui/           # shadcn/ui shared
  api/          # routers tRPC
  auth/         # Better Auth + seed
  db/           # Drizzle schema + migrations
  env/          # env validado (zod)
```

## Scripts

| Script | Descrição |
|---|---|
| `npm run start:all` | Postgres + dev web/server |
| `npm run dev` | Dev de todos os apps |
| `npm run build` | Build monorepo |
| `npm run check-types` | Typecheck |
| `npm run db:start` | Sobe Postgres |
| `npm run db:push` | Push schema (dev) |
| `npm run db:generate` | Gera migrations |
| `npm run db:migrate` | Aplica migrations |
| `npm run db:seed` | Seed do admin |
| `npm run db:studio` | Drizzle Studio |
| `npm run docker:up` | Stack Docker completa |

## Docker

```bash
npm run docker:build
npm run docker:up
```

Variáveis lidas do `.env` da raiz. Ver [Deploying with Docker Compose](https://www.better-t-stack.dev/docs/guides/docker).
