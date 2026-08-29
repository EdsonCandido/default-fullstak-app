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

Toda configuração fica em **um único `.env` na raiz** do monorepo. Não crie `.env` dentro de `apps/`.

| Variable | Default | Description |
|---|---|---|
| `WEB_PORT` | `3001` | Porta do front (dev/docker local) |
| `SERVER_PORT` | `3000` | Porta da API (dev/docker local) |
| `POSTGRES_PORT` | `5432` | Porta do Postgres (dev/docker local) |
| `POSTGRES_PASSWORD` | `password` | Senha do Postgres |
| `WEB_DOMAIN` | `app.exemplo.com` | Domínio do front (produção / NPM) |
| `API_DOMAIN` | `api.exemplo.com` | Domínio da API (produção / NPM) |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/default-full-app` | Connection string |
| `BETTER_AUTH_SECRET` | (placeholder) | Secret ≥ 32 chars |
| `BETTER_AUTH_URL` | `http://localhost:3000` | Base URL do Better Auth |
| `CORS_ORIGIN` | `http://localhost:3001` | Origin CORS do web |
| `VITE_SERVER_URL` | `http://localhost:3000` | URL da API no client (build-time no Docker) |

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
| `npm run docker:up` | Stack Docker completa (dev/local) |
| `npm run docker:prod:up` | Stack Docker produção (atrás do NPM) |
| `npm run docker:npm:up` | Sobe Nginx Proxy Manager (80/443/81) |
| `npm run docker:npm:down` | Para o Nginx Proxy Manager |
| `npm run docker:npm:logs` | Logs do Nginx Proxy Manager |

## Docker

### Desenvolvimento / local

```bash
npm run docker:build
npm run docker:up
```

Variáveis lidas do `.env` da raiz.

### Produção (Nginx Proxy Manager)

Arquitetura com subdomínios separados atrás do [Nginx Proxy Manager](https://nginxproxymanager.com/):

```
Internet :443
      ↓
[Nginx Proxy Manager]  ← único com portas 80/443 no host
      ↓ rede "proxy"
   ┌──┴──┐
   web   server
         postgres (só rede interna)
```

- `https://app.exemplo.com` → container `web` (nginx, porta 80)
- `https://api.exemplo.com` → container `server` (Express, porta 3000)

#### Passo 1 — DNS

Aponte os domínios para o IP do servidor:

| Domínio | Tipo | Valor |
|---|---|---|
| `app.exemplo.com` | A | IP do servidor |
| `api.exemplo.com` | A | IP do servidor |

Espere a propagação antes de solicitar SSL.

#### Passo 2 — Rede Docker

```bash
docker network create proxy
```

#### Passo 3 — Nginx Proxy Manager

```bash
npm run docker:npm:up
```

Painel admin: `http://IP_DO_SERVIDOR:81`

Login padrão: `admin@example.com` / `changeme` (troque no primeiro acesso).

#### Passo 4 — Variáveis de produção

```bash
cp .env.production.example .env
```

Edite com seus domínios reais:

```env
WEB_DOMAIN=app.exemplo.com
API_DOMAIN=api.exemplo.com
BETTER_AUTH_SECRET=<openssl rand -base64 32>
POSTGRES_PASSWORD=<senha-forte>
BETTER_AUTH_URL=https://api.exemplo.com
CORS_ORIGIN=https://app.exemplo.com
VITE_SERVER_URL=https://api.exemplo.com
NODE_ENV=production
```

#### Passo 5 — Subir a aplicação

```bash
npm run docker:prod:up
```

Sobe `web`, `server` e `postgres` sem expor portas no host — acessíveis apenas pela rede `proxy`.

O container `server` aplica migrations automaticamente no startup antes de iniciar a API.

#### Passo 6 — Proxy Hosts no NPM

Acesse o painel (`:81`) → **Hosts** → **Proxy Hosts** → **Add Proxy Host**.

**Host 1 — Frontend**

| Campo | Valor |
|---|---|
| Domain Names | `app.exemplo.com` |
| Scheme | `http` |
| Forward Hostname / IP | `web` |
| Forward Port | `80` |
| Block Common Exploits | ✅ |
| Websockets Support | ❌ |

Aba **SSL**: Request a new SSL Certificate, Force SSL, HTTP/2 Support, aceitar termos Let's Encrypt.

**Host 2 — API**

| Campo | Valor |
|---|---|
| Domain Names | `api.exemplo.com` |
| Scheme | `http` |
| Forward Hostname / IP | `server` |
| Forward Port | `3000` |
| Block Common Exploits | ✅ |
| Websockets Support | opcional |

Mesma configuração SSL do host 1.

Use `web` e `server` como hostname — são os aliases na rede `proxy`. Só funcionam se NPM e app estiverem na mesma rede.

#### Passo 7 — Verificar

- `https://app.exemplo.com` — carrega o front
- `https://api.exemplo.com` — retorna `OK`
- Login no app — testa Better Auth + cookies
- Dashboard — testa tRPC

#### Checklist

- [ ] DNS apontando `app` + `api` para o servidor
- [ ] Rede Docker `proxy` criada
- [ ] NPM rodando nas portas 80/443/81
- [ ] NPM conectado à rede `proxy`
- [ ] `.env` de produção preenchido
- [ ] `npm run docker:prod:up`
- [ ] Proxy Host `app.exemplo.com` → `web:80` com SSL
- [ ] Proxy Host `api.exemplo.com` → `server:3000` com SSL
- [ ] Login e API funcionando

#### Variáveis críticas em produção

| Variável | Deve ser |
|---|---|
| `BETTER_AUTH_URL` | `https://api.seudominio.com` |
| `CORS_ORIGIN` | `https://app.seudominio.com` |
| `VITE_SERVER_URL` | `https://api.seudominio.com` (build-time — rebuild se mudar) |
| `BETTER_AUTH_SECRET` | ≥ 32 caracteres, aleatório |
| `NODE_ENV` | `production` |

Gere um secret seguro: `openssl rand -base64 32`

#### Problemas comuns

| Sintoma | Causa provável |
|---|---|
| 502 Bad Gateway | NPM não está na rede `proxy` ou hostname errado |
| SSL não emite | DNS ainda não propagou ou porta 80 bloqueada |
| Login falha / cookies | `BETTER_AUTH_URL` ou `CORS_ORIGIN` com HTTP em vez de HTTPS |
| Front chama API errada | `VITE_SERVER_URL` errado — precisa rebuild da imagem `web` |
| CORS error | `CORS_ORIGIN` não bate com domínio do front |

Ver [Deploying with Docker Compose](https://www.better-t-stack.dev/docs/guides/docker).
