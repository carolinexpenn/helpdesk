import type { Response } from "express";
import type { z } from "zod/v4";

export function validate<S extends z.ZodType>(schema: S, body: unknown, res: Response): z.infer<S> | null {
  const result = schema.safeParse(body);

  if (!result.success) {
    res.status(400).json({ error: result.error.issues[0]?.message ?? "Invalid request" });
    return null;
  }

  return result.data;
}
