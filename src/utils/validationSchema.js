import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 character"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must have 6 character."),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must have 6 character."),
});
