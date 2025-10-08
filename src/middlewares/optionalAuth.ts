import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload as JwtPayloadLib } from 'jsonwebtoken';

type AuthTokenPayload = JwtPayloadLib & { sub: string; role: 'admin' | 'user' };

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return next();

  const token = header.slice(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthTokenPayload | string;
    if (typeof decoded !== 'string' && decoded?.sub && (decoded.role === 'admin' || decoded.role === 'user')) {
      req.user = decoded;
    }
  } catch {
    // token inválido -> seguir anónimo
  }
  next();
}

