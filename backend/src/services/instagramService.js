import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import multer from 'multer';
import sharp from 'sharp';
import { env } from '../config/env.js';

// ─── Límites de aspect ratio de Instagram ─────────────────────
// Instagram acepta ratios (ancho/alto) entre 4:5 (0.8) y 1.91:1.
const IG_RATIO_MIN = 0.8;   // 4:5  (vertical máximo)
const IG_RATIO_MAX = 1.91;  // 1.91:1 (horizontal máximo)

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/** Devuelve el ratio (ancho/alto) de una imagen. */
async function getRatio(filePath) {
    const { width, height } = await sharp(filePath).metadata();
    return width / height;
}

/**
 * Encuadra una imagen al ratio objetivo SIN recortar contenido:
 * agrega barras (letterbox) del color de fondo donde haga falta.
 *
 * @param {string} filePath    archivo a procesar (se sobreescribe)
 * @param {number} targetRatio ratio deseado (ancho/alto), ya validado al rango IG
 * @param {string} bg          color de las barras ('black' o 'white')
 */
async function fitToRatio(filePath, targetRatio, bg = 'black') {
    const meta   = await sharp(filePath).metadata();
    const ratio  = meta.width / meta.height;

    // Si ya coincide (con tolerancia mínima), no tocar el archivo.
    if (Math.abs(ratio - targetRatio) < 0.01) return filePath;

    // Marco que contiene la imagen completa al ratio objetivo (sin upscaling):
    const frameW = Math.max(meta.width,  Math.round(meta.height * targetRatio));
    const frameH = Math.round(frameW / targetRatio);

    const background = bg === 'white'
        ? { r: 255, g: 255, b: 255, alpha: 1 }
        : { r: 0,   g: 0,   b: 0,   alpha: 1 };

    const tmpPath = filePath.replace(/(\.\w+)$/, '_ig.jpg');
    await sharp(filePath)
        .resize(frameW, frameH, { fit: 'contain', background })
        .jpeg({ quality: 92 })
        .toFile(tmpPath);

    await fs.rename(tmpPath, filePath);
    return filePath;
}

/**
 * Para una sola foto: respeta el ratio natural; solo lo ajusta si está
 * fuera del rango permitido por Instagram.
 */
async function normalizeSingle(filePath, bg = 'black') {
    const ratio  = await getRatio(filePath);
    const target = clamp(ratio, IG_RATIO_MIN, IG_RATIO_MAX);
    // Si ya está dentro del rango, no se modifica nada.
    if (target === ratio) return filePath;
    return fitToRatio(filePath, target, bg);
}

// ─── Constantes ───────────────────────────────────────────────
const ALLOWED_MIME = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png' };
const IG_MAX_BYTES   = 8 * 1024 * 1024;  // 8 MB por imagen (límite Instagram)
const IG_MAX_IMAGES  = 10;               // máximo de imágenes por carousel

// Directorio en el volumen compartido → Nginx lo sirve en /uploads/instagram/
const igDirAbs = path.resolve(process.cwd(), env.upload.dir, '..', 'instagram');
await fs.mkdir(igDirAbs, { recursive: true });

// ─── Multer (soporta hasta 10 archivos) ───────────────────────
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
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const IG_TOKEN     = process.env.INSTAGRAM_ACCESS_TOKEN;
const IG_BIZ_ID    = process.env.INSTAGRAM_BUSINESS_ID;
const SITE_URL     = (process.env.SITE_PUBLIC_URL || 'https://alejomonardez.com').replace(/\/$/, '');

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

// ─── Helpers internos ─────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitForContainer(containerId) {
    for (let i = 0; i < 10; i++) {
        await sleep(3000);
        const res  = await fetch(
            `https://graph.instagram.com/v21.0/${containerId}?fields=status_code&access_token=${IG_TOKEN}`
        );
        const data = await res.json();
        if (data.status_code === 'FINISHED') return;
        if (data.status_code === 'ERROR')
            throw new Error('Meta rechazó una imagen. Verificá que sea JPEG/PNG < 8 MB.');
    }
    throw new Error('La imagen tardó demasiado en procesarse en Meta.');
}

async function createItemContainer(imageUrl) {
    const res = await fetch(`https://graph.instagram.com/v21.0/${IG_BIZ_ID}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image_url:        imageUrl,
            is_carousel_item: true,
            access_token:     IG_TOKEN,
        }),
    });
    if (!res.ok) throw new Error(`Meta item container error: ${await res.text()}`);
    const { id } = await res.json();
    await waitForContainer(id);
    return id;
}

async function publishContainer(containerId) {
    const res = await fetch(`https://graph.instagram.com/v21.0/${IG_BIZ_ID}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: containerId, access_token: IG_TOKEN }),
    });
    if (!res.ok) throw new Error(`Meta publish error: ${await res.text()}`);
    return (await res.json()).id;
}

async function getPermalink(mediaId) {
    const res  = await fetch(
        `https://graph.instagram.com/v21.0/${mediaId}?fields=permalink&access_token=${IG_TOKEN}`
    );
    const data = await res.json();
    return data.permalink || `https://www.instagram.com/p/${mediaId}/`;
}

// ─── Servicio público ──────────────────────────────────────────
export const instagramService = {

    maxImages: IG_MAX_IMAGES,

    buildPublicUrl(filename) {
        return `${SITE_URL}/uploads/instagram/${filename}`;
    },

    async generateCaption(description) {
        if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY no configurada en el backend');

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type':  'application/json',
            },
            body: JSON.stringify({
                model:    GROQ_MODEL,
                messages: [
                    { role: 'system', content: SOCIAL_PROMPT },
                    { role: 'user',   content: description },
                ],
                temperature: 0.8,
                max_tokens:  1024,
            }),
        });
        if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
        return (await res.json()).choices[0].message.content.trim();
    },

    /** Publica una sola imagen respetando su ratio natural (ajusta solo si está fuera de rango). */
    async publishPhoto(filePath, caption) {
        if (!IG_TOKEN || !IG_BIZ_ID)
            throw new Error('INSTAGRAM_ACCESS_TOKEN o INSTAGRAM_BUSINESS_ID no configurados');

        await normalizeSingle(filePath);
        const imageUrl = this.buildPublicUrl(path.basename(filePath));

        const res = await fetch(`https://graph.instagram.com/v21.0/${IG_BIZ_ID}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_url: imageUrl, caption, access_token: IG_TOKEN }),
        });
        if (!res.ok) throw new Error(`Meta container error: ${await res.text()}`);
        const { id: containerId } = await res.json();
        await waitForContainer(containerId);
        const mediaId = await publishContainer(containerId);
        return getPermalink(mediaId);
    },

    /** Publica un carousel con 2-10 imágenes. */
    async publishCarousel(filePaths, caption) {
        if (!IG_TOKEN || !IG_BIZ_ID)
            throw new Error('INSTAGRAM_ACCESS_TOKEN o INSTAGRAM_BUSINESS_ID no configurados');
        if (filePaths.length < 2 || filePaths.length > IG_MAX_IMAGES)
            throw new Error(`El carousel necesita entre 2 y ${IG_MAX_IMAGES} imágenes.`);

        // IG exige que TODAS las imágenes del carousel tengan el mismo ratio.
        // Tomamos el de la primera foto (acotado al rango válido) y encuadramos
        // las demás a ese ratio con letterbox (sin recortar contenido).
        const firstRatio  = await getRatio(filePaths[0]);
        const targetRatio = clamp(firstRatio, IG_RATIO_MIN, IG_RATIO_MAX);

        const imageUrls = await Promise.all(
            filePaths.map(async (fp) => {
                await fitToRatio(fp, targetRatio);
                return this.buildPublicUrl(path.basename(fp));
            })
        );

        // Paso 1 — crear container por cada imagen (en paralelo)
        const childIds = await Promise.all(imageUrls.map(url => createItemContainer(url)));

        // Paso 2 — crear container del carousel con el caption
        const carouselRes = await fetch(`https://graph.instagram.com/v21.0/${IG_BIZ_ID}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                media_type:   'CAROUSEL',
                children:     childIds.join(','),
                caption,
                access_token: IG_TOKEN,
            }),
        });
        if (!carouselRes.ok)
            throw new Error(`Meta carousel container error: ${await carouselRes.text()}`);
        const { id: carouselId } = await carouselRes.json();

        // Paso 3 — esperar a que el container del carousel esté listo
        await waitForContainer(carouselId);

        // Paso 4 — publicar
        const mediaId = await publishContainer(carouselId);
        return getPermalink(mediaId);
    },
};
