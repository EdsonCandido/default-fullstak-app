import { publicProcedure, router } from "../index";
import { authRouter } from "./auth";
import { dashboardRouter } from "./dashboard";
import { profileRouter } from "./profile";
import { usersRouter } from "./users";

export const appRouter = router({
  healthCheck: publicProcedure.query(() => {
    return "OK";
  }),
  auth: authRouter,
  profile: profileRouter,
  dashboard: dashboardRouter,
  users: usersRouter,
});

export type AppRouter = typeof appRouter;
