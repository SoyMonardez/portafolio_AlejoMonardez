import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import multer from 'multer';
import { env } from '../config/env.js';

// ─── Constantes ───────────────────────────────────────────────
const ALLOWED_MIME = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png' };
const IG_MAX_BYTES = 8 * 1024 * 1024; // 8 MB (límite de Instagram)

// Directorio en el volumen compartido → nginx lo sirve en /uploads/instagram/
const igDirAbs = path.resolve(process.cwd(), env.upload.dir, '..', 'instagram');
await fs.mkdir(igDirAbs, { recursive: true });

// ─── Multer ───────────────────────────────────────────────────
const igStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, igDirAbs),
    filename: (_req, file, cb) => {
        const ext = ALLOWED_MIME[file.mimetype] || 'jpg';
        const rnd = crypto.randomBytes(8).toString('hex');
        cb(null, `ig_${Date.now()}_${rnd}.${ext}`);
    },
});

export const igUploader = multer({
    storage: igStorage,
    limits: { fileSize: IG_MAX_BYTES },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME[file.mimetype]) {
            return cb(new Error('Instagram solo acepta JPEG o PNG'));
        }
        cb(null, true);
    },
});

// ─── Config ───────────────────────────────────────────────────
const GROQ_API_KEY  = process.env.GROQ_API_KEY;
const GROQ_MODEL    = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const IG_TOKEN      = process.env.INSTAGRAM_ACCESS_TOKEN;
const IG_BIZ_ID     = process.env.INSTAGRAM_BUSINESS_ID;
const SITE_URL      = (process.env.SITE_PUBLIC_URL || 'https://alejomonardez.com').replace(/\/$/, '');

const SOCIAL_PROMPT = `Eres un experto en marketing digital y community management con 10 años de experiencia.
Tu única tarea es redactar captions para Instagram que generen engagement real.

Reglas estrictas:
- Escribe en español argentino, tono auténtico y cercano (no corporativo)
- Primera línea: gancho que detenga el scroll
- Emojis estratégicos, no en exceso
- Call to action claro al final del texto (visita, comenta, guardá, etc.)
- Cierra SIEMPRE con exactamente 10-15 hashtags relevantes (mix de populares + de nicho)
- Máximo 2200 caracteres en total
- Devolvé SOLO el caption, sin explicaciones ni etiquetas extra`;

// ─── Servicio ─────────────────────────────────────────────────
export const instagramService = {

    /** URL pública de la imagen subida al volumen (la sirve Nginx). */
    buildPublicUrl(filename) {
        return `${SITE_URL}/uploads/instagram/${filename}`;
    },

    /** Llama a Groq y devuelve el caption generado. */
    async generateCaption(description) {
        if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY no configurada en el backend');

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: SOCIAL_PROMPT },
                    { role: 'user',   content: description },
                ],
                temperature: 0.8,
                max_tokens:  1024,
            }),
        });

        if (!res.ok) {
            const body = await res.text();
            throw new Error(`Groq error ${res.status}: ${body}`);
        }

        const data = await res.json();
        return data.choices[0].message.content.trim();
    },

    /** Sube la foto y el caption a Instagram y devuelve el permalink. */
    async publishPhoto(imageUrl, caption) {
        if (!IG_TOKEN || !IG_BIZ_ID) {
            throw new Error('INSTAGRAM_ACCESS_TOKEN o INSTAGRAM_BUSINESS_ID no configurados');
        }

        // Paso 1 — crear container de media
        const createRes = await fetch(
            `https://graph.instagram.com/v21.0/${IG_BIZ_ID}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: imageUrl, caption, access_token: IG_TOKEN }),
        });
        if (!createRes.ok) {
            const body = await createRes.text();
            throw new Error(`Meta container error: ${body}`);
        }
        const { id: containerId } = await createRes.json();

        // Paso 2 — esperar procesamiento (hasta 30 s)
        const sleep = ms => new Promise(r => setTimeout(r, ms));
        let status = '';
        for (let i = 0; i < 10; i++) {
            await sleep(3000);
            const sRes = await fetch(
                `https://graph.instagram.com/v21.0/${containerId}?fields=status_code&access_token=${IG_TOKEN}`
            );
            const sData = await sRes.json();
            status = sData.status_code;
            if (status === 'FINISHED') break;
            if (status === 'ERROR') throw new Error('Meta rechazó la imagen. Verificá que sea JPEG/PNG < 8 MB.');
        }
        if (status !== 'FINISHED') throw new Error('La imagen tardó demasiado en procesarse en Meta.');

        // Paso 3 — publicar
        const pubRes = await fetch(
            `https://graph.instagram.com/v21.0/${IG_BIZ_ID}/media_publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ creation_id: containerId, access_token: IG_TOKEN }),
        });
        if (!pubRes.ok) {
            const body = await pubRes.text();
            throw new Error(`Meta publish error: ${body}`);
        }
        const { id: mediaId } = await pubRes.json();

        // Paso 4 — obtener permalink
        const linkRes = await fetch(
            `https://graph.instagram.com/v21.0/${mediaId}?fields=permalink&access_token=${IG_TOKEN}`
        );
        const linkData = await linkRes.json();
        return linkData.permalink || `https://www.instagram.com/p/${mediaId}/`;
    },
};
