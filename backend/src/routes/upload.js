import { Router } from 'express';
import { uploader, cvUploader, uploadService } from '../services/uploadService.js';
import { settingsService } from '../services/settingsService.js';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { badRequest } from '../utils/httpError.js';

const router = Router();

/**
 * POST /upload  — sube una imagen de proyecto.
 * Devuelve { success, url }.
 */
router.post(
    '/',
    requireAuth,
    uploader.single('file'),
    asyncHandler(async (req, res) => {
        if (!req.file) throw badRequest('No se recibió archivo');
        const url = uploadService.buildPublicUrl(req.file);
        res.json({ success: true, url });
    })
);

/**
 * POST /upload/cv  — reemplaza el CV (PDF, máx 10 MB).
 * Persiste la URL nueva en settings.cv_url y borra los CVs viejos.
 */
router.post(
    '/cv',
    requireAuth,
    cvUploader.single('file'),
    asyncHandler(async (req, res) => {
        if (!req.file) throw badRequest('No se recibió archivo');

        // Reescribir metadatos del PDF (autor, título) para que el browser
        // muestre "Alejo Monardez" en vez del nombre embebido en el template
        await uploadService.patchCvMeta(req.file);

        const url = uploadService.buildCvUrl(req.file);

        // Persistir en settings (clave 'cv_url') y limpiar archivos viejos
        await Promise.all([
            settingsService.update({ cv_url: url }),
            uploadService.pruneOldCvs(req.file.filename),
        ]);

        res.json({ success: true, url });
    })
);

export default router;
