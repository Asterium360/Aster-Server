import { z } from 'zod';
export const createPostSchema = z.object({ body: z.object({
  title: z.string().min(3), slug: z.string().min(3), content_md: z.string().min(10),
  status: z.enum(['draft','published','archived']).optional()
})});
