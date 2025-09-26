import { z } from 'zod';
export const registerSchema = z.object({ body: z.object({
  email: z.string().email(), username: z.string().min(3).max(50), password: z.string().min(8)
})});
export const loginSchema = z.object({ body: z.object({
  email: z.string().email(), password: z.string().min(8)
})});
