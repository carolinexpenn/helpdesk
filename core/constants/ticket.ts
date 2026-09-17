import type { TicketStatus } from "./ticket-status";
import type { TicketCategory } from "./ticket-category";

export interface TicketAgent {
  id: string;
  name: string;
}

export interface Ticket {
  id: number;
  subject: string;
  body: string;
  bodyHtml: string | null;
  status: TicketStatus;
  category: TicketCategory | null;
  senderName: string;
  senderEmail: string;
  assignedToId: string | null;
  assignedTo: TicketAgent | null;
  createdAt: string;
}

// The list endpoint returns a leaner projection of Ticket for the table view.
export type TicketListItem = Pick<
  Ticket,
  "id" | "subject" | "status" | "category" | "senderName" | "senderEmail" | "assignedTo" | "createdAt"
>;
