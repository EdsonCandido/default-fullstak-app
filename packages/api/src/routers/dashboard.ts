import { db } from "@default-full-app/db";
import { session, user } from "@default-full-app/db/schema/auth";
import { env } from "@default-full-app/env/server";
import { count, desc, eq, isNull } from "drizzle-orm";

import { protectedProcedure, router } from "../index";

export const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [usersCountRow] = await db
      .select({ value: count() })
      .from(user)
      .where(isNull(user.deletedAt));

    const lastLoginRows = await db
      .select({ createdAt: session.createdAt })
      .from(session)
      .where(eq(session.userId, ctx.session.user.id))
      .orderBy(desc(session.createdAt))
      .limit(1);

    return {
      usersCount: usersCountRow?.value ?? 0,
      activeSession: {
        id: ctx.session.session.id,
        createdAt: ctx.session.session.createdAt,
        expiresAt: ctx.session.session.expiresAt,
      },
      lastLoginAt: lastLoginRows[0]?.createdAt ?? null,
      environment: env.NODE_ENV,
    };
  }),

  recentSessions: protectedProcedure.query(async () => {
    const rows = await db
      .select({
        id: session.id,
        createdAt: session.createdAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        userName: user.name,
        userEmail: user.email,
      })
      .from(session)
      .innerJoin(user, eq(session.userId, user.id))
      .orderBy(desc(session.createdAt))
      .limit(10);

    return rows;
  }),
});
