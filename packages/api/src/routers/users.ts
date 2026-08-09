import { auth } from "@default-full-app/auth";
import { db } from "@default-full-app/db";
import { account, session, user } from "@default-full-app/db/schema/auth";
import { TRPCError } from "@trpc/server";
import { hashPassword } from "better-auth/crypto";
import { and, desc, eq, isNotNull, isNull, ne } from "drizzle-orm";
import { z } from "zod";

import {
  displayUserEmail,
  fromSoftDeletedEmail,
  toSoftDeletedEmail,
} from "../lib/soft-delete-email";
import { protectedProcedure, router } from "../index";

const userSelect = {
  id: user.id,
  name: user.name,
  email: user.email,
  jobTitle: user.jobTitle,
  image: user.image,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  deletedAt: user.deletedAt,
} as const;

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres")
  .max(128);

const listStatusSchema = z.enum(["active", "deleted", "all"]).default("active");

function normalizeEmail(email: string) {
  return email.toLowerCase().trim();
}

function mapUserRow(row: {
  id: string;
  name: string;
  email: string;
  jobTitle: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}) {
  return {
    ...row,
    email: displayUserEmail(row.email, row.deletedAt),
  };
}

async function findActiveByEmail(email: string, excludeUserId?: string) {
  const conditions = [eq(user.email, email), isNull(user.deletedAt)];
  if (excludeUserId) {
    conditions.push(ne(user.id, excludeUserId));
  }

  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(and(...conditions))
    .limit(1);

  return row ?? null;
}

async function getUserOrThrow(id: string) {
  const [row] = await db
    .select(userSelect)
    .from(user)
    .where(eq(user.id, id))
    .limit(1);

  if (!row) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Usuário não encontrado",
    });
  }

  return mapUserRow(row);
}

export const usersRouter = router({
  list: protectedProcedure
    .input(
      z
        .object({
          status: listStatusSchema.optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const status = input?.status ?? "active";

      const where =
        status === "active"
          ? isNull(user.deletedAt)
          : status === "deleted"
            ? isNotNull(user.deletedAt)
            : undefined;

      const rows = await db
        .select(userSelect)
        .from(user)
        .where(where)
        .orderBy(desc(user.createdAt));

      return rows.map(mapUserRow);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .query(async ({ input }) => {
      return getUserOrThrow(input.id);
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(120),
        email: z.email("Informe um e-mail válido"),
        password: passwordSchema,
        jobTitle: z.string().max(120).nullable().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const email = normalizeEmail(input.email);

      const activeConflict = await findActiveByEmail(email);
      if (activeConflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Já existe um usuário ativo com este e-mail",
        });
      }

      try {
        const result = await auth.api.signUpEmail({
          body: {
            name: input.name,
            email,
            password: input.password,
          },
        });

        const createdUser = result.user;
        if (!createdUser?.id) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Falha ao criar usuário",
          });
        }

        if (input.jobTitle !== undefined) {
          const [updated] = await db
            .update(user)
            .set({
              jobTitle: input.jobTitle,
              updatedAt: new Date(),
            })
            .where(eq(user.id, createdUser.id))
            .returning(userSelect);

          if (updated) {
            return mapUserRow(updated);
          }
        }

        return getUserOrThrow(createdUser.id);
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }

        const message =
          error instanceof Error ? error.message : "Falha ao criar usuário";

        if (/already|exist|duplicate/i.test(message)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe um usuário com este e-mail",
          });
        }

        throw new TRPCError({
          code: "BAD_REQUEST",
          message,
        });
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1).max(120),
        email: z.email("Informe um e-mail válido").optional(),
        jobTitle: z.string().max(120).nullable().optional(),
        password: passwordSchema.optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const existing = await getUserOrThrow(input.id);

      if (existing.deletedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Não é possível editar um usuário excluído. Restaure-o antes.",
        });
      }

      let nextEmail = existing.email;
      if (input.email !== undefined) {
        nextEmail = normalizeEmail(input.email);
        if (nextEmail !== existing.email) {
          const conflict = await findActiveByEmail(nextEmail, input.id);
          if (conflict) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Já existe um usuário ativo com este e-mail",
            });
          }
        }
      }

      const [updated] = await db
        .update(user)
        .set({
          name: input.name,
          email: nextEmail,
          ...(input.jobTitle !== undefined ? { jobTitle: input.jobTitle } : {}),
          updatedAt: new Date(),
        })
        .where(and(eq(user.id, input.id), isNull(user.deletedAt)))
        .returning(userSelect);

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      if (input.password) {
        const hashed = await hashPassword(input.password);
        const updatedAccounts = await db
          .update(account)
          .set({
            password: hashed,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(account.userId, input.id),
              eq(account.providerId, "credential"),
            ),
          )
          .returning({ id: account.id });

        if (updatedAccounts.length === 0) {
          await db.insert(account).values({
            id: crypto.randomUUID(),
            accountId: input.id,
            providerId: "credential",
            userId: input.id,
            password: hashed,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      }

      return mapUserRow(updated);
    }),

  softDelete: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (input.id === ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não pode excluir a própria conta",
        });
      }

      const [existing] = await db
        .select(userSelect)
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      if (existing.deletedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuário já está excluído",
        });
      }

      const now = new Date();
      const tombstoneEmail = toSoftDeletedEmail(existing.id, existing.email);

      const [updated] = await db
        .update(user)
        .set({
          deletedAt: now,
          email: tombstoneEmail,
          updatedAt: now,
        })
        .where(and(eq(user.id, input.id), isNull(user.deletedAt)))
        .returning(userSelect);

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      await db.delete(session).where(eq(session.userId, input.id));

      return mapUserRow(updated);
    }),

  restore: protectedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const [existing] = await db
        .select(userSelect)
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1);

      if (!existing) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      if (!existing.deletedAt) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuário não está excluído",
        });
      }

      const originalEmail =
        fromSoftDeletedEmail(existing.email) ?? existing.email;
      const restoredEmail = normalizeEmail(originalEmail);

      const conflict = await findActiveByEmail(restoredEmail, input.id);
      if (conflict) {
        throw new TRPCError({
          code: "CONFLICT",
          message:
            "Não é possível restaurar: já existe um usuário ativo com este e-mail",
        });
      }

      const now = new Date();

      const [updated] = await db
        .update(user)
        .set({
          deletedAt: null,
          email: restoredEmail,
          updatedAt: now,
        })
        .where(and(eq(user.id, input.id), isNotNull(user.deletedAt)))
        .returning(userSelect);

      if (!updated) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      return mapUserRow(updated);
    }),
});
