import { Router } from 'express';
import { requireAuth }      from '../middlewares/auth.js';
import { asyncHandler }     from '../middlewares/asyncHandler.js';
import { igUploader, instagramService } from '../services/instagramService.js';
import { badRequest }       from '../utils/httpError.js';

const router = Router();

/**
 * POST /instagram/publish  (requiere auth)
 * Body: multipart/form-data
 *   files[]     — 1-10 imágenes JPEG/PNG (máx. 8 MB c/u)
 *   description — texto breve; Groq genera el caption completo
 *
 * Responde: { success, caption, permalink, type: 'photo'|'carousel' }
 */
router.post(
    '/publish',
    requireAuth,
    igUploader.array('files', instagramService.maxImages),
    asyncHandler(async (req, res) => {
        const files = req.files;
        if (!files?.length) throw badRequest('No se recibió ninguna imagen');

        const desc = req.body?.description?.trim();
        if (!desc)  throw badRequest('Falta la descripción del post');

        const filePaths = files.map(f => f.path);
        const caption   = await instagramService.generateCaption(desc);

        let permalink, type;
        if (filePaths.length === 1) {
            permalink = await instagramService.publishPhoto(filePaths[0], caption);
            type = 'photo';
        } else {
            permalink = await instagramService.publishCarousel(filePaths, caption);
            type = 'carousel';
        }

        res.json({ success: true, caption, permalink, type, count: filePaths.length });
    })
);

export default router;
