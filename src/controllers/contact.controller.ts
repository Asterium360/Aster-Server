import type { Request, Response } from 'express';
import { z } from 'zod';
import { ContactMessage } from '../models/ContactMessage.js';
import { User } from '../models/User.js';
import nodemailer from 'nodemailer';

const ContactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(191),
  subject: z.string().max(200).optional().or(z.literal('')),
  message: z.string().min(10),
});

type ContactBody = z.infer<typeof ContactSchema>;

export async function postContact(
  req: Request<unknown, unknown, ContactBody>,
  res: Response
) {
  try {
    // 1) Parseo inicial
    const parsed = ContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ errors: parsed.error.flatten() });
    }
    const { subject, message } = parsed.data;

    // 2) Detectar usuario autenticado
    const userId = Number.parseInt((req as any).user?.sub ?? '', 10);
    let senderName = parsed.data.name.trim();
    let senderEmail = parsed.data.email.trim();

    if (!Number.isNaN(userId)) {
      // Forzar datos desde la BD
      const u = await User.findByPk(userId);
      if (u) {
        senderEmail = u.email; // obligatorio: email real del user autenticado
        senderName = (u.display_name || u.username || '').trim() || 'Usuario Asterium';
      }
    }

    // 3) Normaliza IP
    const rawIp = req.ip || '';
    const ip = rawIp.startsWith('::ffff:') ? rawIp.slice(7) : rawIp;

    // 4) Guardar contacto con datos finales (forzados si había login)
    const row = await ContactMessage.create({
      name: senderName,
      email: senderEmail,
      subject: subject || null,
      message,
      user_id: Number.isNaN(userId) ? null : userId,
      ip: ip || null,
    });

    // 5) Enviar correo (protegido)
    if (process.env.SMTP_HOST && process.env.SUPPORT_EMAIL) {
      try {
        const transport = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT || 587),
          secure: false,
          auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
            : undefined,
        });

        const fromAddress = 'Asterium Soporte <pereiraanngy@gmail.com>'; // remitente verificado
        await transport.sendMail({
          from: fromAddress,
          to: process.env.SUPPORT_EMAIL!,
          replyTo: `"${senderName}" <${senderEmail}>`,
          subject: subject?.trim() || `Nuevo mensaje de contacto (#${row.id})`,
          text: `De: ${senderName} <${senderEmail}>\n\n${message}\n\nID: ${row.id}`,
          html: `
            <div style="font-family:system-ui,Arial,sans-serif;line-height:1.5;font-size:14px;color:#111">
              <p><strong>De:</strong> ${senderName} &lt;${senderEmail}&gt;</p>
              <p style="white-space:pre-wrap">${message.replace(/</g,'&lt;')}</p>
              <hr />
              <p style="color:#666;font-size:12px">ID: ${row.id}</p>
            </div>
          `,
          headers: { 'X-Asterium-Contact': 'true' }, // pequeño extra de señalización
        });
      } catch (mailErr) {
        console.error('Error enviando email de contacto:', mailErr);
      }
    }

    return res.status(201).json({ id: row.id, status: 'ok' });
  } catch (err) {
    console.error('Error en postContact:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
