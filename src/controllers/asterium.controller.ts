import { Asterium } from '../models/Asterium.js';


export async function listPublished(req: any, res: any) {

// 🪐 Listar descubrimientos publicados
export async function listPublished(_req: any, res: any) {

  try {
    const limitParam = Number(req.query.limit);
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(limitParam, 50)) : 20;

    const rows = await Asterium.findAll({
      where: { status: 'published' },
      order: [['published_at', 'DESC']],
      limit,
    });
    res.json(rows);
  } catch (err: any) {
    console.error('Error en listPublished:', err);
    res.status(500).json({ error: err.message || 'Error interno del servidor' });
  }
}


export async function getDiscovery(req:any, res:any){
  const {id} = req.params;
  const row = await Asterium.findByPk(Number(id),{
    include: [{association: "author", attributes:["id", "username", "email"]}]
  });
  if (!row) {
    return res.status(404).json({error:"Descubrimiento no encontrado"});

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
  res.json(row);
}

// 🚀 Crear un nuevo descubrimiento
export async function createDiscovery(req: any, res: any) {
  try {
    const body = req.body;
    const authorId = Number(req.user?.sub);

    if (!authorId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const image_url = req.file ? req.file.path : null;

    const row = await Asterium.create({
      ...body,
      author_id: authorId,
      image_url,
      published_at: body.status === 'published' ? new Date() : null,
    });

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

  const { id } = req.params;
  const row = await Asterium.findByPk(Number(id));
  if (!row) return res.status(404).json({ error: 'No encontrado' });

  // 🧩 Solo el autor o un admin pueden modificar
  if (req.user!.role !== 'admin' && row.author_id !== Number(req.user!.sub)) {
    return res.status(403).json({ error: 'Sin permisos' });
  }

  // 🧠 Actualiza solo los campos permitidos
  if (req.body.title !== undefined) row.title = req.body.title;
  if (req.body.excerpt !== undefined) row.excerpt = req.body.excerpt;
  if (req.body.content_md !== undefined) row.content_md = req.body.content_md;
  if (req.body.status !== undefined) row.status = req.body.status;

  // 🖼️ Nuevo campo: imagen
  if (req.body.image_url !== undefined) {
    row.image_url = req.body.image_url || null;
  }

  // Si el estado pasa a "published", guarda la fecha de publicación
  if (req.body.status === 'published' && !row.published_at) {
    row.published_at = new Date();
  }

  await row.save();
  res.json(row);

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

    // Nuevo campo: imagen
    if (req.body.image_url !== undefined) {
      row.image_url = req.body.image_url || null;
    }

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
  const { id } = req.params;
  const row = await Asterium.findByPk(Number(id));
  if (!row) return res.status(404).json({ error: 'No encontrado' });

  if (req.user!.role !== 'admin' && row.author_id !== Number(req.user!.sub)) {
    return res.status(403).json({ error: 'Sin permisos' });
  }

  await row.destroy();
  res.status(204).end();
}
