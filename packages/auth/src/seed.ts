import { createDb } from "@default-full-app/db";
import { user } from "@default-full-app/db/schema/auth";
import { eq } from "drizzle-orm";

import { auth } from "./index";

const ADMIN_EMAIL = "admin@admin.com";
const ADMIN_NAME = "Administrador";
const ADMIN_PASSWORD = "1234567890";

async function seed() {
  const db = createDb();

  const existing = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log(`Seed skip: admin already exists (${ADMIN_EMAIL})`);
    return;
  }

  await auth.api.signUpEmail({
    body: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  });

  console.log(`Seed ok: admin created (${ADMIN_EMAIL})`);
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });
