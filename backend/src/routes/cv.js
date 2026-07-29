import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { cvService } from '../services/cvService.js';
import { settingsRepo } from '../repositories/settingsRepo.js';

const router = Router();
router.use(requireAuth);

router.get('/draft', asyncHandler(async (_req, res) => {
  const [draft, cvUrl] = await Promise.all([cvService.getDraft(), settingsRepo.findOne('cv_url')]);
  res.json({ draft, cv_url: cvUrl || '' });
}));

router.put('/draft', asyncHandler(async (req, res) => {
  const draft = await cvService.saveDraft(req.body?.draft || req.body || {});
  res.json({ success: true, draft });
}));

router.post('/generate', asyncHandler(async (req, res) => {
  const result = await cvService.generate(req.body?.draft || req.body || {});
  res.status(201).json({ success: true, ...result });
}));

export default router;
