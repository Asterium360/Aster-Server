// // src/controllers/user.controller.ts
// import { Op } from 'sequelize';
// import bcrypt from 'bcrypt';
// import { User } from '../models/User.js';

// function ensureAdmin(req: any, res: any) {
//   if (req.user?.role !== 'admin') {
//     res.status(403).json({ error: 'Solo administradores' });
//     return false;
//   }
//   return true;
// }

// // GET /users?q=...&role=admin|user&active=true|false&page=1&pageSize=20
// export async function listUsers(req: any, res: any) {
//   if (!ensureAdmin(req, res)) return;

//   const {
//     q,
//     role,                 // 'admin' | 'user'
//     active,               // 'true' | 'false'
//     page = 1,
//     pageSize = 20,
//     sort = 'created_at',
//     dir = 'DESC',
//   } = req.query;

//   const where: any = {};
//   if (q) {
//     where[Op.or] = [
//       { email: { [Op.like]: `%${q}%` } },
//       { username: { [Op.like]: `%${q}%` } },
//       { display_name: { [Op.like]: `%${q}%` } },
//     ];
//   }
//   if (role === 'admin') where.role_id = 1;
//   if (role === 'user') where.role_id = 2;
//   if (active === 'true') where.is_active = true;
//   if (active === 'false') where.is_active = false;

//   const offset = (Number(page) - 1) * Number(pageSize);
//   const limit = Number(pageSize);

//   const { rows, count } = await User.findAndCountAll({
//     where,
//     order: [[String(sort), String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
//     limit,
//     offset,
//   });

//   res.json({
//     data: rows,
//     pagination: {
//       page: Number(page),
//       pageSize: limit,
//       total: count,
//       totalPages: Math.ceil(count / limit),
//     },
//   });
// }

// // GET /users/:id
// export async function getUser(req: any, res: any) {
//   if (!ensureAdmin(req, res)) return;

//   const user = await User.findByPk(Number(req.params.id));
//   if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
//   res.json(user);
// }

// // POST /users
// export async function createUser(req: any, res: any) {
//   if (!ensureAdmin(req, res)) return;

//   const { email, username, password, display_name, role } = req.body;

//   if (!email || !username || !password) {
//     return res.status(400).json({ error: 'email, username y password son obligatorios' });
//   }

//   const dup = await User.findOne({ where: { [Op.or]: [{ email }, { username }] } });
//   if (dup) return res.status(409).json({ error: 'Email o username ya en uso' });

//   const hash = await bcrypt.hash(password, 10);
//   const role_id = role === 'admin' ? 1 : 2;

//   const user = await User.create({
//     email,
//     username,
//     password_hash: hash,
//     display_name: display_name ?? null,
//     role_id,
//   });

//   res.status(201).json(user);
// }

// // PATCH /users/:id
// export async function updateUser(req: any, res: any) {
//   if (!ensureAdmin(req, res)) return;

//   const { id } = req.params;
//   const user = await User.findByPk(Number(id), { paranoid: false });
//   if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

//   const { email, username, password, display_name, is_active, role } = req.body;

//   if (email) user.email = email;
//   if (username) user.username = username;
//   if (typeof display_name !== 'undefined') user.display_name = display_name;
//   if (typeof is_active !== 'undefined') user.is_active = Boolean(is_active);

//   if (password) {
//     user.password_hash = await bcrypt.hash(password, 10);
//   }
//   if (role) {
//     user.role_id = role === 'admin' ? 1 : 2;
//   }

//   await user.save();
//   res.json(user);
// }

// // DELETE /users/:id
// export async function deleteUser(req: any, res: any) {
//   if (!ensureAdmin(req, res)) return;

//   const { id } = req.params;

//   if (String(req.user?.sub) === String(id)) {
//     return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
//   }

//   const user = await User.findByPk(Number(id));
//   if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

//   await user.destroy(); // si quieres "soft delete", añade { paranoid: true } al modelo
//   res.status(204).end();
// }

// // PATCH /users/:id/role  { role: 'admin' | 'user' }
// export async function setUserRole(req: any, res: any) {
//   if (!ensureAdmin(req, res)) return;

//   const { id } = req.params;
//   const { role } = req.body;

//   if (!['admin', 'user'].includes(role)) {
//     return res.status(400).json({ error: 'role debe ser admin|user' });
//   }
//   if (String(req.user?.sub) === String(id) && role === 'user') {
//     return res.status(400).json({ error: 'No puedes degradarte a ti mismo' });
//   }

//   const user = await User.findByPk(Number(id));
//   if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

//   user.role_id = role === 'admin' ? 1 : 2;
//   await user.save();

//   res.json({ id: user.id, role });
// }

// // PATCH /users/:id/toggle  { is_active: boolean }
// export async function toggleActive(req: any, res: any) {
//   if (!ensureAdmin(req, res)) return;

//   const { id } = req.params;
//   const { is_active } = req.body;

//   const user = await User.findByPk(Number(id));
//   if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

//   user.is_active = Boolean(is_active);
//   await user.save();
//   res.json({ id: user.id, is_active: user.is_active });
// }

// src/controllers/user.controller.ts
import { Op } from 'sequelize';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';

// === AÑADIDO: import del modelo de publicaciones (Asterium) ===
import { Asterium } from '../models/Asterium.js'; // <-- AÑADIDO

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

/* =========================================================
 *  AÑADIDOS PARA PERFIL PÚBLICO + PUBLICACIONES DEL USUARIO
 *  (No rompen ni sustituyen tus endpoints admin existentes)
 * ========================================================= */

/**
 * AÑADIDO
 * GET /users/:id/profile?includePosts=true&page=1&limit=10&status=published|all
 *
 * Respuesta:
 *  - user   (campos existentes del modelo User)
 *  - posts  (AÑADIDO en la RESPUESTA: array de Asterium del usuario si includePosts=true)
 *  - pagination (AÑADIDO en la RESPUESTA: info de paginación si includePosts=true)
 *
 * Por defecto solo devuelve publicaciones con status='published'.
 */
export async function getUserProfile(req: any, res: any) {
  try {
    const { id } = req.params;

    // Control de carga de posts y paginación (AÑADIDO)
    const includePosts = String(req.query.includePosts ?? 'false') === 'true';
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const status = (req.query.status as string) || 'published';

    const user = await User.findByPk(Number(id), {
      attributes: ['id', 'email', 'username', 'display_name', 'created_at'],
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    let posts: any[] = []; // AÑADIDO
    let total = 0;         // AÑADIDO

    if (includePosts) {
      const where: any = { author_id: user.id };
      if (status !== 'all') where.status = 'published';

      const { rows, count } = await Asterium.findAndCountAll({
        where,
        order: [
          ['published_at', 'DESC'],
          ['created_at', 'DESC'],
        ],
        limit,
        offset: (page - 1) * limit,
        attributes: [
          'id',
          'title',
          'excerpt',
          'image_url',
          'status',
          'published_at',
          'created_at',
          // No incluyo content_md aquí para no enviar contenido largo si no es necesario
          // (puedes añadirlo si lo quieres en la lista)
        ],
      });

      posts = rows;  // AÑADIDO
      total = count; // AÑADIDO
    }

    return res.json({
      user,        // existente
      posts,       // AÑADIDO (en la respuesta)
      pagination: includePosts
        ? {        // AÑADIDO (en la respuesta)
            page,
            limit,
            total,
            totalPages: Math.max(1, Math.ceil(total / limit)),
          }
        : undefined,
    });
  } catch (err: any) {
    console.error('Error en getUserProfile:', err);
    return res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}

/**
 * AÑADIDO
 * GET /users/:id/avatar
 *
 * Devuelve:
 *  - Si en el futuro añades una columna `avatar_url` en User y está definida, redirige a esa URL.
 *  - Si no existe columna o no está definida, responde un SVG de fallback con la inicial del username.
 *
 * No añade campos nuevos a la BD y siempre devuelve algo mostrable por <img>.
 */
export async function getUserAvatar(req: any, res: any) {
  try {
    const { id } = req.params;

    // Busco username; si en el futuro existe avatar_url, lo uso sin romper nada
    const user = await User.findByPk(Number(id), {
      attributes: ['id', 'username'] as any,
    });

    // Si existiera user['avatar_url'] en tu modelo a futuro:
    // if (user && (user as any).avatar_url) {
    //   return res.redirect((user as any).avatar_url);
    // }

    // Fallback: SVG con inicial (no requiere columna extra)
    const initial =
      (user?.get('username') as string | undefined)?.[0]?.toUpperCase() || 'U';
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(`
      <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
        <rect width="100%" height="100%" fill="#0f172a"/>
        <text x="50%" y="55%" font-size="140" text-anchor="middle" fill="#94a3b8" font-family="Arial, sans-serif">${initial}</text>
      </svg>
    `);
  } catch (err: any) {
    console.error('getUserAvatar error:', err);
    return res.status(500).end();
  }
}
