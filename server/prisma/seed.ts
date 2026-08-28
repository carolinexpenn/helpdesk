import { auth } from "../src/lib/auth.ts";
import { Role } from "../src/constants/role.ts";

async function seedAdmin() {
  const ctx = await auth.$context;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  }

  const existing = await ctx.internalAdapter.findUserByEmail(email);
  if (existing) {
    console.log(`User ${email} already exists, skipping`);
    return;
  }

  const user = await ctx.internalAdapter.createUser({
    email,
    name: "Admin",
    emailVerified: true,
    role: Role.admin,
  });

  const hashedPassword = await ctx.password.hash(password);
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hashedPassword,
  });

  console.log(`Created admin user ${email}`);
}

await seedAdmin();
