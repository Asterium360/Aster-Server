import { z } from "zod";

// Para crear un descubrimiento
export const createDiscoverySchema = z.object({
  title: z
    .string()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(200, "El título no puede tener más de 200 caracteres"),
  excerpt: z.string().optional(), // porque en el model es TEXT nullable
  content_md: z
    .string()
    .min(10, "El contenido debe tener al menos 10 caracteres"),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  //campo de nuestra imagen
  image_url:z
  .string()
  .url("Debe ser una URL válida")
  .optional()
  .or(z.literal(""))
  .or(z.undefined()),
});

// Para actualizar un descubrimiento → todo opcional
export const updateDiscoverySchema = z.object({
  title: z.string().min(3).max(200).optional(),
  excerpt: z.string().optional(),
  content_md: z.string().min(10).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),

  // 🖼️ Nuevo campo: URL de imagen (opcional)
  image_url: z
  .string()
  .refine(
    (val) =>
      !val ||
      val === "" ||
      /^https?:\/\/.+\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(val), // ✅ permite query params
    "Debe ser una URL válida si se proporciona"
  )
  .optional()
  .or(z.literal(""))
  .or(z.undefined()),
});
// Validación de params
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive("El id debe ser un número positivo"),
});
