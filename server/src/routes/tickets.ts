import { Router } from "express";
import { ticketListQuerySchema, updateTicketSchema } from "core/schemas/tickets";
import { requireAuth } from "../middleware/require-auth.ts";
import { validate } from "../lib/validate.ts";
import { parseId } from "../lib/parse-id.ts";
import { prisma } from "../lib/prisma.ts";
import { Prisma } from "../generated/prisma/client.ts";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const query = validate(ticketListQuerySchema, req.query, res);
  if (!query) return;

  const where: Prisma.TicketWhereInput = {};

  if (query.status) {
    where.status = query.status;
  } else {
    where.status = { in: ["open", "resolved", "closed"] };
  }

  if (query.category) {
    where.category = query.category;
  }

  if (query.search) {
    where.OR = [
      { subject: { contains: query.search, mode: "insensitive" } },
      { senderName: { contains: query.search, mode: "insensitive" } },
      { senderEmail: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.TicketOrderByWithRelationInput =
    query.sortBy === "assignedTo"
      ? { assignedTo: { name: query.sortOrder } }
      : { [query.sortBy]: query.sortOrder };

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      orderBy,
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { assignedTo: { select: { id: true, name: true } } },
    }),
    prisma.ticket.count({ where }),
  ]);

  res.json({ tickets, total, page: query.page, pageSize: query.pageSize });
});

router.get("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { assignedTo: { select: { id: true, name: true } } },
  });

  if (!ticket) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  res.json(ticket);
});

router.patch("/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) {
    res.status(400).json({ error: "Invalid ticket ID" });
    return;
  }

  const data = validate(updateTicketSchema, req.body, res);
  if (!data) return;

  const existing = await prisma.ticket.findUnique({ where: { id } });
  if (!existing) {
    res.status(404).json({ error: "Ticket not found" });
    return;
  }

  if (data.assignedToId) {
    const assignee = await prisma.user.findUnique({
      where: { id: data.assignedToId, isDeleted: false },
    });
    if (!assignee) {
      res.status(400).json({ error: "Invalid agent" });
      return;
    }
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      ...("assignedToId" in data && { assignedToId: data.assignedToId }),
      ...("status" in data && { status: data.status }),
      ...("category" in data && { category: data.category }),
    },
    include: { assignedTo: { select: { id: true, name: true } } },
  });

  res.json(ticket);
});

export default router;
