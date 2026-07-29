import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { analyticsService } from '../services/analyticsService.js';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';

const router = Router();

// Anti-abuso del endpoint público: máx 60 hits/min por IP.
const trackLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * POST /track — registra una visita (público, anónimo).
 * Body: { path, referrer }. La IP y el UA se usan solo para el hash anónimo
 * y para filtrar bots; no se guardan.
 */
router.post('/track', trackLimiter, asyncHandler(async (req, res) => {
    const { path, referrer } = req.body || {};
    await analyticsService.track({
        path,
        referrer,
        ip:        req.ip,
        userAgent: req.headers['user-agent'] || '',
        ownHost:   (req.headers.host || '').replace(/^www\./, '').split(':')[0],
    });
    res.status(204).end();
}));

/**
 * GET /analytics/summary?days=30 — resumen para el admin (privado).
 */
router.get('/summary', requireAuth, asyncHandler(async (req, res) => {
    res.json(await analyticsService.summary(req.query.days));
}));

export default router;
