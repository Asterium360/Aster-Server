// @ts-nocheck
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { sequelize } from '../db.js';
import { User } from '../models/User.js';

import { register, login, promoteToAdmin } from '../controllers/auth.controller.js';

const makeRes = () => {
  const res = {} as any;
  res.status = jest.fn((code: number) => res);
  res.json   = jest.fn((body?: any) => res);
  return res;
};
const makeReq = (body: any = {}, params: any = {}) => ({ body, params } as any);

// Utilidad para setear temporalmente JWT_SECRET
const withTempJwt = (value: string | undefined, run: () => Promise<void> | void) => {
  const prev = process.env.JWT_SECRET;
  if (value === undefined) delete (process.env as any).JWT_SECRET;
  else process.env.JWT_SECRET = value;
  return Promise.resolve(run()).finally(() => {
    if (prev === undefined) delete (process.env as any).JWT_SECRET;
    else process.env.JWT_SECRET = prev;
  });
};

describe('auth.controller', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'pon_un_secreto_fuerte';
    await sequelize.authenticate();
    await sequelize.sync({});
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    await User.destroy({ where: {} });
  });

  // ================== REGISTER ==================
  describe('register', () => {
    it('201 crea usuario y devuelve token', async () => {
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-ok' as any);
      jest.spyOn(jwt, 'sign').mockReturnValue('token-123' as any);

      const req = makeReq({
        email: 'new@example.com',
        username: 'newuser',
        password: 'secret',
        display_name: 'New',
      });
      const res = makeRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      const body = res.json.mock.calls[0][0];
      expect(body.token).toBe('token-123');
      expect(body.user.email).toBe('new@example.com');

      const created = await User.findOne({ where: { email: 'new@example.com' } });
      expect(created).toBeTruthy();
      expect(bcrypt.hash).toHaveBeenCalledWith('secret', 10);
      expect(jwt.sign).toHaveBeenCalled();
    });

    it('409 si el email ya existe', async () => {
      await User.create({
        email: 'dup@example.com',
        username: 'dup',
        password_hash: 'hash',
        role_id: 2,
      } as any);

      const req = makeReq({
        email: 'dup@example.com',
        username: 'dup2',
        password: 'x',
      });
      const res = makeRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email en uso' });
    });

    it('409 si el username ya existe', async () => {
      await User.create({
        email: 'user2@example.com',
        username: 'repeated',
        password_hash: 'hash',
        role_id: 2,
      } as any);

      const req = makeReq({
        email: 'other@example.com',
        username: 'repeated',
        password: 'x',
      });
      const res = makeRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Username en uso' });
    });

    it('400 si faltan campos', async () => {
      const req = makeReq({ email: '', username: '', password: '' });
      const res = makeRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Faltan campos: email, username y password' });
    });

    it('500 si falta JWT_SECRET', async () =>
      withTempJwt(undefined, async () => {
        jest.spyOn(User, 'findOne').mockResolvedValueOnce(null as any).mockResolvedValueOnce(null as any);
        jest.spyOn(bcrypt, 'hash').mockResolvedValue('hash' as any);

        const req = makeReq({ email: 'secretless@example.com', username: 'secretless', password: 'x' });
        const res = makeRes();

        await register(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Falta JWT_SECRET' });
      }));

    it('409 si SequelizeUniqueConstraintError en create()', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(null as any).mockResolvedValueOnce(null as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hash' as any);
      jest.spyOn(User, 'create').mockRejectedValue({ name: 'SequelizeUniqueConstraintError' });

      const req = makeReq({ email: 'x@x.com', username: 'x', password: 'x' });
      const res = makeRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email o username ya en uso' });
    });

    it('400 si SequelizeValidationError en create()', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(null as any).mockResolvedValueOnce(null as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hash' as any);
      jest
        .spyOn(User, 'create')
        .mockRejectedValue({ name: 'SequelizeValidationError', errors: [{ message: 'bad' }] });

      const req = makeReq({ email: 'bad@x.com', username: 'bad', password: 'x' });
      const res = makeRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: ['bad'] });
    });

    it('500 si ocurre un error no controlado en register', async () => {
      jest.spyOn(User, 'findOne').mockResolvedValueOnce(null as any).mockResolvedValueOnce(null as any);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hash' as any);
      jest.spyOn(User, 'create').mockRejectedValue(new Error('boom'));

      const req = makeReq({ email: 'z@z.com', username: 'z', password: 'pw' });
      const res = makeRes();

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
    });
  });

  // ================== LOGIN ==================
  describe('login', () => {
    beforeEach(async () => {
      await User.create({
        email: 'u@example.com',
        username: 'u',
        password_hash: 'hash-u',
        role_id: 2, // user
      } as any);

      await User.create({
        email: 'a@example.com',
        username: 'a',
        password_hash: 'hash-a',
        role_id: 1, // admin
      } as any);
    });

    it('200 user: credenciales correctas', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);
      jest.spyOn(jwt, 'sign').mockReturnValue('token-user' as any);

      const req = makeReq({ email: 'u@example.com', password: 'ok' });
      const res = makeRes();

      await login(req, res);

      const body = res.json.mock.calls[0][0];
      expect(body.user.role).toBe('user');
      expect(body.token).toBe('token-user');
    });

    it('200 admin: credenciales correctas', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);
      jest.spyOn(jwt, 'sign').mockReturnValue('token-admin' as any);

      const req = makeReq({ email: 'a@example.com', password: 'ok' });
      const res = makeRes();

      await login(req, res);

      const body = res.json.mock.calls[0][0];
      expect(body.user.role).toBe('admin');
      expect(body.token).toBe('token-admin');
    });

    it('401 si email no existe', async () => {
      const req = makeReq({ email: 'nope@example.com', password: 'x' });
      const res = makeRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas' });
    });

    it('401 si contraseña incorrecta', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as any);

      const req = makeReq({ email: 'u@example.com', password: 'wrong' });
      const res = makeRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Credenciales inválidas' });
    });

    it('400 si faltan campos', async () => {
      const req = makeReq({}); // sin email ni password
      const res = makeRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Faltan campos: email y password' });
    });

    it('500 si falta JWT_SECRET', async () =>
      withTempJwt(undefined, async () => {
        jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as any);
        // Simula que existe el usuario
        const scopeFind = jest.fn().mockResolvedValue({ id: 1, email: 'u@example.com', username: 'u', role_id: 2, password_hash: 'h' });
        jest.spyOn(User, 'scope').mockReturnValue({ findOne: scopeFind } as any);

        const req = makeReq({ email: 'u@example.com', password: 'ok' });
        const res = makeRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Falta JWT_SECRET' });
      }));

    it('400 si SequelizeValidationError en login', async () => {
      const scopeSpy = jest
        .spyOn(User, 'scope')
        .mockReturnValue({ findOne: jest.fn().mockRejectedValue({ name: 'SequelizeValidationError', errors: [{ message: 'bad' }] }) } as any);

      const req = makeReq({ email: 'u@example.com', password: 'ok' });
      const res = makeRes();

      await login(req, res);

      expect(scopeSpy).toHaveBeenCalledWith('withPassword');
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: ['bad'] });
    });

    it('500 si ocurre un error no controlado en login', async () => {
      const findOne = jest.fn().mockRejectedValue(new Error('db down'));
      jest.spyOn(User, 'scope').mockReturnValue({ findOne } as any);

      const req = makeReq({ email: 'u@example.com', password: 'pw' });
      const res = makeRes();

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
    });
  });

  // ================== PROMOTE TO ADMIN ==================
  describe('promoteToAdmin', () => {
    it('200 y role_id = 1 si existe', async () => {
      const u = await User.create({
        email: 'p@example.com',
        username: 'p',
        password_hash: 'hash',
        role_id: 2,
      } as any);

      const req = makeReq({}, { id: String(u.id) });
      const res = makeRes();

      await promoteToAdmin(req, res);

      expect(res.json).toHaveBeenCalledWith({ message: 'Usuario promovido a admin', id: u.id });

      const updated = await User.findByPk(u.id);
      expect(updated?.role_id).toBe(1);
    });

    it('404 si no existe', async () => {
      const req = makeReq({}, { id: '999999' });
      const res = makeRes();

      await promoteToAdmin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no encontrado' });
    });
  });
});
