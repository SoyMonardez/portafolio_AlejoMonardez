import { Router } from 'express';
import express from 'express';
import { requireAuth }      from '../middlewares/auth.js';
import { asyncHandler }     from '../middlewares/asyncHandler.js';
import {
    igUploader, igVideoUploader, instagramService,
} from '../services/instagramService.js';
import { instagramChatService } from '../services/instagramChatService.js';
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

/**
 * POST /instagram/publish-reel  (requiere auth)
 * Body: multipart/form-data
 *   file        — un video .mp4 o .mov vertical 9:16, 3-90s
 *   description — texto breve; Groq genera el caption
 *
 * Responde: { success, caption, permalink, type: 'reel' }
 */
router.post(
    '/publish-reel',
    requireAuth,
    igVideoUploader.single('file'),
    asyncHandler(async (req, res) => {
        if (!req.file) throw badRequest('No se recibió ningún video');

        const desc = req.body?.description?.trim();
        if (!desc)  throw badRequest('Falta la descripción del reel');

        // Validar ANTES de gastar el round-trip a Meta.
        const { ok, errors } = await instagramService.validateReel(req.file.path);
        if (!ok) throw badRequest('El video no cumple los requisitos de Reels: ' + errors.join(' '));

        const caption   = await instagramService.generateCaption(desc);
        const permalink = await instagramService.publishReel(req.file.path, caption);

        res.json({ success: true, caption, permalink, type: 'reel' });
    })
);

// ───────────────────────────────────────────────────────────────
// WEBHOOK del chatbot (público — Meta lo llama)
// ───────────────────────────────────────────────────────────────

/**
 * GET /instagram/webhook — handshake de verificación de Meta.
 * Meta manda hub.mode / hub.verify_token / hub.challenge.
 */
router.get('/webhook', (req, res) => {
    const challenge = instagramService.handleWebhookVerification({
        mode:      req.query['hub.mode'],
        token:     req.query['hub.verify_token'],
        challenge: req.query['hub.challenge'],
    });
    if (challenge) return res.status(200).send(challenge);
    return res.sendStatus(403);
});

/**
 * POST /instagram/webhook — eventos entrantes (mensajes).
 *
 * Usa express.raw para tener el body EXACTO y poder validar la firma
 * X-Hub-Signature-256. Respondemos 200 de inmediato y procesamos en la cola.
 */
router.post(
    '/webhook',
    express.raw({ type: '*/*' }),
    (req, res) => {
        const signature = req.get('x-hub-signature-256');
        const rawBody = req.body; // Buffer (gracias a express.raw)

        if (!instagramService.verifyWebhookSignature(rawBody, signature)) {
            return res.sendStatus(403);
        }

        let payload;
        try {
            payload = JSON.parse(rawBody.toString('utf8'));
        } catch {
            return res.sendStatus(400);
        }

        // Encolar y responder ya — Meta no debe esperar a la IA.
        try {
            instagramChatService.ingestWebhook(payload);
        } catch (err) {
            console.error('[ig webhook] error encolando:', err.message);
        }
        return res.sendStatus(200);
    }
);

// ───────────────────────────────────────────────────────────────
// BANDEJA del admin (requiere auth)
// ───────────────────────────────────────────────────────────────

/** Lista de chats (opcional ?status=pending_human). */
router.get('/chats', requireAuth, asyncHandler(async (req, res) => {
    const chats = await instagramChatService.listChats({ status: req.query.status || null });
    res.json({ success: true, chats });
}));

/** Historial de un chat. */
router.get('/chats/:id/messages', requireAuth, asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const chat = await instagramChatService.findChat(id);
    if (!chat) throw badRequest('Chat no encontrado');
    const messages = await instagramChatService.listMessages(id);
    res.json({ success: true, chat, messages });
}));

/** El admin responde manualmente. */
router.post('/chats/:id/reply', requireAuth, asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const text = req.body?.text?.trim();
    if (!text) throw badRequest('Falta el texto de la respuesta');
    await instagramChatService.replyAsHuman(id, text);
    res.json({ success: true });
}));

/** Encender/apagar el bot en un chat puntual (manual override). */
router.post('/chats/:id/bot', requireAuth, asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const enabled = !!req.body?.enabled;
    await instagramChatService.setBotEnabled(id, enabled);
    res.json({ success: true, bot_enabled: enabled });
}));

export default router;
