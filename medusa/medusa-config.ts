import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

/**
 * Medusa v2 backend configuration for the Next.js ecommerce storefront.
 *
 * CORS notes:
 * - STORE_CORS  → origins allowed to hit /store/* (the Next.js storefront).
 * - ADMIN_CORS  → origins allowed to hit /admin/* (the bundled admin panel).
 * - AUTH_CORS   → origins allowed to hit /auth/* (admin + storefront login).
 *
 * In development, the storefront runs at http://localhost:3000 and the admin
 * is served by Medusa itself at http://localhost:9000/app.
 *
 * Set production origins via env in deployment, never hardcode them.
 */
module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    workerMode: (process.env.MEDUSA_WORKER_MODE as "shared" | "worker" | "server") || "shared",
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000,http://localhost:7001",
      authCors:
        process.env.AUTH_CORS || "http://localhost:3000,http://localhost:9000,http://localhost:7001",
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
  },
  admin: {
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
    backendUrl: process.env.MEDUSA_BACKEND_URL || "http://localhost:9000",
  },
});
