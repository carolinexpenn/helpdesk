import { z } from "zod/v4";
import { Role } from "../constants/role.ts";

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email("Enter a valid email"),
  role: z.enum([Role.admin, Role.agent]),
});

export const updateUserSchema = createUserSchema;

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
