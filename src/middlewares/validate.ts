import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";

/**
 * Middleware genérico para validar con Zod.
 * Valida body (por defecto), params o query.
 */
export function validate(
  schema: ZodTypeAny,
  source: "body" | "params" | "query" = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      // Aquí result.error ya es un ZodError, accedemos directo
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join("."), // ej: "email" o "password"
          message: issue.message,
        })),
      });
    }

    // Guardamos datos validados en req[source]
    (req as any)[source] = result.data;
    next();
  };
}
