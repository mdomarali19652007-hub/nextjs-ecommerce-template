# Medusa Backend

Medusa v2 commerce backend for the Next.js storefront in the parent repo.
Lives at `/medusa`. The storefront stays at the repo root.

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (a local instance or a managed URL)
- Redis 6+ (optional in dev, required in prod for the event bus)

## First-time setup

```bash
cd medusa
cp .env.template .env
# edit .env: set DATABASE_URL, REDIS_URL, JWT_SECRET, COOKIE_SECRET
npm install
npm run db:setup        # creates the database and runs all migrations
npm run user -- -e admin@example.com -p change-me
```

## Run the server

```bash
npm run dev             # starts on http://localhost:9000
```

The admin panel is served by Medusa itself at `http://localhost:9000/app`.

## Generate a publishable API key

The storefront authenticates to `/store/*` with a publishable API key.

1. Log in to `http://localhost:9000/app`.
2. Settings → Publishable API Keys → **Create**.
3. Name it `storefront-dev`.
4. Associate it with at least one Sales Channel (the default sales channel is fine).
5. Copy the `pk_...` value. Put it in the **storefront** env:

```bash
# in the repo root .env.local
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
```

## Seeding the catalog

Once Phase 6 lands, run:

```bash
npm run seed
```

That script (`src/scripts/seed-storefront.ts`) creates:

- A Bangladesh region with currency BDT.
- The 7 categories defined in the storefront's `Home/Categories/categoryData.ts`.
- The 12 products defined in `src/components/Shop/shopData.ts`, with prices
  in BDT and image URLs pointing at the existing `/public/images/products/*`
  assets served by the storefront.

## CORS

`medusa-config.ts` reads CORS origins from env. Production deployments must
set the real storefront and admin origins:

```
STORE_CORS=https://shop.example.com
ADMIN_CORS=https://admin.example.com
AUTH_CORS=https://shop.example.com,https://admin.example.com
```

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload. |
| `npm run build` | Build the server and admin bundle. |
| `npm run start` | Start the production server. |
| `npm run db:migrate` | Run pending migrations. |
| `npm run db:rollback` | Roll back the last migration. |
| `npm run db:reset` | Drop and recreate the database. **Destructive.** |
| `npm run user -- -e x@y -p z` | Create or update an admin user. |
| `npm run seed` | Seed the storefront catalog. |

## Production deployment

Recommended: deploy the server to a Node host (Railway, Render, Fly, ECS),
point `DATABASE_URL` at a managed Postgres, `REDIS_URL` at a managed Redis,
and serve the admin panel from the same Node process. Alternatively, deploy
the admin panel separately by setting `DISABLE_MEDUSA_ADMIN=true` and using
`@medusajs/admin-sdk` to host it.

Set `MEDUSA_WORKER_MODE=server` for the API node and `MEDUSA_WORKER_MODE=worker`
for a separate background-jobs node.
