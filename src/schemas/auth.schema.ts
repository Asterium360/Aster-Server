import { z } from 'zod';

export const registerSchema = z.object({ 
  body: z.object({
  email: z.string().email("El email no es válido"), 
  username: z.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").max(50,"Máximo 50 caracteres"), 
  password: z.string().min(8,"La contraseña debe tener al menos 8 caracteres"),
}),
});

export const loginSchema = z.object({ 
  body: z.object({
  email: z.string().email("El email no es válido"), 
  password: z.string().min(8,"La contraseña debe tener al menos 8 caracteres"),
}),
});


