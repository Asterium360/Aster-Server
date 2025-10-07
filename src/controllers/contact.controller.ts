import type { Request, Response } from 'express';
import { z } from 'zod';
import { ContactMessage } from '../models/ContactMessage.js';
import nodemailer from 'nodemailer';

const ContactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(191),
  subject: z.string().max(200).optional().or(z.literal('')),
  message: z.string().min(10),
  source: z.string().max(50).optional(),
});

type ContactBody = z.infer<typeof ContactSchema>;

export async function postContact(
  req: Request<unknown, unknown, ContactBody>,
  res: Response
) {
  const parsed = ContactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(422).json({ errors: parsed.error.flatten() });
  }

  const { name, email, subject, message, source } = parsed.data;
  const userId = Number.parseInt((req as any).user?.sub ?? '', 10);
  const row = await ContactMessage.create({
    name,
    email,
    subject: subject || null,
    message,
    user_id: Number.isNaN(userId) ? null : userId,
    ip: req.ip,
    user_agent: req.get('user-agent') || null,
    source: source || 'contact_form',
  });

  //  notificación por correo
  if (process.env.SMTP_HOST && process.env.SUPPORT_EMAIL) {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });

    await transport.sendMail({
      from: `"${name}" <no-reply@tuapp.com>`,
      to: process.env.SUPPORT_EMAIL,
      subject: subject || `Nuevo contacto (#${row.id})`,
      text: `De: ${name} <${email}>\n\n${message}\n\nID: ${row.id}`,
    });
  }

  return res.status(201).json({ id: row.id, status: 'ok' });
}
