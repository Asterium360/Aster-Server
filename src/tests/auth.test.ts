

// src/tests/asterium.e2e.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../app.js';
import { sequelize } from '../db.js';
import { Asterium } from '../models/Asterium.js';
import type { AsteriumAttrs } from '../models/Asterium.js';
import { User } from '../models/User.js';

// --- CONFIG ---
const JWT_SECRET = 'test-secret';
const USER_ID = 10;
const ADMIN_ID = 99;
let AST_ID: number;

// Limpieza segura (MySQL): destroy en orden hija -> padre (sin truncate/cascade)
const cleanupDatabase = async () => {
  await Asterium.destroy({ where: {} });
  await User.destroy({ where: {} });
};

// Si quieres resetear autoincrementos, usa esta variante:
/*
const cleanupDatabase = async () => {
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  await Asterium.truncate();
  await User.truncate();
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
};
*/
const generateToken = (userId: number, role: 'user' | 'admin') => {
  const secret = process.env.JWT_SECRET || 'test-secret';
  // Incluimos varios aliases por si tu middleware usa uno u otro
  const payload = {
    sub: String(userId),
    id: userId,
    userId,
    role,
  };
  return jwt.sign(payload, secret, { expiresIn: '1h' });
};

const initialAsteriumData: AsteriumAttrs = {
  id: 100,
  author_id: USER_ID,
  title: 'Descubrimiento Inicial Publicado',
  slug: `descubrimiento-inicial-publicado-${Date.now()}`,
  content_md: 'Contenido de la fila base.',
  status: 'published',
  published_at: new Date(),
  like_count: 5,
  excerpt: null,
};

describe('Controladores de Asterium (Base de Datos Real)', () => {
  beforeAll(async () => {
  process.env.JWT_SECRET = JWT_SECRET; // o el que uses
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});


  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await cleanupDatabase();

await User.create({
  id: USER_ID,
  username: 'user_test',
  email: 'test@example.com',
  password_hash: 'test-hash', // cualquier string válido si no hay validación extra
  role: 'user',
} as any);

await User.create({
  id: ADMIN_ID,
  username: 'admin_test',
  email: 'admin@example.com',
  password_hash: 'test-hash',
  role: 'admin',
} as any);

    const row = await Asterium.create(initialAsteriumData as any);
    AST_ID = row.id!;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('GET /asterium (listPublished)', () => {
  it('Debería retornar 200 con la fila inicial publicada', async () => {
    const token = generateToken(USER_ID, 'user'); // usuario logueado

    const res = await request(app)
      .get('/asterium')                              // ruta correcta según tu router
      .set('Authorization', `Bearer ${token}`);      // <-- IMPORTANTE

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body.some((a: any) => a.id === AST_ID)).toBe(true);
    expect(res.body.find((a: any) => a.id === AST_ID)?.title)
      .toEqual('Descubrimiento Inicial Publicado');
  });
});

  // Ejemplos para cuando desbloquees más endpoints:
  /*
  describe('POST /asterium', () => {
    it('201 crea en DB', async () => {
      const token = generateToken(USER_ID, 'user');
      const payload = { title: 'Nuevo', content_md: '...', status: 'draft' };
      const before = await Asterium.count();

      const res = await request(app).post('/asterium').set('Authorization', `Bearer ${token}`).send(payload);
      expect(res.status).toBe(201);

      const after = await Asterium.count();
      expect(after).toBe(before + 1);
    });
  });
  */
});
