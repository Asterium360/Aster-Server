import { Asterium } from '../models/Asterium.js';

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

export async function createDiscovery(req: any, res: any) {
  try {
    const body = req.body;
    const row = await Asterium.create({
      ...body,
      author_id: Number(req.user!.sub),
      published_at: body.status === 'published' ? new Date() : null,
    });
    res.status(201).json(row);
  } catch (err) {
    console.error('Error en createDiscovery:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function updateDiscovery(req: any, res: any) {
  try {
    const { id } = req.params;
    const row = await Asterium.findByPk(Number(id));
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    if (req.user!.role !== 'admin' && row.author_id !== Number(req.user!.sub)) {
      return res.status(403).json({ error: 'Sin permisos' });
    }

    Object.assign(row, req.body);
    await row.save();
    res.json(row);
  } catch (err) {
    console.error('Error en updateDiscovery:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

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
