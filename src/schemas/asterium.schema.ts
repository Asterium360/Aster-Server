import { z } from 'zod';


export const createPostSchema = z.object({ 
  body: z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"), 
  slug: z.string().min(3, "El slug debe tener al menos 3 caracteres"), 
  content_md: z.string().min(10, "El contenido debe tener mínimo 10 caracteres"),
  status: z.enum(['draft','published','archived']).optional(),
}),
});
