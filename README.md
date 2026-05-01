# Free eCommerce Template for Next.js - NextMerce

The free Next.js eCommerce template is a lite version of the NextMerce Next.js eCommerce boilerplate, designed to streamline the launch and management of your online store.

![NextMerce](https://github.com/user-attachments/assets/57155689-a756-4222-8af7-134e556acae2)

---

## 🚀 Quickstart

This template is a Next.js storefront wired to a [Medusa v2](https://docs.medusajs.com/) backend. The repo holds both:

- **Storefront** — Next.js 16 + React 19, lives at the repo root.
- **Backend** — Medusa v2, lives in [`/medusa`](medusa).

### 1. Prerequisites

- Node.js 20+
- PostgreSQL 14+ (local or managed)
- Redis 6+ (optional in dev, required in prod)

### 2. Start the backend

```bash
cd medusa
cp .env.template .env
# edit .env: set DATABASE_URL, REDIS_URL, JWT_SECRET, COOKIE_SECRET

npm install
npm run db:setup                                # creates DB + runs migrations
npm run user -- -e admin@example.com -p change-me
npm run seed                                    # BDT region, 7 categories, 8 products, prints publishable key
npm run dev                                     # http://localhost:9000
```

The seed prints a `pk_…` publishable key. Copy it.

### 3. Start the storefront

In a second terminal, from the repo root:

```bash
cp .env.example .env.local
# paste the pk_... from the seed into NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY

npm install
npm run dev                                     # http://localhost:3000
```

That's it. Home, shop, cart, and checkout all pull live data from Medusa. The cart id is persisted in `localStorage` under `medusa_cart_id` so it survives reloads.

### 4. Admin panel

Medusa serves the admin at `http://localhost:9000/app`. Log in with the admin user you created in step 2.

### Useful commands

| Where | Command | What it does |
|---|---|---|
| `/medusa` | `npm run dev` | Start the backend with hot reload |
| `/medusa` | `npm run db:migrate` | Run pending migrations |
| `/medusa` | `npm run seed` | Re-seed the BDT catalog |
| `/medusa` | `npm run user -- -e x -p y` | Create or update an admin user |
| repo root | `npm run dev` | Start the storefront |
| repo root | `npm run build` | Production build (28 prerendered pages, including `/shop-details/[handle]` driven by Medusa handles) |

### Architecture in one line

Server Components (`src/app/(site)/...`) call helpers in [`src/lib/medusa/`](src/lib/medusa) (products, region, cart) which use `@medusajs/js-sdk`. Cart state lives in Redux ([`src/redux/features/cart-slice.ts`](src/redux/features/cart-slice.ts) + [`cart-thunks.ts`](src/redux/features/cart-thunks.ts)) with the Medusa cart as the source of truth and optimistic local updates for snappy UI.

For deeper backend instructions (production deploy, CORS, worker mode, OTel), see [`medusa/README.md`](medusa/README.md).

---

While NextMerce Pro features advanced functionalities, seamless integration, and customizable options, providing all the essential tools needed to build and expand your business, the lite version offers a basic Next.js template specifically crafted for eCommerce websites. Both versions ensure superior performance and flexibility, all powered by Next.js.

### NextMerce Free VS NextMerce Pro

| ✨ Features                         | 🎁 NextMerce Free                 | 🔥 NextMerce Pro                        |
|----------------------------------|--------------------------------|--------------------------------------|
| Next.js Pages                    | Static                         | Dynamic Boilerplate Template         |
| Components                       | Limited                        | All According to Demo                |
| eCommerce Functionality          | Included                       | Included                             |
| Integrations (DB, Auth, etc.)    | Not Included                   | Included                             |
| Community Support                | Included                       | Included                             |
| Premium Email Support            | Not Included                   | Included                             |
| Lifetime Free Updates            | Included                       | Included                             |


#### [🚀 Live Demo](https://demo.nextmerce.com/)

#### [🌐 Visit Website](https://nextmerce.com/)

## Update Logs

Version 0.1.2 - [Mar 16, 2026]
- Update Next.js, React, and React DOM dependencies, add baseline-browser-mapping