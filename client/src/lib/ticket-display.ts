import type { TicketStatus } from "core/constants/ticket-status.ts";

export function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

// The Badge component's built-in "secondary"/"outline" variants use theme
// tokens that are nearly white in light mode (--secondary/--muted are 97%
// lightness vs. a 100% white background), so they're almost invisible on
// this app's table rows. UsersPage's role badge already works around this
// with explicit foreground-based classes instead of those variants — do
// the same here per status, on top of the "outline" variant as a neutral
// base (Badge's own default variant would otherwise paint every status
// primary-purple).
export const statusBadgeClassName: Record<TicketStatus, string> = {
  new: "border-transparent bg-foreground/10 text-foreground",
  processing: "border-transparent bg-foreground/10 text-foreground",
  open: "border-transparent bg-primary text-primary-foreground",
  resolved: "border-transparent bg-foreground/10 text-foreground",
  closed: "border-border text-muted-foreground",
};
