import { Asterium } from '../models/Asterium.js';
import type { Request, Response } from 'express';
import { Op } from "sequelize";

// 🪐 Listar descubrimientos publicados
export async function listPublished(_req: any, res: any) {
  try {
    const rows = await Asterium.findAll({
      where: { status: 'published' },
      order: [['published_at', 'DESC']],
      limit: 20,
    });
    res.json(rows);
  } catch (err) {
    console.error('Error en listPublished:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// 🌌 Obtener un descubrimiento por ID
export async function getDiscovery(req: any, res: any) {
  try {
    const { id } = req.params;
    const row = await Asterium.findByPk(Number(id), {
      include: [{ association: 'author', attributes: ['id', 'username', 'email'] }],
    });
    if (!row) {
      return res.status(404).json({ error: 'Descubrimiento no encontrado' });
    }
    res.json(row);
  } catch (err) {
    console.error('Error en getDiscovery:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// 🚀 Crear un nuevo descubrimiento
export async function createDiscovery(req: any, res: any) {
  try {
    const body = req.body;
    const authorId = Number(req.user?.sub);

    if (!authorId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const image_url = req.file 
      ? req.file.path 
      : (body.image_url || null);

    const row = await Asterium.create({
      ...body,
      author_id: authorId,
      image_url,
      published_at: body.status === 'published' ? new Date() : null,
    });

    console.log('req.file:', req.file);

    res.status(201).json({
      message: 'Descubrimiento creado correctamente 🚀',
      discovery: row,
    });
  } catch (error: any) {
    console.error('Error en createDiscovery:', error);
    res.status(500).json({ error: error.message });
  }
}

// 🪶 Actualizar un descubrimiento
export async function updateDiscovery(req: any, res: any) {
  try {
    const { id } = req.params;
    const row = await Asterium.findByPk(Number(id));
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    // Solo el autor o un admin pueden modificar
    if (req.user!.role !== 'admin' && row.author_id !== Number(req.user!.sub)) {
      return res.status(403).json({ error: 'Sin permisos' });
    }

    // Actualiza solo los campos permitidos
    if (req.body.title !== undefined) row.title = req.body.title;
    if (req.body.excerpt !== undefined) row.excerpt = req.body.excerpt;
    if (req.body.content_md !== undefined) row.content_md = req.body.content_md;
    if (req.body.status !== undefined) row.status = req.body.status;

    // 🔹 Manejo de la imagen
    if (req.file) {
      // Si subieron un archivo, reemplaza la imagen
      row.image_url = req.file.path;
    } else if (req.body.image_url !== undefined) {
      // Si enviaron una URL (o vacío), actualiza
      row.image_url = req.body.image_url || null;
    }
    // Si no hay cambios, mantiene la imagen existente

    // Si el estado pasa a "published", guarda la fecha de publicación
    if (req.body.status === 'published' && !row.published_at) {
      row.published_at = new Date();
    }

    await row.save();
    res.json(row);
  } catch (err) {
    console.error('Error en updateDiscovery:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// ☄️ Eliminar un descubrimiento
export async function deleteDiscovery(req: any, res: any) {
  try {
    const { id } = req.params;
    const row = await Asterium.findByPk(Number(id));
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    if (req.user!.role !== 'admin' && row.author_id !== Number(req.user!.sub)) {
      return res.status(403).json({ error: 'Sin permisos' });
    }

    await row.destroy();
    res.status(204).end();
  } catch (err) {
    console.error('Error en deleteDiscovery:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

//-------------------------- SCOPE DELETED BUTTERFLIES: solo para admins---------------------
// Esta función usa el scope 'withDeleted' para obtener todos los registros (incluyendo los soft delete).
export const getAllDiscoveriesForAdmin = async (req:Request, res:Response):Promise<void> => {
  try {
    const allDiscoveries = await Asterium.scope('withDeleted').findAll();
    res.status(200).json(allDiscoveries);
  } catch (error: any) {
    console.error("Error getting records for admin:", error);
    res.status(500).json({ error: "Error al obtener los registros para el administrador" });
  }
};

// Obtener mariposa borrada por ID
export const getDeletedDiscovery = async (req:Request, res:Response):Promise<void> => {
  try {
    const discovery = await Asterium.scope('withDeleted').findByPk(req.params.id);
    res.status(200).json(discovery);
  } catch (error: any) {
    console.error("Error Sequelize en getById:", error);
    res.status(500).json({ error: "Error al obtener mariposa" });
  }
}

// Obtener solo mariposas eliminadas (soft deleted)
export const getDeletedDiscoveries = async (req:Request, res:Response):Promise<void> => {
  try {
    const deleted = await Asterium.findAll({
      paranoid: false,
      where: {
        deleted_at: {
          [Op.ne]: null
        }
      }
    });

    res.json(deleted);
  } catch (error: any) {
    console.error("Error al obtener mariposas eliminadas:", error);
    res.status(500).json({ error: "No se pudieron obtener las mariposas eliminadas"});
  }
};