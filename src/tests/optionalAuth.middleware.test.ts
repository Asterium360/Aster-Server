// @ts-nocheck
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import { optionalAuth } from '../middlewares/optionalAuth.js';

const makeReq = (headers: any = {}) => ({ headers } as any);
const makeRes = () => ({} as any);
const makeNext = () => jest.fn();

const SAVED_ENV = { ...process.env };
const JWT_SECRET = 'secret_para_tests';

const sign = (payload: any, secret = JWT_SECRET) =>
  jwt.sign(payload, secret, { expiresIn: '1h' });

describe('optionalAuth middleware', () => {
  beforeEach(() => {
    process.env = { ...SAVED_ENV, JWT_SECRET };
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    process.env = { ...SAVED_ENV };
  });

  it('sigue anónimo si no hay Authorization', () => {
    const req = makeReq(); // sin headers.authorization
    const res = makeRes();
    const next = makeNext();

    optionalAuth(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('sigue anónimo si Authorization no empieza por "Bearer "', () => {
    const req = makeReq({ authorization: 'Basic abcdef' });
    const res = makeRes();
    const next = makeNext();

    optionalAuth(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('sigue anónimo si el token es inválido (verify lanza)', () => {
    const req = makeReq({ authorization: 'Bearer esto-no-es-un-jwt' });
    const res = makeRes();
    const next = makeNext();

    optionalAuth(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('setea req.user si el token es válido (role: user)', () => {
    const payload = { sub: '42', role: 'user', iat: Math.floor(Date.now() / 1000) };
    const token = sign(payload);
    const req = makeReq({ authorization: `Bearer ${token}` });
    const res = makeRes();
    const next = makeNext();

    optionalAuth(req, res, next);

    expect(req.user).toMatchObject({ sub: '42', role: 'user' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('setea req.user si el token es válido (role: admin)', () => {
    const payload = { sub: '1', role: 'admin', iat: Math.floor(Date.now() / 1000) };
    const token = sign(payload);
    const req = makeReq({ authorization: `Bearer ${token}` });
    const res = makeRes();
    const next = makeNext();

    optionalAuth(req, res, next);

    expect(req.user).toMatchObject({ sub: '1', role: 'admin' });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('no setea req.user si jwt.verify devuelve un string', () => {
    // Espiamos verify para forzar retorno string
    jest.spyOn(jwt, 'verify').mockReturnValue('SOY_UN_STRING' as any);

    const req = makeReq({ authorization: 'Bearer cualquiercosa' });
    const res = makeRes();
    const next = makeNext();

    optionalAuth(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('no setea req.user si el role no es "admin" ni "user"', () => {
    const token = sign({ sub: '7', role: 'superuser', iat: Math.floor(Date.now() / 1000) } as any);
    const req = makeReq({ authorization: `Bearer ${token}` });
    const res = makeRes();
    const next = makeNext();

    optionalAuth(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('sigue anónimo si falta JWT_SECRET (verify lanza y se captura)', () => {
    delete process.env.JWT_SECRET;
    const token = sign({ sub: '9', role: 'user', iat: Math.floor(Date.now() / 1000) }, 'otro'); // firmado con otra clave
    const req = makeReq({ authorization: `Bearer ${token}` });
    const res = makeRes();
    const next = makeNext();

    optionalAuth(req, res, next);

    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
