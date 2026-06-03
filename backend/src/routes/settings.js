import { Router } from 'express';
import { settingsService } from '../services/settingsService.js';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

// Público — devuelve emails ofuscados (anti-bot)
router.get('/', asyncHandler(async (_req, res) => {
    res.set('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
    res.json(await settingsService.getPublic());
}));

// Privado — versión sin ofuscar (para el panel admin)
router.get('/raw', requireAuth, asyncHandler(async (_req, res) => {
    res.json(await settingsService.getRaw());
}));

router.put('/', requireAuth, asyncHandler(async (req, res) => {
    await settingsService.update(req.body || {});
    res.json({ success: true });
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
    await settingsService.update(req.body || {});
    res.json({ success: true });
}));

router.delete('/', requireAuth, asyncHandler(async (req, res) => {
    await settingsService.delete(req.query.key);
    res.json({ success: true });
}));

export default router;
