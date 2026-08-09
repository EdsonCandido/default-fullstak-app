import { db } from "@default-full-app/db";
import { user } from "@default-full-app/db/schema/auth";
import { desc } from "drizzle-orm";

import { protectedProcedure, router } from "../index";

export const usersRouter = router({
  list: protectedProcedure.query(async () => {
    return db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        jobTitle: user.jobTitle,
        image: user.image,
        createdAt: user.createdAt,
      })
      .from(user)
      .orderBy(desc(user.createdAt));
  }),
});
