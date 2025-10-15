// @ts-nocheck
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeAll, afterAll, beforeEach, jest } from '@jest/globals';

import app from '../app.js';
import { sequelize } from '../db.js';
import { User } from '../models/User.js';
import { Asterium } from '../models/Asterium.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret_super_seguro';
const now = () => Math.floor(Date.now() / 1000);
const sign = (payload: any) => jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

// Helpers debug
const printIfError = (label: string) => (res: any) => {
  if (res.status >= 400) {
    console.error(`[${label}] status=${res.status}`, 'path=', res?.req?.path, 'body=', res.body);
  }
  return res;
};
const mustStatus = async (label: string, reqPromise: Promise<any>, expected: number) => {
  const res = await reqPromise.then(printIfError(label));
  expect(res.status).toBe(expected);
  return res;
};

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = JWT_SECRET;
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
}, 30000);

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  await Asterium.destroy({ where: {} });
  await User.destroy({ where: {} });
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('Asterium endpoints (integración real con auth, validate y BD)', () => {
  it('GET /asterium requiere token; devuelve publicados y respeta ?limit=', async () => {
    const u = await User.create({ email: 'a@a.com', username: 'a', password_hash: 'x', role_id: 2 } as any);
    const token = sign({ sub: String(u.id), role: 'user', iat: now() });

    await Asterium.bulkCreate([
      { title: 'uno',  excerpt: 'e1', content_md: '# md1', status: 'published', author_id: u.id, published_at: new Date() },
      { title: 'dos',  excerpt: 'e2', content_md: '# md2', status: 'published', author_id: u.id, published_at: new Date() },
      { title: 'tres', excerpt: 'e3', content_md: '# md3', status: 'published', author_id: u.id, published_at: new Date() },
      { title: 'draft',excerpt: 'ed', content_md: '# mdd', status: 'draft',     author_id: u.id, published_at: null },
    ] as any);

    const noAuth = await request(app).get('/asterium?limit=2').then(printIfError('GET /asterium sin token'));
    expect(noAuth.status).toBe(401);
    expect(noAuth.body).toEqual({ error: 'No token' });

    const res = await mustStatus(
      'GET /asterium con token',
      request(app).get('/asterium?limit=2').set('Authorization', `Bearer ${token}`),
      200
    );
    expect(res.body).toHaveLength(2);
    expect(res.body.every((r: any) => r.status === 'published')).toBe(true);
  });

  it('GET /asterium/:id requiere token; 200/404/400 según caso', async () => {
    const u = await User.create({ email: 'b@b.com', username: 'b', password_hash: 'x', role_id: 2 } as any);
    const token = sign({ sub: String(u.id), role: 'user', iat: now() });

    const row = await Asterium.create({
      title: 'X',
      excerpt: 'X short',
      content_md: '# X',
      status: 'published',
      author_id: u.id,
      published_at: new Date(),
    } as any);

    const noAuth = await request(app).get(`/asterium/${row.id}`).then(printIfError('GET /asterium/:id sin token'));
    expect(noAuth.status).toBe(401);

    const ok = await mustStatus(
      'GET /asterium/:id 200',
      request(app).get(`/asterium/${row.id}`).set('Authorization', `Bearer ${token}`),
      200
    );
    expect(ok.body.id).toBe(row.id);

    const nope = await request(app)
      .get('/asterium/999999')
      .set('Authorization', `Bearer ${token}`)
      .then(printIfError('GET /asterium/:id 404'));
    expect(nope.status).toBe(404);
    expect(nope.body).toEqual({ error: 'Descubrimiento no encontrado' });

    const bad = await request(app)
      .get('/asterium/not-a-number')
      .set('Authorization', `Bearer ${token}`)
      .then(printIfError('GET /asterium/:id 400'));
    expect(bad.status).toBe(400);
    expect(bad.body).toHaveProperty('error');
  });

  it('POST /asterium requiere token + body válido; crea con author_id del token; marca published_at', async () => {
    const noAuth = await request(app).post('/asterium').send({
      title: 'nuevo', excerpt: 'desc', content_md: '# md', status: 'published',
    }).then(printIfError('POST /asterium sin token'));
    expect(noAuth.status).toBe(401);

    const user = await User.create({ email: 'c@c.com', username: 'c', password_hash: 'x', role_id: 2 } as any);
    const token = sign({ sub: String(user.id), role: 'user', iat: now() });

    const res = await mustStatus(
      'POST /asterium 201',
      request(app)
        .post('/asterium')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'con token', excerpt: 'resumen', content_md: '# contenido', status: 'published' }),
      201
    );

    expect(res.body.discovery.author_id).toBe(user.id);
    expect(res.body.discovery.published_at).toBeTruthy();
  });

//   it('POST /asterium soporta upload.single("image")', async () => {
//     const user = await User.create({ email: 'up@up.com', username: 'up', password_hash: 'x', role_id: 2 } as any);
//     const token = sign({ sub: String(user.id), role: 'user', iat: now() });

//     const res = await mustStatus(
//       'POST con imagen',
//       request(app)
//         .post('/asterium')
//         .set('Authorization', `Bearer ${token}`)
//         .field('title', 'con imagen')
//         .field('excerpt', 'desc img')
//         .field('content_md', '# md img')
//         .field('status', 'draft')
//         .attach('image', Buffer.from('fakeimgbytes'), 'fake.png'),
//       201
//     );

//     expect(res.body.discovery.author_id).toBe(user.id);
//     expect(typeof res.body.discovery.image_url === 'string' || res.body.discovery.image_url === null).toBe(true);
//   });

  it('PUT /asterium/:id permisos: 403 otro, 200 autor (publica), 200 admin', async () => {
    const author = await User.create({ email: 'd@d.com', username: 'd', password_hash: 'x', role_id: 2 } as any);
    const other  = await User.create({ email: 'o@o.com', username: 'o', password_hash: 'x', role_id: 2 } as any);
    const admin  = await User.create({ email: 'ad@ad.com', username: 'ad', password_hash: 'x', role_id: 1 } as any);

    const post = await Asterium.create({
      title: 'post', excerpt: 'ex', content_md: '# md', status: 'draft', author_id: author.id,
    } as any);

    const tOther  = sign({ sub: String(other.id),  role: 'user',  iat: now() });
    const tAuthor = sign({ sub: String(author.id), role: 'user',  iat: now() });
    const tAdmin  = sign({ sub: String(admin.id),  role: 'admin', iat: now() });

    const r403 = await request(app)
      .put(`/asterium/${post.id}`)
      .set('Authorization', `Bearer ${tOther}`)
      .send({ title: 'hack' })
      .then(printIfError('PUT /asterium/:id 403 otro'));
    expect(r403.status).toBe(403);

    const r200Author = await mustStatus(
      'PUT /asterium/:id 200 autor',
      request(app)
        .put(`/asterium/${post.id}`)
        .set('Authorization', `Bearer ${tAuthor}`)
        .send({ title: 'nuevo título', status: 'published' }),
      200
    );
    expect(r200Author.body.title).toBe('nuevo título');
    expect(r200Author.body.status).toBe('published');
    expect(r200Author.body.published_at).toBeTruthy();

    const r200Admin = await mustStatus(
      'PUT /asterium/:id 200 admin',
      request(app)
        .put(`/asterium/${post.id}`)
        .set('Authorization', `Bearer ${tAdmin}`)
        .send({ excerpt: 'by admin' }),
      200
    );
    expect(r200Admin.body.excerpt).toBe('by admin');
  });

  it('DELETE /asterium/:id requiere token; 403 otros; 204 autor; 204 admin', async () => {
    const author = await User.create({ email: 'e@e.com', username: 'e', password_hash: 'x', role_id: 2 } as any);
    const other  = await User.create({ email: 'oo@oo.com', username: 'oo', password_hash: 'x', role_id: 2 } as any);
    const admin  = await User.create({ email: 'aa@aa.com', username: 'aa', password_hash: 'x', role_id: 1 } as any);

    const row = await Asterium.create({
      title: 'delme', excerpt: 'ex', content_md: '# md', status: 'draft', author_id: author.id,
    } as any);

    const tOther  = sign({ sub: String(other.id),  role: 'user',  iat: now() });
    const tAuthor = sign({ sub: String(author.id), role: 'user',  iat: now() });
    const tAdmin  = sign({ sub: String(admin.id),  role: 'admin', iat: now() });

    const r403 = await request(app)
      .delete(`/asterium/${row.id}`)
      .set('Authorization', `Bearer ${tOther}`)
      .then(printIfError('DELETE /asterium/:id 403 otro'));
    expect(r403.status).toBe(403);

    await mustStatus(
      'DELETE /asterium/:id 204 autor',
      request(app).delete(`/asterium/${row.id}`).set('Authorization', `Bearer ${tAuthor}`),
      204
    );

    const row2 = await Asterium.create({
      title: 'delme2', excerpt: 'ex2', content_md: '# md2', status: 'draft', author_id: author.id,
    } as any);

    await mustStatus(
      'DELETE /asterium/:id 204 admin',
      request(app).delete(`/asterium/${row2.id}`).set('Authorization', `Bearer ${tAdmin}`),
      204
    );
  });
});
