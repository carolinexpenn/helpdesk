export const ticketCategories = ["general_question", "technical_question", "refund_request"] as const;

export type TicketCategory = (typeof ticketCategories)[number];
