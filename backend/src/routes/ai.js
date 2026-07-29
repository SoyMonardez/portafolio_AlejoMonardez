import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/asyncHandler.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

/**
 * Proxy autenticado al microservicio de IA.
 *
 * El ai-service no se expone público: solo el backend lo llama, sobre la red
 * interna de Docker, agregando el AI_SHARED_TOKEN (que vive solo server-side).
 * El acceso desde el panel admin pasa por acá con el JWT de admin (requireAuth),
 * así nadie de afuera puede gastar la API key de Groq.
 */
const router = Router();

const AI_BASE = env.aiService.url.replace(/\/$/, '');

// Solo proxeamos endpoints conocidos del ai-service.
const ALLOWED = new Set(['assist', 'suggest-title', 'suggest-tech', 'resume-assist']);

async function forward(endpoint, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (env.aiService.token) headers['Authorization'] = `Bearer ${env.aiService.token}`;

    let res;
    try {
        res = await fetch(`${AI_BASE}/${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body ?? {}),
        });
    } catch (err) {
        throw new HttpError(502, 'No se pudo contactar al servicio de IA', err.message);
    }

    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : {}; }
    catch { throw new HttpError(502, 'Respuesta inválida del servicio de IA'); }

    return { status: res.status, data };
}

router.post('/:endpoint', requireAuth, asyncHandler(async (req, res) => {
    const endpoint = req.params.endpoint;
    if (!ALLOWED.has(endpoint)) return res.status(404).json({ error: 'Endpoint de IA desconocido' });

    const { status, data } = await forward(endpoint, req.body || {});
    res.status(status).json(data);
}));

export default router;

