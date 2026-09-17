import { Router } from "express";
import { inboundEmailSchema } from "core/schemas/tickets";
import { prisma } from "../lib/prisma.ts";
import { validate } from "../lib/validate.ts";
import { requireWebhookSecret } from "../middleware/require-webhook-secret.ts";

const router = Router();

router.use(requireWebhookSecret);

router.post("/inbound-email", async (req, res) => {
  const data = validate(inboundEmailSchema, req.body, res);
  if (!data) return;

  const ticket = await prisma.ticket.create({
    data: {
      subject: data.subject,
      body: data.body,
      bodyHtml: data.bodyHtml,
      senderName: data.senderName,
      senderEmail: data.senderEmail,
    },
  });

  res.status(201).json(ticket);
});

export default router;
