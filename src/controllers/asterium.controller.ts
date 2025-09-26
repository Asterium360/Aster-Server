import { Asterium } from '../models/Asterium.js';

export async function listPublished(_req: any, res: any) {
  const rows = await Asterium.findAll({
    where: { status: 'published' },
    order: [['published_at', 'DESC']],
    limit: 20,
  });
  res.json(rows);
}

export async function createDiscovery(req: any, res: any) {
  const body = req.body;
  const row = await Asterium.create({
    ...body,
    author_id: req.user!.sub,
    published_at: body.status === 'published' ? new Date() : null,
  });
  res.status(201).json(row);
}

export async function updateDiscovery(req: any, res: any) {
  const { id } = req.params;
  const row = await Asterium.findByPk(Number(id));
  if (!row) return res.status(404).json({ error: 'No encontrado' });

  if (req.user!.role !== 'admin' && row.author_id !== req.user!.sub) {
    return res.status(403).json({ error: 'Sin permisos' });
  }

  Object.assign(row, req.body);
  await row.save();
  res.json(row);
}

export async function deleteDiscovery(req: any, res: any) {
  const { id } = req.params;
  const row = await Asterium.findByPk(Number(id));
  if (!row) return res.status(404).json({ error: 'No encontrado' });

  if (req.user!.role !== 'admin' && row.author_id !== req.user!.sub) {
    return res.status(403).json({ error: 'Sin permisos' });
  }

  await row.destroy();
  res.status(204).end();
}
