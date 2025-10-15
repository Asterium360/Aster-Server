// @ts-nocheck
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import { postContact } from '../controllers/contact.controller.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { User } from '../models/User.js';
import nodemailer from 'nodemailer';

const makeRes = () => {
  const res: any = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};
const makeReq = (over: any = {}) =>
  ({
    body: {},
    ip: '::ffff:127.0.0.1',
    ...over,
  } as any);

const saveEnv = { ...process.env };

beforeEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();           // ← importante: limpia spies entre tests
  process.env = { ...saveEnv };     // reset env por test
  jest.spyOn(console, 'error').mockImplementation(() => {}); // silencia logs de error
});

describe('contact.controller.postContact (unit)', () => {
  it('422 si Zod detecta errores de validación', async () => {
    const req = makeReq({
      body: {
        name: 'A',               // min 2 → inválido
        email: 'not-an-email',   // inválido
        message: 'short',        // min 10 → inválido
        subject: '',             // aceptable, pero otros campos fallan
      },
    });
    const res = makeRes();

    await postContact(req, res);

    expect(res.status).toHaveBeenCalledWith(422);
    const payload = res.json.mock.calls[0][0];
    expect(payload.errors).toBeTruthy(); // viene de zod.flatten()
  });

  it('201 sin autenticación: usa name/email del body, subject ""→null y normaliza IP', async () => {
    jest.spyOn(ContactMessage, 'create').mockResolvedValue({ id: 123 } as any);

    const req = makeReq({
      user: undefined, // no autenticado
      ip: '::ffff:192.168.0.10',
      body: {
        name: 'Juan Perez',
        email: 'juan@example.com',
        subject: '',
        message: 'Mensaje suficientemente largo.',
      },
    });
    const res = makeRes();

    await postContact(req, res);

    expect(ContactMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Juan Perez',
        email: 'juan@example.com',
        subject: null, // "" → null
        message: 'Mensaje suficientemente largo.',
        user_id: null,
        ip: '192.168.0.10', // normalizado
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 123, status: 'ok' });
  });

  it('201 autenticado: sobre-escribe name/email con los de la BD (display_name o username)', async () => {
    jest.spyOn(User, 'findByPk').mockResolvedValue({
      id: 7,
      email: 'dbuser@example.com',
      username: 'dbuser',
      display_name: 'DB Name',
    } as any);
    jest.spyOn(ContactMessage, 'create').mockResolvedValue({ id: 456 } as any);

    const req = makeReq({
      user: { sub: '7' },
      ip: '127.0.0.1',
      body: {
        name: 'Intento Ignorado',
        email: 'otro@example.com',
        subject: 'Hola',
        message: 'Mensaje desde usuario autenticado.',
      },
    });
    const res = makeRes();

    await postContact(req, res);

    expect(User.findByPk).toHaveBeenCalledWith(7);
    expect(ContactMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'DB Name',                 // display_name
        email: 'dbuser@example.com',     // email de BD
        user_id: 7,
        ip: '127.0.0.1',
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 456, status: 'ok' });
  });

  it('201 autenticado: si no hay display_name usa username', async () => {
    jest.spyOn(User, 'findByPk').mockResolvedValue({
      id: 8,
      email: 'onlyusername@example.com',
      username: 'soloUser',
      display_name: null,
    } as any);
    jest.spyOn(ContactMessage, 'create').mockResolvedValue({ id: 789 } as any);

    const req = makeReq({
      user: { sub: '8' },
      body: {
        name: 'Ignorado',
        email: 'ignorado@x.com',
        subject: 'Asunto',
        message: 'Mensaje con username fallback.',
      },
    });
    const res = makeRes();

    await postContact(req, res);

    expect(ContactMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'soloUser',
        email: 'onlyusername@example.com',
        user_id: 8,
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('201 y envía email si hay SMTP_HOST & SUPPORT_EMAIL; usa subject por defecto cuando viene vacío', async () => {
    // Activa SMTP en env
    process.env.SMTP_HOST = 'smtp.test';
    process.env.SUPPORT_EMAIL = 'support@test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = '';
    process.env.SMTP_PASS = '';

    const sendMail = jest.fn().mockResolvedValue({ messageId: 'x' });
    jest.spyOn(nodemailer, 'createTransport').mockReturnValue({ sendMail } as any);
    jest.spyOn(ContactMessage, 'create').mockResolvedValue({ id: 999 } as any);

    const req = makeReq({
      body: {
        name: 'Ana',
        email: 'ana@example.com',
        subject: '', // forzar subject por defecto
        message: 'Mensaje de prueba con SMTP.',
      },
    });
    const res = makeRes();

    await postContact(req, res);

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.test',
        port: 587,
        secure: false,
        auth: undefined, // sin user/pass
      }),
    );
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'support@test.com',
        replyTo: `"Ana" <ana@example.com>`,
        subject: expect.stringContaining('Nuevo mensaje de contacto (#999)'),
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('sigue devolviendo 201 aunque sendMail lance error (se loguea error)', async () => {
    process.env.SMTP_HOST = 'smtp.test';
    process.env.SUPPORT_EMAIL = 'support@test.com';

    const sendMail = jest.fn().mockRejectedValue(new Error('smtp down'));
    jest.spyOn(nodemailer, 'createTransport').mockReturnValue({ sendMail } as any);
    jest.spyOn(ContactMessage, 'create').mockResolvedValue({ id: 22 } as any);

    const req = makeReq({
      body: {
        name: 'Bob',
        email: 'bob@example.com',
        subject: 'Hola',
        message: 'Mensaje con fallo SMTP.',
      },
    });
    const res = makeRes();

    await postContact(req, res);

    expect(nodemailer.createTransport).toHaveBeenCalled();
    expect(sendMail).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled(); // se registró el error
    expect(res.status).toHaveBeenCalledWith(201); // aún así 201
  });

  it('500 si ContactMessage.create rechaza', async () => {
    jest.spyOn(ContactMessage, 'create').mockRejectedValue(new Error('db insert fail'));

    const req = makeReq({
      body: {
        name: 'Carl',
        email: 'carl@example.com',
        subject: 'Hi',
        message: 'Mensaje largo para disparar insert.',
      },
    });
    const res = makeRes();

    await postContact(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
  });
});

afterEach(() => {
  process.env = { ...saveEnv };
});
