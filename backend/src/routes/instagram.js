import { Router } from 'express';
import { requireAuth }      from '../middlewares/auth.js';
import { asyncHandler }     from '../middlewares/asyncHandler.js';
import { igUploader, instagramService } from '../services/instagramService.js';
import { badRequest }       from '../utils/httpError.js';

const router = Router();

/**
 * POST /instagram/publish  (requiere auth)
 * Body: multipart/form-data
 *   file        — imagen JPEG o PNG (máx. 8 MB)
 *   description — texto breve; Groq genera el caption completo
 *
 * Responde: { success, caption, permalink }
 */
router.post(
    '/publish',
    requireAuth,
    igUploader.single('file'),
    asyncHandler(async (req, res) => {
        if (!req.file)              throw badRequest('No se recibió ninguna imagen');
        const desc = req.body?.description?.trim();
        if (!desc)                  throw badRequest('Falta la descripción del post');

        const imageUrl = instagramService.buildPublicUrl(req.file.filename);
        const caption  = await instagramService.generateCaption(desc);
        const permalink = await instagramService.publishPhoto(imageUrl, caption);

        res.json({ success: true, caption, permalink });
    })
);

export default router;
