import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import type { AuthTokenPayload } from '../middlewares/auth.js';

export async function register(req: any, res: any) {
  try {
    const { email, username, password, display_name } = req.body;
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Faltan campos: email, username y password' });
    }

    const [existsEmail, existsUser] = await Promise.all([
      User.findOne({ where: { email } }),
      User.findOne({ where: { username } }),
    ]);
    if (existsEmail) return res.status(409).json({ error: 'Email en uso' });
    if (existsUser) return res.status(409).json({ error: 'Username en uso' });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, username, password_hash: hash, display_name });

    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Falta JWT_SECRET' });

    const payload: AuthTokenPayload = { sub: String(user.id), role: 'user', iat: Math.floor(Date.now()/1000) };
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    return res.status(201).json({ token, user: { id: user.id, email: user.email, username: user.username } });
  } catch (err: any) {
    if (err?.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Email o username ya en uso' });
    }
    if (err?.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors?.map((e:any)=>e.message) ?? 'Datos inválidos' });
    }
    console.error('Error en register:', err); // 👈 verás el error SQL real aquí
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}


export async function login(req: any, res: any) {
  try {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({ error: 'Faltan campos: email y password' });
    }

    const emailNorm = String(email).toLowerCase().trim();

    // Buscar usuario con el scope que incluye el hash
    const user = await User.scope('withPassword').findOne({ where: { email: emailNorm } });
    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Comparar password
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Firmar JWT
    const secret = process.env.JWT_SECRET;
    if (!secret) return res.status(500).json({ error: 'Falta JWT_SECRET' });

    const role = user.role_id === 1 ? 'admin' : 'user';
    const payload: AuthTokenPayload = {
      sub: String(user.id),
      role,
      iat: Math.floor(Date.now() / 1000),
    };
    const token = jwt.sign(payload, secret, { expiresIn: '7d' });

    return res.json({
      token,
      user: { id: user.id, email: user.email, username: user.username, role },
    });
  } catch (err: any) {
    // Errores de Sequelize (poco comunes aquí, pero por si acaso)
    if (err?.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors?.map((e: any) => e.message) ?? 'Datos inválidos' });
    }
    console.error('Error en login:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}


// (bonus) promover a admin manualmente
export async function promoteToAdmin(req: any, res: any) {
  const { id } = req.params;
  const user = await User.findByPk(Number(id));
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  user.role_id = 1;
  await user.save();

  res.json({ message: 'Usuario promovido a admin', id: user.id });
}
