import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Role } from "core/constants/role.ts";
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

      {isPending ? (
        <p className="mt-4 text-muted-foreground">Loading...</p>
      ) : (
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
            {sortedUsers?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell>{new Date(user.createdAt).toLocaleDateString("en-GB")}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(user)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <UserFormDialog open={dialogOpen} onOpenChange={setDialogOpen} user={editingUser} />
    </div>
  );
}

export default UsersPage;
