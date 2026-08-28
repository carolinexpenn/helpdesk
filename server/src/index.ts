import express from "express";
import { toNodeHandler } from "better-auth/node";
import { prisma } from "./lib/prisma.ts";
import { auth } from "./lib/auth.ts";
import { requireAuth } from "./middleware/require-auth.ts";

const app = express();
const port = process.env.PORT ?? 3000;

// Mount Better Auth handler BEFORE express.json() — it parses its own request bodies.
// toNodeHandler returns a promise; must be caught for Express 5.
app.all("/api/auth/{*any}", (req, res, next) => {
  toNodeHandler(auth)(req, res).catch(next);
});

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/me", requireAuth, (req, res) => {
  res.json({ user: req.user, session: req.session });
});

async function boot() {
  await prisma.$connect();
  console.log("Connected to the helpdesk database");

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

boot();
