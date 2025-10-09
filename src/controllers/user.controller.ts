// src/controllers/user.controller.ts
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

function ensureAdmin(req: any, res: any) {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Solo administradores' });
    return false;
  }
  return true;
}

// GET /users?q=...&role=admin|user&active=true|false&page=1&pageSize=20
export async function listUsers(req: any, res: any) {
  if (!ensureAdmin(req, res)) return;

  const {
    q,
    role,                 // 'admin' | 'user'
    active,               // 'true' | 'false'
    page = 1,
    pageSize = 20,
    sort = 'created_at',
    dir = 'DESC',
  } = req.query;

  const where: any = {};
  if (q) {
    where[Op.or] = [
      { email: { [Op.like]: `%${q}%` } },
      { username: { [Op.like]: `%${q}%` } },
      { display_name: { [Op.like]: `%${q}%` } },
    ];
  }
  if (role === 'admin') where.role_id = 1;
  if (role === 'user') where.role_id = 2;
  if (active === 'true') where.is_active = true;
  if (active === 'false') where.is_active = false;

  const offset = (Number(page) - 1) * Number(pageSize);
  const limit = Number(pageSize);

  const { rows, count } = await User.findAndCountAll({
    where,
    order: [[String(sort), String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
    limit,
    offset,
  });

  res.json({
    data: rows,
    pagination: {
      page: Number(page),
      pageSize: limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    },
  });
}

// GET /users/:id
export async function getUser(req: any, res: any) {
  if (!ensureAdmin(req, res)) return;

  const user = await User.findByPk(Number(req.params.id));
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  res.json(user);
}

// POST /users
export async function createUser(req: any, res: any) {
  if (!ensureAdmin(req, res)) return;

  const { email, username, password, display_name, role } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ error: 'email, username y password son obligatorios' });
  }

  const dup = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });
  if (dup) return res.status(409).json({ error: 'Email o username ya en uso' });

  const hash = await bcrypt.hash(password, 10);
  const role_id = role === 'admin' ? 1 : 2;

  const user = await User.create({
    email,
    username,
    password_hash: hash,
    display_name: display_name ?? null,
    role_id,
  });

  res.status(201).json(user);
}

// PATCH /users/:id
export async function updateUser(req: any, res: any) {
  if (!ensureAdmin(req, res)) return;

  const { id } = req.params;
  const user = await User.findByPk(Number(id), { paranoid: false });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const { email, username, password, display_name, is_active, role } = req.body;

  if (email) user.email = email;
  if (username) user.username = username;
  if (typeof display_name !== 'undefined') user.display_name = display_name;
  if (typeof is_active !== 'undefined') user.is_active = Boolean(is_active);

  if (password) {
    user.password_hash = await bcrypt.hash(password, 10);
  }
  if (role) {
    user.role_id = role === 'admin' ? 1 : 2;
  }

  await user.save();
  res.json(user);
}

// DELETE /users/:id
export async function deleteUser(req: any, res: any) {
  if (!ensureAdmin(req, res)) return;

  const { id } = req.params;

  if (String(req.user?.sub) === String(id)) {
    return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
  }

  const user = await User.findByPk(Number(id));
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  await user.destroy(); // si quieres "soft delete", añade { paranoid: true } al modelo
  res.status(204).end();
}

// PATCH /users/:id/role  { role: 'admin' | 'user' }
export async function setUserRole(req: any, res: any) {
  if (!ensureAdmin(req, res)) return;

  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ error: 'role debe ser admin|user' });
  }
  if (String(req.user?.sub) === String(id) && role === 'user') {
    return res.status(400).json({ error: 'No puedes degradarte a ti mismo' });
  }

  const user = await User.findByPk(Number(id));
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  user.role_id = role === 'admin' ? 1 : 2;
  await user.save();

  res.json({ id: user.id, role });
}

// PATCH /users/:id/toggle  { is_active: boolean }
export async function toggleActive(req: any, res: any) {
  if (!ensureAdmin(req, res)) return;

  const { id } = req.params;
  const { is_active } = req.body;

  const user = await User.findByPk(Number(id));
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  user.is_active = Boolean(is_active);
  await user.save();
  res.json({ id: user.id, is_active: user.is_active });
}
