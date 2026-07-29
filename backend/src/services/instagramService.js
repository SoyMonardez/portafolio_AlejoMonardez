import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import multer from 'multer';
import sharp from 'sharp';
import { env } from '../config/env.js';
import { igFetch } from '../utils/igFetch.js';
import { readVideoMeta } from '../utils/videoMeta.js';

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
const ALLOWED_VIDEO_MIME = { 'video/mp4': 'mp4', 'video/quicktime': 'mov' };
const IG_MAX_BYTES   = 8 * 1024 * 1024;        // 8 MB por imagen (límite Instagram)
const IG_VIDEO_MAX_BYTES = 300 * 1024 * 1024;  // 300 MB por video (límite Reels API)
const IG_MAX_IMAGES  = 10;                     // máximo de imágenes por carousel

// Reglas de Reels (Meta): vertical, entre 3s y 15min. Acotamos a 5-90s por UX.
const REEL_RATIO_TARGET = 9 / 16;   // 0.5625
const REEL_RATIO_TOL    = 0.06;     // tolerancia (~0.50–0.62) para no rechazar de más
const REEL_MIN_SEC      = 3;
const REEL_MAX_SEC      = 90;

// Directorio en el volumen compartido → Nginx lo sirve en /uploads/instagram/
const igDirAbs = path.resolve(process.cwd(), env.upload.dir, '..', 'instagram');
await fs.mkdir(igDirAbs, { recursive: true });

// ─── Multer imágenes (carousel/foto, hasta 10) ────────────────
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

// ─── Multer video (un solo Reel) ──────────────────────────────
const igVideoStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, igDirAbs),
    filename: (_req, file, cb) => {
        const ext = ALLOWED_VIDEO_MIME[file.mimetype] || 'mp4';
        const rnd = crypto.randomBytes(8).toString('hex');
        cb(null, `ig_reel_${Date.now()}_${rnd}.${ext}`);
    },
});

export const igVideoUploader = multer({
    storage: igVideoStorage,
    limits: { fileSize: IG_VIDEO_MAX_BYTES },
    fileFilter: (_req, file, cb) => {
        if (!ALLOWED_VIDEO_MIME[file.mimetype]) {
            return cb(new Error('Los Reels solo aceptan video .mp4 o .mov'));
        }
        cb(null, true);
    },
});

// ─── Config ───────────────────────────────────────────────────
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const IG_TOKEN     = process.env.INSTAGRAM_ACCESS_TOKEN;
const IG_BIZ_ID    = process.env.INSTAGRAM_BUSINESS_ID;
const IG_APP_SECRET    = process.env.INSTAGRAM_APP_SECRET || '';
const IG_VERIFY_TOKEN  = process.env.INSTAGRAM_VERIFY_TOKEN || '';
const SITE_URL     = (process.env.SITE_PUBLIC_URL || 'https://alejomonardez.com').replace(/\/$/, '');

const SOCIAL_PROMPT = `Redactás contenido profesional para redes sobre desarrollo de software y productos digitales.
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

/**
 * Espera a que un container esté FINISHED.
 * Los videos/Reels tardan más que las imágenes (Meta los transcodifica), por eso
 * el número de intentos y el intervalo son parametrizables.
 */
async function waitForContainer(containerId, { maxTries = 10, intervalMs = 3000, isVideo = false } = {}) {
    for (let i = 0; i < maxTries; i++) {
        await sleep(intervalMs);
        const res  = await igFetch(
            `https://graph.instagram.com/v21.0/${containerId}?fields=status_code,status&access_token=${IG_TOKEN}`
        );
        const data = await res.json();
        if (data.status_code === 'FINISHED') return;
        if (data.status_code === 'ERROR') {
            const detail = data.status ? ` (${data.status})` : '';
            throw new Error(isVideo
                ? `Meta rechazó el video${detail}. Verificá formato .mp4/.mov, 9:16 y duración 3-90s.`
                : `Meta rechazó una imagen${detail}. Verificá que sea JPEG/PNG < 8 MB.`);
        }
    }
    throw new Error(isVideo
        ? 'El video tardó demasiado en procesarse en Meta. Probá con un archivo más liviano.'
        : 'La imagen tardó demasiado en procesarse en Meta.');
}

async function createItemContainer(imageUrl) {
    const res = await igFetch(`https://graph.instagram.com/v21.0/${IG_BIZ_ID}/media`, {
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
    const res = await igFetch(`https://graph.instagram.com/v21.0/${IG_BIZ_ID}/media_publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creation_id: containerId, access_token: IG_TOKEN }),
    });
    if (!res.ok) throw new Error(`Meta publish error: ${await res.text()}`);
    return (await res.json()).id;
}

async function getPermalink(mediaId) {
    const res  = await igFetch(
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

    /**
     * Valida un archivo de video contra las reglas de Reels ANTES de mandarlo
     * a Meta (evita gastar un round-trip + transcodificación para que lo rechacen).
     * Devuelve { ok, errors[], meta }. Si no se pudo leer la metadata, deja pasar
     * y delega la validación final a Meta (degradación elegante).
     */
    async validateReel(filePath) {
        const errors = [];
        const ext = path.extname(filePath).toLowerCase();
        if (ext !== '.mp4' && ext !== '.mov') {
            errors.push('El formato debe ser .mp4 o .mov.');
        }

        const meta = await readVideoMeta(filePath);

        if (meta.durationSec != null) {
            if (meta.durationSec < REEL_MIN_SEC)
                errors.push(`El video dura ${meta.durationSec.toFixed(1)}s; el mínimo es ${REEL_MIN_SEC}s.`);
            if (meta.durationSec > REEL_MAX_SEC)
                errors.push(`El video dura ${meta.durationSec.toFixed(0)}s; el máximo es ${REEL_MAX_SEC}s.`);
        }

        if (meta.ratio != null) {
            const diff = Math.abs(meta.ratio - REEL_RATIO_TARGET);
            if (diff > REEL_RATIO_TOL) {
                errors.push(
                    `La relación de aspecto es ${meta.width}x${meta.height} (${meta.ratio.toFixed(3)}); ` +
                    `los Reels necesitan formato vertical 9:16 (~0.562).`
                );
            }
        }

        return { ok: errors.length === 0, errors, meta };
    },

    /**
     * Publica un Reel (video vertical 9:16).
     * Flujo Meta: container (media_type=REELS, video_url) → polling de
     * upload_status → media_publish. Devuelve el permalink.
     */
    async publishReel(filePath, caption, { shareToFeed = true } = {}) {
        if (!IG_TOKEN || !IG_BIZ_ID)
            throw new Error('INSTAGRAM_ACCESS_TOKEN o INSTAGRAM_BUSINESS_ID no configurados');

        const videoUrl = this.buildPublicUrl(path.basename(filePath));

        // Paso 1 — crear container del Reel
        const res = await igFetch(`https://graph.instagram.com/v21.0/${IG_BIZ_ID}/media`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                media_type:    'REELS',
                video_url:     videoUrl,
                caption,
                share_to_feed: shareToFeed,
                access_token:  IG_TOKEN,
            }),
        });
        if (!res.ok) throw new Error(`Meta reel container error: ${await res.text()}`);
        const { id: containerId } = await res.json();

        // Paso 2 — polling: los Reels se transcodifican async (más lento que imágenes).
        // Hasta ~2 min (24 intentos × 5s).
        await waitForContainer(containerId, { maxTries: 24, intervalMs: 5000, isVideo: true });

        // Paso 3 — publicar
        const mediaId = await publishContainer(containerId);
        return getPermalink(mediaId);
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

    // ─── Messaging (chatbot) ──────────────────────────────────
    verifyToken: IG_VERIFY_TOKEN,

    /**
     * Verifica la firma X-Hub-Signature-256 de un webhook de Meta.
     * `rawBody` debe ser el Buffer/string EXACTO del body (sin re-serializar),
     * por eso el router captura el raw body antes del parser JSON.
     */
    verifyWebhookSignature(rawBody, signatureHeader) {
        if (!IG_APP_SECRET) {
            console.warn('[ig] INSTAGRAM_APP_SECRET no configurado — no se puede verificar firma');
            return false;
        }
        if (!signatureHeader || !signatureHeader.startsWith('sha256=')) return false;
        const expected = 'sha256=' + crypto
            .createHmac('sha256', IG_APP_SECRET)
            .update(rawBody)
            .digest('hex');
        // Comparación en tiempo constante (evita timing attacks)
        const a = Buffer.from(signatureHeader);
        const b = Buffer.from(expected);
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    },

    /**
     * Maneja el handshake de verificación del webhook (GET con hub.challenge).
     * Devuelve el challenge si el verify_token coincide, o null si no.
     */
    handleWebhookVerification({ mode, token, challenge }) {
        if (mode === 'subscribe' && token && token === IG_VERIFY_TOKEN) {
            return challenge;
        }
        return null;
    },

    /**
     * Envía un mensaje de texto a un usuario por DM (outbound).
     * Usa el endpoint de mensajería de la Graph API con el PSID/IGSID del sender.
     */
    async sendMessage(recipientId, text) {
        if (!IG_TOKEN || !IG_BIZ_ID)
            throw new Error('INSTAGRAM_ACCESS_TOKEN o INSTAGRAM_BUSINESS_ID no configurados');
        if (!text) return null;

        const res = await igFetch(`https://graph.instagram.com/v21.0/${IG_BIZ_ID}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipient: { id: recipientId },
                message:   { text },
                access_token: IG_TOKEN,
            }),
        });
        if (!res.ok) throw new Error(`Meta send message error: ${await res.text()}`);
        return res.json();
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

