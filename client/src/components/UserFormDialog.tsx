import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { Eye, EyeOff } from "lucide-react";
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
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

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
      setChangingPassword(false);
      setPasswordVisible(false);
    }
  }, [open, user, reset]);

  const showPasswordInput = !isEditing || changingPassword;

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
            <ErrorMessage message={errors.name?.message} />
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
            <ErrorMessage message={errors.email?.message} />
          </div>
          <div className="mt-3">
            <Label htmlFor="password" className="mb-1">
              {isEditing && changingPassword ? "New password" : "Password"}
            </Label>
            {showPasswordInput ? (
              <div className="relative">
                <Input
                  id="password"
                  type={passwordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  className="pr-8"
                  aria-invalid={!!errors.password}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setPasswordVisible((v) => !v)}
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                >
                  {passwordVisible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            ) : (
              <Button type="button" variant="outline" size="sm" onClick={() => setChangingPassword(true)}>
                Change password
              </Button>
            )}
            <ErrorMessage message={errors.password?.message} />
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
