import DOMPurify from "dompurify";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "react-router";
import { agentTicketStatuses, type TicketStatus } from "core/constants/ticket-status.ts";
import { ticketCategories, type TicketCategory } from "core/constants/ticket-category.ts";
import { createReplySchema, type CreateReplyInput } from "core/schemas/replies.ts";
import type { Ticket, TicketAgent } from "core/constants/ticket.ts";
import type { Reply } from "core/constants/reply.ts";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorAlert from "@/components/ErrorAlert";
import ErrorMessage from "@/components/ErrorMessage";

const UNASSIGNED = "unassigned";

function formatLabel(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, " ");
}

function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const {
    data: ticket,
    isPending,
    error,
  } = useQuery({
    queryKey: ["tickets", id],
    queryFn: () => api.get<Ticket>(`/tickets/${id}`).then((res) => res.data),
  });

  const { data: agents } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<TicketAgent[]>("/users").then((res) => res.data),
  });

  const { data: replies, error: repliesError } = useQuery({
    queryKey: ["tickets", id, "replies"],
    queryFn: () => api.get<Reply[]>(`/tickets/${id}/replies`).then((res) => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { status?: TicketStatus; category?: TicketCategory | null; assignedToId?: string | null }) =>
      api.patch(`/tickets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateReplyInput>({
    resolver: zodResolver(createReplySchema),
    defaultValues: { body: "" },
  });

  const replyMutation = useMutation({
    mutationFn: (data: CreateReplyInput) => api.post(`/tickets/${id}/replies`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", id, "replies"] });
      reset({ body: "" });
    },
  });

  function onSubmitReply(data: CreateReplyInput) {
    replyMutation.mutate(data);
  }

  if (isPending) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-4 h-32 w-full" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="p-6">
        <ErrorAlert error={error} fallback="Failed to load ticket" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Link to="/tickets" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to tickets
      </Link>

      <div className="mt-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            From {ticket.senderName} &lt;{ticket.senderEmail}&gt; on{" "}
            {new Date(ticket.createdAt).toLocaleString("en-GB")}
          </p>
        </div>
        <Badge className="capitalize">{ticket.status}</Badge>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Original message</CardTitle>
            </CardHeader>
            <CardContent>
              {ticket.bodyHtml ? (
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(ticket.bodyHtml) }}
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm">{ticket.body}</p>
              )}
            </CardContent>
          </Card>

          <h2 className="mt-6 text-lg font-semibold">Replies</h2>
          {repliesError && <ErrorAlert error={repliesError} fallback="Failed to load replies" />}
          <div className="mt-3 space-y-3">
            {replies?.length === 0 && (
              <p className="text-sm text-muted-foreground">No replies yet.</p>
            )}
            {replies?.map((reply) => (
              <Card key={reply.id}>
                <CardHeader>
                  <CardDescription>
                    {reply.senderType === "agent" ? (reply.user?.name ?? "Agent") : ticket.senderName}{" "}
                    · {new Date(reply.createdAt).toLocaleString("en-GB")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{reply.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmitReply)} className="mt-4">
            {replyMutation.isError && (
              <ErrorAlert error={replyMutation.error} fallback="Failed to send reply" />
            )}
            <Label htmlFor="reply-body" className="mb-1">
              Reply
            </Label>
            <Textarea
              id="reply-body"
              rows={4}
              aria-invalid={!!errors.body}
              {...register("body")}
            />
            <ErrorMessage message={errors.body?.message} />
            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? "Sending..." : "Send reply"}
            </Button>
          </form>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {updateMutation.isError && (
              <ErrorAlert error={updateMutation.error} fallback="Failed to update ticket" />
            )}
            <div>
              <Label className="mb-1">Status</Label>
              <Select
                value={ticket.status}
                onValueChange={(value) => updateMutation.mutate({ status: value as TicketStatus })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>{(value: TicketStatus) => formatLabel(value)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {agentTicketStatuses.map((s) => (
                    <SelectItem key={s} value={s}>
                      {formatLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1">Category</Label>
              <Select
                value={ticket.category ?? "none"}
                onValueChange={(value) =>
                  updateMutation.mutate({ category: value === "none" ? null : (value as TicketCategory) })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: TicketCategory | "none") =>
                      value === "none" ? "Uncategorized" : formatLabel(value)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Uncategorized</SelectItem>
                  {ticketCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {formatLabel(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-1">Assigned to</Label>
              <Select
                value={ticket.assignedToId ?? UNASSIGNED}
                onValueChange={(value) =>
                  updateMutation.mutate({ assignedToId: value === UNASSIGNED ? null : value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) =>
                      value === UNASSIGNED
                        ? "Unassigned"
                        : (agents?.find((agent) => agent.id === value)?.name ?? value)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                  {agents?.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default TicketDetailPage;
