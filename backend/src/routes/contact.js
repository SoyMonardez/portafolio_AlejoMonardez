import { Router } from 'express';
import { messageService } from '../services/messageService.js';
import { contactRateLimiter } from '../middlewares/rateLimit.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

router.post('/', contactRateLimiter, asyncHandler(async (req, res) => {
    const result = await messageService.create(req.body || {});
    res.json({ success: true, message: 'Message sent successfully', id: result.id });
}));

export default router;
