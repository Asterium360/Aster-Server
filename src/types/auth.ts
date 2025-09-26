// src/types/auth.ts
import type { JwtPayload as JwtPayloadLib } from 'jsonwebtoken';

export type AuthTokenPayload = JwtPayloadLib & {
  sub: string;           // <- IMPORTANTE: string (no number)
  role: 'admin' | 'user';
};
