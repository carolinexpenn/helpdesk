import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUserSchema, type CreateUserInput } from "core/schemas/users";
import { Role } from "core/constants/role.ts";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ErrorAlert from "@/components/ErrorAlert";
import ErrorMessage from "@/components/ErrorMessage";

export interface EditableUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: EditableUser;
}

function UserFormDialog({ open, onOpenChange, user }: UserFormDialogProps) {
  const isEditing = !!user;
  const queryClient = useQueryClient();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { name: "", email: "", role: Role.agent },
  });

  useEffect(() => {
    if (open) {
      reset(user ? { name: user.name, email: user.email, role: user.role } : { name: "", email: "", role: Role.agent });
    }
  }, [open, user, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateUserInput) =>
      isEditing ? api.put(`/users/${user.id}`, data) : api.post("/users", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
    },
  });

  function onSubmit(data: CreateUserInput) {
    mutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit user" : "Add user"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          {mutation.isError && <ErrorAlert error={mutation.error} fallback="Failed to save user" />}
          <div className="mt-3">
            <Label htmlFor="name" className="mb-1">
              Name
            </Label>
            <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <ErrorMessage message={errors.name.message} />}
          </div>
          <div className="mt-3">
            <Label htmlFor="email" className="mb-1">
              Email
            </Label>
            <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
            {errors.email && <ErrorMessage message={errors.email.message} />}
          </div>
          <div className="mt-3">
            <Label htmlFor="role" className="mb-1">
              Role
            </Label>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.admin}>Admin</SelectItem>
                    <SelectItem value={Role.agent}>Agent</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && <ErrorMessage message={errors.role.message} />}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserFormDialog;
