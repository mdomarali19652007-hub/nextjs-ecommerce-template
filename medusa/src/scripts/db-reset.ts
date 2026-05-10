/**
 * Drop the application database so the next `medusa db:setup` runs against a
 * clean slate. Replacement for the broken `medusa db:reset` script reference
 * (the v2 CLI does not ship a `db:reset` command).
 *
 * Resolution order for the target database name and admin connection:
 *   1. DATABASE_URL  (e.g. postgres://user:pass@host:5432/medusa_store)
 *   2. DB_NAME / DB_HOST / DB_PORT / DB_USERNAME / DB_PASSWORD env vars
 *      (the same fallbacks the medusa CLI uses when DATABASE_URL is absent)
 *
 * The drop is executed by connecting to the cluster's `postgres` admin
 * database, terminating any active connections to the target, and issuing a
 * `DROP DATABASE IF EXISTS`. This is intentionally destructive — only run it
 * on environments you own.
 */
import { Client } from "pg";
import { loadEnv } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

type AdminConnection = {
  host: string;
  port: number;
  user: string;
  password: string;
  ssl: boolean;
  targetDatabase: string;
};

const parseConnection = (): AdminConnection => {
  const url = process.env.DATABASE_URL;
  if (url) {
    const parsed = new URL(url);
    const overrideDb = process.env.DB_NAME?.trim();
    return {
      host: parsed.hostname || "localhost",
      port: parsed.port ? Number(parsed.port) : 5432,
      user: decodeURIComponent(parsed.username || "postgres"),
      password: decodeURIComponent(parsed.password || ""),
      ssl: parsed.searchParams.get("sslmode") === "require",
      targetDatabase:
        overrideDb || decodeURIComponent(parsed.pathname.replace(/^\//, "")) || "medusa",
    };
  }

  const targetDatabase = process.env.DB_NAME?.trim();
  if (!targetDatabase) {
    throw new Error(
      "Cannot determine target database. Set DATABASE_URL or DB_NAME in medusa/.env."
    );
  }
  return {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    user: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "",
    ssl: process.env.DB_SSL === "true",
    targetDatabase,
  };
};

const main = async () => {
  const conn = parseConnection();

  if (!conn.targetDatabase || conn.targetDatabase === "postgres") {
    throw new Error(
      `Refusing to drop database "${conn.targetDatabase}" — pick a non-system database name.`
    );
  }

  // eslint-disable-next-line no-console
  console.log(
    `Dropping database "${conn.targetDatabase}" on ${conn.host}:${conn.port} ...`
  );

  const client = new Client({
    host: conn.host,
    port: conn.port,
    user: conn.user,
    password: conn.password,
    database: "postgres",
    ssl: conn.ssl ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  try {
    // Terminate active connections so the DROP doesn't fail on session locks.
    await client.query(
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()",
      [conn.targetDatabase]
    );
    await client.query(`DROP DATABASE IF EXISTS "${conn.targetDatabase}"`);
  } finally {
    await client.end();
  }

  // eslint-disable-next-line no-console
  console.log(
    `Dropped "${conn.targetDatabase}". Run \`npm run db:setup\` to recreate and migrate.`
  );
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
