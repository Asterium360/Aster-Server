// src/middlewares/checkRole.ts
import type { Request, Response, NextFunction } from 'express';

export function checkRole(rolesAllowed: ('admin' | 'user')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user; // ← viene del requireAuth
      if (!user) {
        return res.status(401).json({ error: 'No autenticado' });
      }

      const hasPermission = rolesAllowed.includes(user.role);

      if (!hasPermission) {
        return res.status(403).json({ error: 'No tienes permisos suficientes' });
      }

      next();
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error interno' });
    }
  };
}
