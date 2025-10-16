// src/routes/user.routes.ts
import { Router } from 'express';
import { requireAuth as authRequired } from '../middlewares/auth.js';
import { checkRole } from '../middlewares/checkRole.js';
import { validate } from '../middlewares/validate.js';
import { z } from 'zod';
import {
  listUsers, getUser, createUser, updateUser, deleteUser, setUserRole, toggleActive, getUserProfile, getUserAvatar
} from '../controllers/user.controller.js';

const r = Router();
// Perfil público + posts (usa query includePosts, page, limit, status)
r.get('/:id/profile', getUserProfile);

// Avatar público (redirige a avatar_url si existe o devuelve SVG fallback)
r.get('/:id/avatar', getUserAvatar);

// ejemplo: solo los ADMIN pueden listar, crear, editar, eliminar usuarios
r.get('/', authRequired, checkRole(['admin']), listUsers);
r.get('/:id', authRequired, checkRole(['admin']), getUser);
r.post('/', authRequired, checkRole(['admin']), validate(
  z.object({
    email: z.string().email(),
    username: z.string(),
    password: z.string().min(6),
    role: z.enum(['admin', 'user']).optional(),
  })
), createUser);
r.patch('/:id', authRequired, checkRole(['admin']), updateUser);
r.delete('/:id', authRequired, checkRole(['admin']), deleteUser);

export default r;
