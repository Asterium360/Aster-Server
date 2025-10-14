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

// Helpers de req/res
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
  jest.restoreAllMocks(); // MUY IMPORTANTE para limpiar spies entre tests
});

describe('AsteriumController - listPublished', () => {
  it('200 con limit por defecto (20) si no se pasa query', async () => {
    jest.spyOn(Asterium, 'findAll').mockResolvedValue([{ id: 1 }] as any);
    const req = makeReq({ query: {} });
    const res = makeRes();

    await listPublished(req, res);

    expect(Asterium.findAll).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'published' },
        order: [['published_at', 'DESC']],
        limit: 20,
      }),
    );
    expect(res.json).toHaveBeenCalledWith([{ id: 1 }]);
  });

  it('usa limit válido dentro de [1,50]', async () => {
    jest.spyOn(Asterium, 'findAll').mockResolvedValue([] as any);
    const req = makeReq({ query: { limit: '5' } });
    const res = makeRes();

    await listPublished(req, res);

    expect(Asterium.findAll).toHaveBeenCalledWith(expect.objectContaining({ limit: 5 }));
    expect(res.json).toHaveBeenCalledWith([]);
  });

  it('clampa limit a mínimo 1', async () => {
    jest.spyOn(Asterium, 'findAll').mockResolvedValue([] as any);
    const req = makeReq({ query: { limit: '0' } });
    const res = makeRes();

    await listPublished(req, res);

    expect(Asterium.findAll).toHaveBeenCalledWith(expect.objectContaining({ limit: 1 }));
  });

  it('clampa limit a máximo 50', async () => {
    jest.spyOn(Asterium, 'findAll').mockResolvedValue([] as any);
    const req = makeReq({ query: { limit: '999' } });
    const res = makeRes();

    await listPublished(req, res);

    expect(Asterium.findAll).toHaveBeenCalledWith(expect.objectContaining({ limit: 50 }));
  });

  it('ignora limit inválido (NaN) y usa 20', async () => {
    jest.spyOn(Asterium, 'findAll').mockResolvedValue([] as any);
    const req = makeReq({ query: { limit: 'nan' } });
    const res = makeRes();

    await listPublished(req, res);

    expect(Asterium.findAll).toHaveBeenCalledWith(expect.objectContaining({ limit: 20 }));
  });

  it('500 si findAll rechaza', async () => {
    jest.spyOn(Asterium, 'findAll').mockRejectedValue(new Error('boom'));
    const req = makeReq({ query: {} });
    const res = makeRes();

    await listPublished(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'boom' });
  });
});

describe('AsteriumController - getDiscovery', () => {
  it('200 si existe', async () => {
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue({ id: 10 } as any);
    const req = makeReq({ params: { id: '10' } });
    const res = makeRes();

    await getDiscovery(req, res);

    expect(Asterium.findByPk).toHaveBeenCalledWith(10, expect.any(Object));
    expect(res.json).toHaveBeenCalledWith({ id: 10 });
  });

  it('404 si no existe', async () => {
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(null as any);
    const req = makeReq({ params: { id: '999' } });
    const res = makeRes();

    await getDiscovery(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Descubrimiento no encontrado' });
  });
});

describe('AsteriumController - createDiscovery', () => {
  it('401 si no autenticado', async () => {
    const req = makeReq({ body: { title: 'x' }, user: undefined });
    const res = makeRes();

    await createDiscovery(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Usuario no autenticado' });
  });

  it('201 crea sin file y setea published_at si status=published', async () => {
    jest.spyOn(Asterium, 'create').mockResolvedValue({ id: 1, title: 't' } as any);

    const req = makeReq({
      user: { sub: '7', role: 'user' },
      body: { title: 't', status: 'published' },
      file: undefined,
    });
    const res = makeRes();

    await createDiscovery(req, res);

    const call = (Asterium.create as jest.Mock).mock.calls[0][0];
    expect(call.author_id).toBe(7);
    expect(call.image_url).toBeNull();
    expect(call.published_at).toBeInstanceOf(Date);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Descubrimiento creado correctamente 🚀',
      discovery: { id: 1, title: 't' },
    });
  });

  it('201 crea con file usa file.path', async () => {
    jest.spyOn(Asterium, 'create').mockResolvedValue({ id: 2 } as any);

    const req = makeReq({
      user: { sub: '8' },
      body: { title: 't', status: 'draft' },
      file: { path: '/uploads/img.png' },
    });
    const res = makeRes();

    await createDiscovery(req, res);

    const call = (Asterium.create as jest.Mock).mock.calls[0][0];
    expect(call.image_url).toBe('/uploads/img.png');
    expect(call.published_at).toBeNull();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('500 si create rechaza', async () => {
    jest.spyOn(Asterium, 'create').mockRejectedValue(new Error('db down'));

    const req = makeReq({
      user: { sub: '9' },
      body: { title: 't' },
    });
    const res = makeRes();

    await createDiscovery(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'db down' });
  });
});

describe('AsteriumController - updateDiscovery', () => {
  const makeRow = (over: any = {}) => {
    const base = {
      id: 1,
      author_id: 5,
      title: 'old',
      excerpt: 'old',
      content_md: 'old',
      status: 'draft',
      image_url: null,
      published_at: null,
      save: jest.fn().mockResolvedValue(undefined),
    };
    return { ...base, ...over };
  };

  it('404 si no existe', async () => {
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(null as any);
    const req = makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' }, body: {} });
    const res = makeRes();

    await updateDiscovery(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'No encontrado' });
  });

  it('403 si no es autor ni admin', async () => {
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(makeRow({ author_id: 77 }) as any);
    const req = makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' }, body: {} });
    const res = makeRes();

    await updateDiscovery(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Sin permisos' });
  });

  it('200 actualiza campos y marca published_at al publicar', async () => {
    const row = makeRow({ author_id: 5 });
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(row as any);

    const req = makeReq({
      params: { id: '1' },
      user: { sub: '5', role: 'user' },
      body: {
        title: 'new title',
        excerpt: 'new excerpt',
        content_md: '## md',
        status: 'published',
        image_url: 'https://x/y.png',
      },
    });
    const res = makeRes();

    await updateDiscovery(req, res);

    expect(row.title).toBe('new title');
    expect(row.excerpt).toBe('new excerpt');
    expect(row.content_md).toBe('## md');
    expect(row.status).toBe('published');
    expect(row.image_url).toBe('https://x/y.png');
    expect(row.published_at).toBeInstanceOf(Date);
    expect(row.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(row);
  });

  it('200 admin puede actualizar aunque no sea autor', async () => {
    const row = makeRow({ author_id: 77, status: 'draft' });
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(row as any);

    const req = makeReq({
      params: { id: '1' },
      user: { sub: '5', role: 'admin' },
      body: { title: 'admin change' },
    });
    const res = makeRes();

    await updateDiscovery(req, res);

    expect(row.title).toBe('admin change');
    expect(row.save).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(row);
  });

  it('200 permite limpiar image_url pasando string vacío', async () => {
    const row = makeRow({ author_id: 5, image_url: 'x' });
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(row as any);

    const req = makeReq({
      params: { id: '1' },
      user: { sub: '5', role: 'user' },
      body: { image_url: '' },
    });
    const res = makeRes();

    await updateDiscovery(req, res);

    expect(row.image_url).toBeNull();
    expect(res.json).toHaveBeenCalledWith(row);
  });
});

describe('AsteriumController - deleteDiscovery', () => {
  const makeRow = (over: any = {}) => ({
    id: 1,
    author_id: 5,
    destroy: jest.fn().mockResolvedValue(undefined),
    ...over,
  });

  it('404 si no existe', async () => {
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(null as any);
    const req = makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' } });
    const res = makeRes();

    await deleteDiscovery(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'No encontrado' });
  });

  it('403 si no es autor ni admin', async () => {
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(makeRow({ author_id: 77 }) as any);
    const req = makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' } });
    const res = makeRes();

    await deleteDiscovery(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Sin permisos' });
  });

  it('204 si borra como autor', async () => {
    const row = makeRow({ author_id: 5 });
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(row as any);

    const req = makeReq({ params: { id: '1' }, user: { sub: '5', role: 'user' } });
    const res = makeRes();

    await deleteDiscovery(req, res);

    expect(row.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.end).toHaveBeenCalled();
  });

  it('204 si borra como admin aunque no sea autor', async () => {
    const row = makeRow({ author_id: 99 });
    jest.spyOn(Asterium, 'findByPk').mockResolvedValue(row as any);

    const req = makeReq({ params: { id: '1' }, user: { sub: '5', role: 'admin' } });
    const res = makeRes();

    await deleteDiscovery(req, res);

    expect(row.destroy).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(204);
  });
});
