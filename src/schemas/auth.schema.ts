import { z } from "zod";

// Registro
export const registerSchema = z.object({
  email: z
    .string()
    .email("El email no es válido")
    .max(191, "El email no puede tener más de 191 caracteres"),
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "Máximo 50 caracteres"),
  password: z
    .string()
    .min(5, "La contraseña debe tener al menos 5 caracteres"),
  display_name: z.string().max(100).optional(),
});

// Login
export const loginSchema = z.object({
  email: z.string().email("El email no es válido"),
  password: z
    .string()
    .min(5, "La contraseña debe tener al menos 5 caracteres"),
});
