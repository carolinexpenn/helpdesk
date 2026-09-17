import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { createUserSchema, updateUserSchema, type CreateUserInput } from "core/schemas/users";
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
import ErrorAlert from "@/components/ErrorAlert";
import ErrorMessage from "@/components/ErrorMessage";

export interface EditableUser {
  id: string;
  name: string;
  email: string;
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
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(
      isEditing ? updateUserSchema : createUserSchema,
    ) as unknown as Resolver<CreateUserInput>,
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ name: user?.name ?? "", email: user?.email ?? "", password: "" });
    }
  }, [open, user, reset]);

  const mutation = useMutation({
    mutationFn: (data: CreateUserInput): Promise<AxiosResponse> => {
      if (isEditing) {
        const { password, ...rest } = data;
        return api.put(`/users/${user.id}`, password ? { ...rest, password } : rest);
      }
      return api.post("/users", data);
    },
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
            <Input
              id="email"
              type="email"
              autoComplete="off"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            {errors.email && <ErrorMessage message={errors.email.message} />}
          </div>
          <div className="mt-3">
            <Label htmlFor="password" className="mb-1">
              {isEditing ? "New password" : "Password"}
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder={isEditing ? "Leave blank to keep the current password" : undefined}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && <ErrorMessage message={errors.password.message} />}
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
