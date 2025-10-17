import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload as JwtPayloadLib } from 'jsonwebtoken';

// Tipo fuerte de tu token
export type AuthTokenPayload = JwtPayloadLib & {
  sub: string;              // ID del usuario en string
  role: 'admin' | 'user';   // Rol explícito
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    // ✅ guarda para descartar string y validar campos mínimos
    if (
      typeof decoded === 'string' ||
      !decoded ||
      typeof (decoded as any).sub !== 'string' ||
      (decoded as any).sub.length === 0 ||
      ((decoded as any).role !== 'admin' && (decoded as any).role !== 'user')
    ) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    // ✅ ya es seguro castear a tu tipo
    req.user = decoded as AuthTokenPayload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: 'No auth' });
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Sin permisos' });
  }
  next();
}
