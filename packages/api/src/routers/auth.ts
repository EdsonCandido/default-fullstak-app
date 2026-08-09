import { protectedProcedure, router } from "../index";

export const authRouter = router({
  me: protectedProcedure.query(({ ctx }) => {
    return {
      session: {
        id: ctx.session.session.id,
        expiresAt: ctx.session.session.expiresAt,
        createdAt: ctx.session.session.createdAt,
        ipAddress: ctx.session.session.ipAddress,
        userAgent: ctx.session.session.userAgent,
      },
      user: ctx.session.user,
    };
  }),
});
