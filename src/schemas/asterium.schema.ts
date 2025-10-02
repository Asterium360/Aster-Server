import { z } from "zod";

// Para crear un descubrimiento
export const createDiscoverySchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título no puede tener más de 200 caracteres"),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .max(220, "El slug no puede tener más de 220 caracteres")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido: usa minúsculas y guiones"),
  excerpt: z.string().optional(), // porque en el model es TEXT nullable
  content_md: z
    .string()
    .min(10, "El contenido debe tener al menos 10 caracteres"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  // published_at, like_count, author_id → se controlan en el backend, no desde el cliente
});

// Para actualizar un descubrimiento → todo opcional
export const updateDiscoverySchema = z.object({
  title: z.string().min(3).max(200).optional(),
  slug: z
    .string()
    .min(3)
    .max(220)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  excerpt: z.string().optional(),
  content_md: z.string().min(10).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

// Validación de params
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("El id debe ser un número positivo"),
});
