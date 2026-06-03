import { Router } from 'express';
import { uploader, cvUploader, uploadService } from '../services/uploadService.js';
import { settingsService } from '../services/settingsService.js';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { badRequest } from '../utils/httpError.js';
import { jobQueue } from '../utils/jobQueue.js';

const router = Router();

// Handler de la cola: reescribe metadatos del PDF + limpia CVs viejos en 2do plano.
jobQueue.register('cv:postprocess', async ({ file }) => {
    await uploadService.patchCvMeta(file);
    await uploadService.pruneOldCvs(file.filename);
});

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

        // El archivo ya está en disco. Persistimos la URL (rápido) y respondemos.
        const url = uploadService.buildCvUrl(req.file);
        await settingsService.update({ cv_url: url });

        // Lo pesado (reescribir metadatos del PDF + borrar CVs viejos) va a la cola.
        // El admin no espera: el CV ya queda disponible y los metadatos se
        // corrigen en 2do plano (con reintentos).
        jobQueue.enqueue('cv:postprocess', { file: req.file });

        res.json({ success: true, url });
    })
);

export default router;
