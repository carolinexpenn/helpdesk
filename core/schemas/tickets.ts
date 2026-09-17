import { z } from "zod/v4";
import { agentTicketStatuses } from "../constants/ticket-status";
import { ticketCategories } from "../constants/ticket-category";

export const inboundEmailSchema = z.object({
  senderName: z.string().trim().min(1, "Sender name is required").max(255, "Sender name is too long"),
  senderEmail: z.email("Enter a valid email"),
  subject: z.string().trim().min(1, "Subject is required").max(255, "Subject is too long"),
  body: z.string().trim().min(1, "Body is required").max(5000, "Body is too long"),
  bodyHtml: z.string().max(10000, "HTML body is too long").optional(),
});

export type InboundEmailInput = z.infer<typeof inboundEmailSchema>;

const sortableTicketColumns = ["subject", "senderName", "status", "category", "createdAt"] as const;

export type TicketSortField = (typeof sortableTicketColumns)[number];

export const ticketListQuerySchema = z.object({
  sortBy: z.enum(sortableTicketColumns).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  status: z.enum(agentTicketStatuses).optional(),
  category: z.enum(ticketCategories).optional(),
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
});

export type TicketListQuery = z.infer<typeof ticketListQuerySchema>;

export const updateTicketSchema = z.object({
  assignedToId: z.string().nullable().optional(),
  status: z.enum(agentTicketStatuses).optional(),
  category: z.enum(ticketCategories).nullable().optional(),
});

export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
