import express from "express";
import { prisma } from "./lib/prisma.ts";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function boot() {
  await prisma.$connect();
  console.log("Connected to the helpdesk database");

  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}

boot();
