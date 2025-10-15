// @ts-nocheck
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  listPublished,
  getDiscovery,
  createDiscovery,
  updateDiscovery,
  deleteDiscovery,
} from '../controllers/asterium.controller.js';
import { Asterium } from '../models/Asterium.js';

// helpers req/res
const makeRes = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.end = jest.fn(() => res);
  return res;
};
const makeReq = (over: any = {}) => ({ ...over } as any);

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

describe('AsteriumController (unit) - listPublished', () => {
  it('200 default limit=20', async () => {
    jest.spyOn(Asterium, 'findAll').mockResolvedValue([{ id: 1 }] as any);
    const req = makeReq({ query: {} });
    const res = makeRes();

    await listPublished(req, res);

    expect(Asterium.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20, where: { status: 'published' } })
    );
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('500 con mensaje', async () => {
    jest.spyOn(Asterium, 'findAll').mockRejectedValue(new Error('boom'));
    const res = makeRes();
    await listPublished(makeReq({ query: {} }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'boom' });
  });

  it('500 fallback sin message', async () => {
    jest.spyOn(Asterium, 'findAll').mockRejectedValue({});
    const res = makeRes();
    await listPublished(makeReq({ query: {} }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
  });
});

describe('AsteriumController (unit) - getDiscovery', () => {
  it('200 si existe', async () => {
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue({ id: 7 } as any);
    const res = makeRes();
    await getDiscovery(makeReq({ params: { id: '7' } }), res);
    expect(res.json).toHaveBeenCalledWith({ id: 7 });
  });

  it('404 si no existe', async () => {
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(null as any);
    const res = makeRes();
    await getDiscovery(makeReq({ params: { id: '9' } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('500 con mensaje', async () => {
    jest.spyOn(Asterium, 'findByPk').mockRejectedValue(new Error('boom-get'));
    const res = makeRes();
    await getDiscovery(makeReq({ params: { id: '1' } }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'boom-get' });
  });

  it('500 fallback sin message', async () => {
    jest.spyOn(Asterium, 'findByPk').mockRejectedValue({});
    const res = makeRes();
    await getDiscovery(makeReq({ params: { id: '1' } }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
  });
});

describe('AsteriumController (unit) - createDiscovery', () => {
  it('401 sin usuario', async () => {
    const res = makeRes();
    await createDiscovery(makeReq({ user: undefined, body: { title: 't' } }), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('201 usa file.path si existe', async () => {
    jest.spyOn(Asterium, 'create').mockResolvedValue({ id: 1 } as any);
    const res = makeRes();
    await createDiscovery(
      makeReq({ user: { sub: '5' }, file: { path: '/uploads/img.png' }, body: { title: 't', status: 'draft' } }),
      res
    );
    const call = (Asterium.create as jest.Mock).mock.calls[0][0];
    expect(call.image_url).toBe('/uploads/img.png');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('201 published marca published_at', async () => {
    jest.spyOn(Asterium, 'create').mockResolvedValue({ id: 2 } as any);
    const res = makeRes();
    await createDiscovery(
      makeReq({ user: { sub: '8' }, body: { title: 't', status: 'published' } }),
      res
    );
    const call = (Asterium.create as jest.Mock).mock.calls[0][0];
    expect(call.published_at).toBeInstanceOf(Date);
  });

  it('500 con mensaje', async () => {
    jest.spyOn(Asterium, 'create').mockRejectedValue(new Error('db down'));
    const res = makeRes();
    await createDiscovery(makeReq({ user: { sub: '1' }, body: { title: 't' } }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'db down' });
  });

  it('500 fallback sin message', async () => {
    jest.spyOn(Asterium, 'create').mockRejectedValue({});
    const res = makeRes();
    await createDiscovery(makeReq({ user: { sub: '1' }, body: { title: 't' } }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
  });
});

describe('AsteriumController (unit) - updateDiscovery', () => {
  const makeRow = (over: any = {}) => ({
    id: 1, author_id: 5, title: 'old', excerpt: 'old', content_md: 'old', status: 'draft',
    image_url: null, published_at: null, save: jest.fn().mockResolvedValue(undefined), ...over,
  });

  it('404 si no existe', async () => {
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(null as any);
    const res = makeRes();
    await updateDiscovery(makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' }, body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('403 si no autor ni admin', async () => {
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(makeRow({ author_id: 77 }) as any);
    const res = makeRes();
    await updateDiscovery(makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' }, body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('200 actualiza y publica (set published_at)', async () => {
    const row = makeRow();
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(row as any);
    const res = makeRes();
    await updateDiscovery(
      makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' }, body: { status: 'published', title: 'new' } }),
      res
    );
    expect(row.title).toBe('new');
    expect(row.published_at).toBeInstanceOf(Date);
    expect(res.json).toHaveBeenCalledWith(row);
  });

  it('200 admin puede actualizar', async () => {
    const row = makeRow({ author_id: 77 });
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(row as any);
    const res = makeRes();
    await updateDiscovery(makeReq({ params: { id: '1' }, user: { sub: '9', role: 'admin' }, body: { excerpt: 'admin' } }), res);
    expect(row.excerpt).toBe('admin');
  });

  it('200 limpia image_url con string vacío', async () => {
    const row = makeRow({ image_url: 'x' });
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(row as any);
    const res = makeRes();
    await updateDiscovery(makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' }, body: { image_url: '' } }), res);
    expect(row.image_url).toBeNull();
  });

  it('no reescribe published_at si ya existe', async () => {
    const existing = new Date('2024-01-01T00:00:00Z');
    const row = makeRow({ status: 'published', published_at: existing });
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(row as any);
    const res = makeRes();
    await updateDiscovery(makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' }, body: { status: 'published' } }), res);
    expect(row.published_at).toBe(existing);
  });

  it('500 con mensaje', async () => {
    jest.spyOn(Asterium, 'findByPk').mockRejectedValue(new Error('boom-update'));
    const res = makeRes();
    await updateDiscovery(makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' }, body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'boom-update' });
  });

  it('500 fallback sin message', async () => {
    jest.spyOn(Asterium, 'findByPk').mockRejectedValue({});
    const res = makeRes();
    await updateDiscovery(makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' }, body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
  });
});

describe('AsteriumController (unit) - deleteDiscovery', () => {
  const makeRow = (over: any = {}) => ({ id: 1, author_id: 5, destroy: jest.fn().mockResolvedValue(undefined), ...over });

  it('404 si no existe', async () => {
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(null as any);
    const res = makeRes();
    await deleteDiscovery(makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('403 si no autor ni admin', async () => {
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(makeRow({ author_id: 77 }) as any);
    const res = makeRes();
    await deleteDiscovery(makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' } }), res);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('204 autor', async () => {
    const row = makeRow({ author_id: 5 });
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(row as any);
    const res = makeRes();
    await deleteDiscovery(makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' } }), res);
    expect(row.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  it('204 admin', async () => {
    const row = makeRow({ author_id: 99 });
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(row as any);
    const res = makeRes();
    await deleteDiscovery(makeReq({ params: { id: '1' }, user: { sub: '9', role: 'admin' } }), res);
    expect(row.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
  });

  it('500 con mensaje', async () => {
    jest.spyOn(Asterium, 'findByPk').mockRejectedValue(new Error('boom-del'));
    const res = makeRes();
    await deleteDiscovery(makeReq({ params: { id: '1' }, user: { sub: '9', role: 'admin' } }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'boom-del' });
  });

  it('500 fallback sin message', async () => {
    jest.spyOn(Asterium, 'findByPk').mockRejectedValue({});
    const res = makeRes();
    await deleteDiscovery(makeReq({ params: { id: '1' }, user: { sub: '9', role: 'admin' } }), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
  });
});
