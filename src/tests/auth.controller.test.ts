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

describe('auth.controller', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'pon_un_secreto_fuerte';
    await sequelize.authenticate();
    await sequelize.sync({ });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    await User.destroy({ where: {} });
  });

  // -------- REGISTER --------
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
  });

  // -------- LOGIN --------
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
  });

  // -------- PROMOTE TO ADMIN --------
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
