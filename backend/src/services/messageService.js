import { messageRepo } from '../repositories/messageRepo.js';
import { mailService } from './mailService.js';
import { badRequest } from '../utils/httpError.js';
import { jobQueue } from '../utils/jobQueue.js';

// Handler de la cola: envía la notificación por email en 2do plano.
// Con reintentos automáticos si el SMTP falla momentáneamente.
jobQueue.register('email:new-message', (payload) => mailService.notifyNewMessage(payload));

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sanitizePhone = (raw) => {
    if (typeof raw !== 'string') return '';
    return raw.replace(/[^0-9+\-\s]/g, '').trim().slice(0, 50);
};
const escapeHtml = (s) => String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export const messageService = {
    async list() {
        return messageRepo.findAll();
    },

    async create(data) {
        // Honeypot — campo invisible que solo bots llenan
        if (data.website || data.honeypot) {
            // Mentimos: devolvemos OK para no avisarle al bot que lo detectamos
            return { id: 0, honeypot: true };
        }

        const name    = (data.name    || '').trim().slice(0, 100);
        const email   = (data.email   || '').trim().slice(0, 100);
        const message = (data.message || '').trim().slice(0, 5000);
        const phone   = sanitizePhone(data.phone);

        if (!name || !email || !message) throw badRequest('Faltan campos: name, email, message');
        if (!EMAIL_RE.test(email))       throw badRequest('Email inválido');
        if (message.length < 5)          throw badRequest('Mensaje muy corto');

        const safe = {
            name:    escapeHtml(name),
            email,
            phone,
            message: escapeHtml(message),
        };

        const id = await messageRepo.create(safe);

        // Notificación por email → a la cola en 2do plano.
        // El usuario recibe la respuesta al instante; el email se manda después
        // (con reintentos). No esperamos al SMTP.
        jobQueue.enqueue('email:new-message', { name, email, phone, message });

        return { id };
    },

    async delete(id) {
        if (!id) throw badRequest('Falta id');
        return messageRepo.delete(id);
    },
};
