import { createDb } from "@default-full-app/db";
import * as schema from "@default-full-app/db/schema/auth";
import { env } from "@default-full-app/env/server";
import { betterAuth, APIError } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { and, eq, isNull } from "drizzle-orm";

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
        deletedAt: {
          type: "date",
          required: false,
          input: false,
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
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-in/email") {
          return;
        }

        const email =
          typeof ctx.body === "object" &&
          ctx.body !== null &&
          "email" in ctx.body &&
          typeof ctx.body.email === "string"
            ? ctx.body.email.toLowerCase().trim()
            : null;

        if (!email) {
          return;
        }

        const [activeUser] = await db
          .select({
            id: schema.user.id,
          })
          .from(schema.user)
          .where(
            and(eq(schema.user.email, email), isNull(schema.user.deletedAt)),
          )
          .limit(1);

        if (activeUser) {
          return;
        }

        const [deletedUser] = await db
          .select({ id: schema.user.id })
          .from(schema.user)
          .where(eq(schema.user.email, email))
          .limit(1);

        if (deletedUser) {
          throw new APIError("FORBIDDEN", {
            message: "Esta conta foi desativada",
          });
        }
      }),
    },
    plugins: [],
  });
}

export const auth = createAuth();
