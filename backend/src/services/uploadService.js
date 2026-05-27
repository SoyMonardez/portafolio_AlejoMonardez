import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { badRequest } from '../utils/httpError.js';
import { slugify } from '../utils/slug.js';

// ─────────────────── Configuración base ───────────────────
const ALLOWED_IMAGE_MIME = {
    'image/png':  'png',
    'image/jpeg': 'jpg',
    'image/jpg':  'jpg',
    'image/webp': 'webp',
    'image/gif':  'gif',
};

const ALLOWED_CV_MIME = {
    'application/pdf': 'pdf',
};

const CV_MAX_BYTES = 10 * 1024 * 1024;   // 10 MB

const uploadDirAbs = path.resolve(process.cwd(), env.upload.dir);   // imágenes de proyectos
const cvDirAbs     = path.resolve(uploadDirAbs, '..', 'cv');        // /uploads/cv
const cvPublicBase = env.upload.publicBase.replace(/\/projects$/, '') + '/cv';

await fs.mkdir(uploadDirAbs, { recursive: true });
await fs.mkdir(cvDirAbs,     { recursive: true });

// ─────────────────── Uploader de imágenes (existente) ───────────────────
const imageStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDirAbs),
    filename: (req, file, cb) => {
        const ext = ALLOWED_IMAGE_MIME[file.mimetype];
        if (!ext) return cb(new Error('Invalid mime'));
        const base  = slugify(req.body?.name || 'img');
        const stamp = Date.now();
        const rnd   = crypto.randomBytes(3).toString('hex');
        cb(null, `${base}_${stamp}_${rnd}.${ext}`);
    },
});

export const uploader = multer({
    storage: imageStorage,
    limits:  { fileSize: env.upload.maxBytes },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_IMAGE_MIME[file.mimetype]) {
            return cb(new Error('Tipo de archivo no permitido (png, jpg, webp, gif)'));
        }
        cb(null, true);
    },
});

// ─────────────────── Uploader del CV (nuevo) ───────────────────
const cvStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, cvDirAbs),
    filename: (_req, _file, cb) => {
        // Filename con timestamp → cache-busting automático en el browser
        cb(null, `cv_${Date.now()}.pdf`);
    },
});

export const cvUploader = multer({
    storage: cvStorage,
    limits:  { fileSize: CV_MAX_BYTES },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_CV_MIME[file.mimetype]) {
            return cb(new Error('Solo se acepta PDF (application/pdf)'));
        }
        cb(null, true);
    },
});

// ─────────────────── Servicio ───────────────────
export const uploadService = {
    /** URL pública para imágenes de proyectos. */
    buildPublicUrl(file) {
        if (!file) throw badRequest('No se recibió archivo');
        return `${env.upload.publicBase}/${file.filename}`;
    },

    /** URL pública del CV recién subido. */
    buildCvUrl(file) {
        if (!file) throw badRequest('No se recibió archivo');
        return `${cvPublicBase}/${file.filename}`;
    },

    /**
     * Borra CVs viejos dejando solo el más reciente.
     * Se llama después de subir uno nuevo para no acumular archivos.
     */
    async pruneOldCvs(keepFilename) {
        try {
            const files = await fs.readdir(cvDirAbs);
            await Promise.all(
                files
                    .filter(f => f !== keepFilename && f.startsWith('cv_') && f.endsWith('.pdf'))
                    .map(f => fs.unlink(path.join(cvDirAbs, f)).catch(() => {}))
            );
        } catch { /* no es bloqueante */ }
    },
};
