import { env } from "@default-full-app/env/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
const db = drizzle(pool);

const migrationsFolder = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../src/migrations",
);

try {
  await migrate(db, { migrationsFolder });
  console.log("Migrations applied successfully");
} catch (error) {
  console.error("Migration failed:", error);
  process.exit(1);
} finally {
  await pool.end();
}
