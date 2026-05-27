import { Router } from 'express';
import { projectService } from '../services/projectService.js';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

// Público
router.get('/', asyncHandler(async (req, res) => {
    const featuredOnly = req.query.featured === '1';
    res.json(await projectService.list({ featuredOnly }));
}));

// Privado
router.post('/', requireAuth, asyncHandler(async (req, res) => {
    const { id, slug } = await projectService.create(req.body || {});
    res.json({ success: true, id, slug });
}));

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
    const id = Number(req.params.id) || req.body?.id;
    await projectService.update(id, req.body || {});
    res.json({ success: true });
}));

// Variante sin id en URL (compat con frontend viejo que mandaba el id en el body)
router.put('/', requireAuth, asyncHandler(async (req, res) => {
    const id = req.body?.id;
    await projectService.update(id, req.body || {});
    res.json({ success: true });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    await projectService.delete(id);
    res.json({ success: true });
}));

// Variante con id en query (compat)
router.delete('/', requireAuth, asyncHandler(async (req, res) => {
    const id = Number(req.query.id);
    await projectService.delete(id);
    res.json({ success: true });
}));

export default router;
