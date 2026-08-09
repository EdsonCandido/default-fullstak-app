import { createDb } from "@default-full-app/db";
import * as schema from "@default-full-app/db/schema/auth";
import { env } from "@default-full-app/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

function isSecureAuthUrl(url: string) {
  try {
    return new URL(url).protocol === "https:";
  } catch {
    return env.NODE_ENV === "production";
  }
}

export function createAuth() {
  const db = createDb();
  const secureCookies = isSecureAuthUrl(env.BETTER_AUTH_URL);

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema,
    }),
    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
    },
    user: {
      additionalFields: {
        jobTitle: {
          type: "string",
          required: false,
          input: true,
        },
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: secureCookies ? "none" : "lax",
        secure: secureCookies,
        httpOnly: true,
      },
    },
    plugins: [],
  });
}

export const auth = createAuth();
