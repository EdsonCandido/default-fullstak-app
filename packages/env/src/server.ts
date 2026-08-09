import dotenv from "dotenv";
import { createEnv } from "@t3-oss/env-core";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

function findMonorepoRoot(startDir: string) {
  let dir = startDir;
  while (true) {
    if (existsSync(resolve(dir, "turbo.json"))) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) {
      return startDir;
    }
    dir = parent;
  }
}

const monorepoRoot = findMonorepoRoot(dirname(fileURLToPath(import.meta.url)));

dotenv.config({ path: resolve(monorepoRoot, ".env") });

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    SERVER_PORT: z.coerce.number().int().positive().default(3000),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
