import { Router } from 'express';
import { messageService } from '../services/messageService.js';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

router.use(requireAuth);

router.get('/', asyncHandler(async (_req, res) => {
    res.json(await messageService.list());
}));

router.delete('/:id', asyncHandler(async (req, res) => {
    await messageService.delete(Number(req.params.id));
    res.json({ success: true });
}));

// Compat: DELETE /messages?id=N
router.delete('/', asyncHandler(async (req, res) => {
    await messageService.delete(Number(req.query.id));
    res.json({ success: true });
}));

export default router;
