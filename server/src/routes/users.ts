import { Router } from "express";
import { createUserSchema, updateUserSchema } from "core/schemas/users";
import { auth } from "../lib/auth.ts";
import { prisma } from "../lib/prisma.ts";
import { requireAuth } from "../middleware/require-auth.ts";
import { requireAdmin } from "../middleware/require-admin.ts";
import { validate } from "../lib/validate.ts";

const router = Router();

router.use(requireAuth);

// Any signed-in user can list agents (e.g. to populate a ticket "assign to" dropdown).
// Creating, editing and deleting users remains admin-only.
router.get("/", async (_req, res) => {
  const users = await prisma.user.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  });

  res.json(users);
});

router.use(requireAdmin);

router.post("/", async (req, res) => {
  const data = validate(createUserSchema, req.body, res);
  if (!data) return;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    res.status(400).json({ error: "A user with this email already exists" });
    return;
  }

  const ctx = await auth.$context;

  const user = await ctx.internalAdapter.createUser(
    {
      email: data.email,
      name: data.name,
      emailVerified: false,
    },
    { method: "admin" },
  );

  const hashedPassword = await ctx.password.hash(data.password);
  await ctx.internalAdapter.linkAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hashedPassword,
  });

  res.status(201).json(user);
});

router.put("/:id", async (req, res) => {
  const data = validate(updateUserSchema, req.body, res);
  if (!data) return;

  const id = req.params.id;

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.isDeleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const user = await prisma.user.update({
    where: { id },
    data: { name: data.name, email: data.email },
  });

  if (data.password) {
    const ctx = await auth.$context;
    const hashedPassword = await ctx.password.hash(data.password);
    await ctx.internalAdapter.updatePassword(id, hashedPassword);
  }

  res.json(user);
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  if (id === req.user.id) {
    res.status(400).json({ error: "You cannot delete your own account" });
    return;
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing || existing.isDeleted) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  await prisma.user.update({ where: { id }, data: { isDeleted: true, deletedAt: new Date() } });

  res.status(204).end();
});

export default router;
