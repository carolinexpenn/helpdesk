import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, ChevronsUpDown, Pencil, Trash2 } from "lucide-react";
import { Role } from "core/constants/role.ts";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorAlert from "@/components/ErrorAlert";
import UserFormDialog, { type EditableUser } from "@/components/UserFormDialog";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

type SortField = "name" | "email" | "role" | "createdAt";
type SortDirection = "asc" | "desc";

function UsersPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<EditableUser | undefined>(undefined);
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>({
    field: "name",
    direction: "asc",
  });

  const { data: users, isPending, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<UserRow[]>("/users").then((res) => res.data),
  });

  const sortedUsers = useMemo(() => {
    if (!users) return users;
    const sorted = [...users].sort((a, b) => a[sort.field].localeCompare(b[sort.field]));
    return sort.direction === "asc" ? sorted : sorted.reverse();
  }, [users, sort]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  function toggleSort(field: SortField) {
    setSort((prev) =>
      prev.field === field
        ? { field, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { field, direction: "asc" },
    );
  }

  function openCreateDialog() {
    setEditingUser(undefined);
    setDialogOpen(true);
  }

  function openEditDialog(user: UserRow) {
    setEditingUser(user);
    setDialogOpen(true);
  }

  function handleDelete(user: UserRow) {
    if (confirm(`Delete ${user.name}? They will lose access to the app.`)) {
      deleteMutation.mutate(user.id);
    }
  }

  function SortableHead({ field, children }: { field: SortField; children: React.ReactNode }) {
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
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-primary">Users</h1>
        <Button onClick={openCreateDialog}>Add user</Button>
      </div>

      {error && <ErrorAlert error={error} fallback="Failed to load users" />}
      {deleteMutation.isError && (
        <ErrorAlert error={deleteMutation.error} fallback="Failed to delete user" />
      )}

      <Table className="mt-4">
        <TableHeader>
          <TableRow>
            <SortableHead field="name">Name</SortableHead>
            <SortableHead field="email">Email</SortableHead>
            <SortableHead field="role">Role</SortableHead>
            <SortableHead field="createdAt">Created</SortableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton className="ml-auto h-4 w-24" />
                  </TableCell>
                </TableRow>
              ))
            : sortedUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === Role.admin ? "default" : "secondary"}
                      className={cn(
                        "border-transparent text-sm capitalize",
                        user.role === Role.admin
                          ? "bg-foreground text-background"
                          : "bg-foreground/10 text-foreground",
                      )}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="oldstyle-nums">
                    {new Date(user.createdAt).toLocaleDateString("en-GB")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Edit"
                      onClick={() => openEditDialog(user)}
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      className="text-destructive"
                      disabled={user.id === session?.user.id}
                      onClick={() => handleDelete(user)}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      <UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editingUser} />
    </div>
  );
}

export default UsersPage;
