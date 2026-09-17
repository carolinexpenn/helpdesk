import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { agentTicketStatuses, type TicketStatus } from "core/constants/ticket-status.ts";
import { ticketCategories, type TicketCategory } from "core/constants/ticket-category.ts";
import type { TicketListItem } from "core/constants/ticket.ts";
import type { TicketSortField } from "core/schemas/tickets.ts";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorAlert from "@/components/ErrorAlert";

interface TicketListResponse {
  tickets: TicketListItem[];
  total: number;
  page: number;
  pageSize: number;
}

const pageSize = 10;

const statusBadgeVariant: Record<TicketStatus, "default" | "secondary" | "outline"> = {
  new: "outline",
  processing: "outline",
  open: "default",
  resolved: "secondary",
  closed: "outline",
};

function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

function TicketsPage() {
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [category, setCategory] = useState<TicketCategory | "all">("all");
  const [sort, setSort] = useState<{ field: TicketSortField; direction: "asc" | "desc" }>({
    field: "createdAt",
    direction: "desc",
  });
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const { data, isPending, error } = useQuery({
    queryKey: ["tickets", { search, status, category, sort, page }],
    queryFn: () =>
      api
        .get<TicketListResponse>("/tickets", {
          params: {
            search: search || undefined,
            status: status === "all" ? undefined : status,
            category: category === "all" ? undefined : category,
            sortBy: sort.field,
            sortOrder: sort.direction,
            page,
            pageSize,
          },
        })
        .then((res) => res.data),
    placeholderData: (previous) => previous,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / pageSize)) : 1;

  function toggleSort(field: TicketSortField) {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" },
    );
    setPage(1);
  }

  function SortableHead({
    field,
    children,
  }: {
    field: TicketSortField;
    children: React.ReactNode;
  }) {
    const active = sort.field === field;
    return (
      <TableHead
        onClick={() => toggleSort(field)}
        className="cursor-pointer select-none hover:text-foreground"
      >
        <span className={cn("inline-flex items-center gap-1", active && "text-primary")}>
          {children}
          {active ? (
            sort.direction === "asc" ? (
              <ChevronUp className="size-3.5" />
            ) : (
              <ChevronDown className="size-3.5" />
            )
          ) : (
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          )}
        </span>
      </TableHead>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-primary">Tickets</h1>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search subject or sender..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-xs"
        />
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value as TicketStatus | "all");
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status">
              {(value: TicketStatus | "all") =>
                value === "all" ? "All statuses" : formatLabel(value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {agentTicketStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {formatLabel(s)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value as TicketCategory | "all");
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category">
              {(value: TicketCategory | "all") =>
                value === "all" ? "All categories" : formatLabel(value)
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {ticketCategories.map((c) => (
              <SelectItem key={c} value={c}>
                {formatLabel(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && <ErrorAlert error={error} fallback="Failed to load tickets" />}

      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <SortableHead field="subject">Subject</SortableHead>
            <SortableHead field="senderName">Sender</SortableHead>
            <SortableHead field="status">Status</SortableHead>
            <SortableHead field="category">Category</SortableHead>
            <TableHead>Assigned to</TableHead>
            <SortableHead field="createdAt">Created</SortableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                </TableRow>
              ))
            : data?.tickets.map((ticket) => (
                <TableRow
                  key={ticket.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/tickets/${ticket.id}`)}
                >
                  <TableCell className="font-medium">{ticket.subject}</TableCell>
                  <TableCell>
                    <div>{ticket.senderName}</div>
                    <div className="text-xs text-muted-foreground">{ticket.senderEmail}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[ticket.status]} className="capitalize">
                      {ticket.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{ticket.category ? formatLabel(ticket.category) : "—"}</TableCell>
                  <TableCell>
                    {ticket.assignedTo ? (
                      ticket.assignedTo.name
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell className="oldstyle-nums">
                    {new Date(ticket.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                </TableRow>
              ))}
          {!isPending && data?.tickets.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No tickets found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {data ? `${data.total} ticket${data.total === 1 ? "" : "s"}` : null}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default TicketsPage;
