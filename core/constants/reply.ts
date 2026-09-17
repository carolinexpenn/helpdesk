import type { SenderType } from "./sender-type";
import type { TicketAgent } from "./ticket";

export interface Reply {
  id: number;
  body: string;
  senderType: SenderType;
  user: TicketAgent | null;
  createdAt: string;
}
