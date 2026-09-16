import { z } from "zod/v4";

export const createUserSchema = z.object({
  name: z.string().trim().min(4, "Name must be more than 3 characters"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const updateUserSchema = createUserSchema.omit({ password: true });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
