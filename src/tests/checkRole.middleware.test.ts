// @ts-nocheck
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { checkRole } from '../middlewares/checkRole.js';

const make = (user?: any) => {
  const req: any = {};
  if (user !== undefined) req.user = user;

  const res: any = {
    status: jest.fn(function (this: any) { return this; }),
    json: jest.fn(function (this: any) { return this; }),
  };

  const next = jest.fn();
  return { req, res, next };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('middleware: checkRole', () => {
  it('401 si no autenticado (sin req.user)', () => {
    const { req, res, next } = make(undefined);

    // Sólo admin permitido
    const mw = checkRole(['admin']);
    mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'No autenticado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('403 si rol no permitido', () => {
    const { req, res, next } = make({ role: 'user' });

    const mw = checkRole(['admin']); // user no está
    mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'No tienes permisos suficientes' });
    expect(next).not.toHaveBeenCalled();
  });

  it('next() si rol permitido (admin)', () => {
    const { req, res, next } = make({ role: 'admin' });

    const mw = checkRole(['admin']);
    mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('next() si rol permitido cuando hay múltiples roles', () => {
    const { req, res, next } = make({ role: 'user' });

    const mw = checkRole(['admin', 'user']);
    mw(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  it('500 si ocurre un error inesperado dentro del middleware', () => {
    // Forzamos que acceder a req.user lance una excepción
    const req: any = {};
    Object.defineProperty(req, 'user', {
      get() {
        throw new Error('boom');
      },
    });

    const res: any = {
      status: jest.fn(function (this: any) { return this; }),
      json: jest.fn(function (this: any) { return this; }),
    };
    const next = jest.fn();

    const mw = checkRole(['admin']);
    mw(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'boom' });
    expect(next).not.toHaveBeenCalled();
  });
});
