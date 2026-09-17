export type TicketStatus = "new" | "processing" | "open" | "resolved" | "closed";

// Statuses agents can see and set. "new" and "processing" are system-managed.
export const agentTicketStatuses = ["open", "resolved", "closed"] as const;
