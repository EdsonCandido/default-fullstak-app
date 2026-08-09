import { db } from "@default-full-app/db";
import { user } from "@default-full-app/db/schema/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { protectedProcedure, router } from "../index";

export const profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        jobTitle: user.jobTitle,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .where(eq(user.id, ctx.session.user.id))
      .limit(1);

    const profile = rows[0];
    if (!profile) {
      return {
        id: ctx.session.user.id,
        name: ctx.session.user.name,
        email: ctx.session.user.email,
        image: ctx.session.user.image ?? null,
        jobTitle: null as string | null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    return profile;
  }),

  update: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(120),
        jobTitle: z.string().max(120).nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updated] = await db
        .update(user)
        .set({
          name: input.name,
          ...(input.jobTitle !== undefined ? { jobTitle: input.jobTitle } : {}),
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.session.user.id))
        .returning({
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          jobTitle: user.jobTitle,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        });

      if (!updated) {
        return {
          id: ctx.session.user.id,
          name: input.name,
          email: ctx.session.user.email,
          image: ctx.session.user.image ?? null,
          jobTitle: input.jobTitle ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      return updated;
    }),
});
