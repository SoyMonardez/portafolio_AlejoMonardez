/**
 * Orquestador del chatbot de Instagram.
 *
 * Une las piezas (todas desacopladas entre sí):
 *   instagramService  → API de Meta (enviar DM)
 *   chatHandler       → IA (clasificar intención + redactar)
 *   instagramChatRepo → persistencia (chats + mensajes)
 *   jobQueue          → procesamiento en 2do plano
 *
 * El webhook NO debe tardar: Meta reintenta si no recibe 200 en pocos segundos.
 * Por eso el handler guarda lo mínimo y delega el trabajo pesado (IA + envío) a
 * la cola, respondiendo 200 de inmediato.
 */

import { instagramService } from './instagramService.js';
import { chatHandler } from './chatHandler.js';
import { instagramChatRepo } from '../repositories/instagramChatRepo.js';
import { jobQueue } from '../utils/jobQueue.js';

// Handler de la cola: procesa un mensaje entrante en 2do plano.
jobQueue.register('ig:incoming-message', async ({ igUserId, username, text, mid }) => {
    const chat = await instagramChatRepo.findOrCreateByIgUser(igUserId, username);

    // Guardar el entrante. Si el mid ya existía (reentrega de Meta), cortamos.
    const inboundId = await instagramChatRepo.addMessage({
        chatId: chat.id, direction: 'inbound', sender: 'customer', text, mid,
    });
    if (inboundId === null) return; // duplicado ya procesado

    // Si el admin apagó el bot en este chat, no respondemos automáticamente.
    if (!chat.bot_enabled || chat.status === 'human_handled') {
        await instagramChatRepo.updateStatus(chat.id, { status: 'pending_human' });
        return;
    }

    // IA: clasificar + redactar, con algo de historial para contexto.
    const history = await instagramChatRepo.listMessages(chat.id, 12);
    const { intent, reply, handoff } = await chatHandler.process(text, history);

    await instagramChatRepo.updateStatus(chat.id, {
        status: handoff ? 'pending_human' : 'bot_active',
        lastIntent: intent,
    });

    // SPAM: no respondemos nada.
    if (intent === 'SPAM') return;

    // Si hay respuesta del bot, la mandamos y la registramos.
    if (reply) {
        try {
            await instagramService.sendMessage(igUserId, reply);
            await instagramChatRepo.addMessage({
                chatId: chat.id, direction: 'outbound',
                sender: handoff ? 'bot' : 'bot', text: reply, intent,
            });
        } catch (err) {
            console.error('[igChat] no se pudo responder:', err.message);
            throw err; // la cola reintenta
        }
    }

    // Handoff: dejar marca para el panel (status ya quedó en pending_human arriba).
    if (handoff) {
        console.warn(`[igChat] 🔔 PENDING_HUMAN — chat ${chat.id} (${username || igUserId}) intent=${intent}`);
    }
});

export const instagramChatService = {
    /**
     * Recibe el payload ya verificado del webhook y encola cada mensaje.
     * Devuelve rápido para que el router responda 200 a Meta.
     */
    ingestWebhook(payload) {
        const entries = Array.isArray(payload?.entry) ? payload.entry : [];
        let queued = 0;

        for (const entry of entries) {
            // Formato de Instagram messaging: entry[].messaging[]
            const events = entry.messaging || entry.changes || [];
            for (const ev of events) {
                const msg = ev.message;
                // Ignoramos echoes (mensajes que enviamos nosotros) y eventos sin texto.
                if (!msg || msg.is_echo) continue;
                const text = msg.text;
                const igUserId = ev.sender?.id;
                if (!text || !igUserId) continue;

                jobQueue.enqueue('ig:incoming-message', {
                    igUserId,
                    username: ev.sender?.username || '',
                    text,
                    mid: msg.mid || '',
                });
                queued++;
            }
        }
        return queued;
    },

    // Passthrough al repo para las rutas del admin
    listChats: (opts) => instagramChatRepo.listChats(opts),
    listMessages: (chatId) => instagramChatRepo.listMessages(chatId),
    findChat: (id) => instagramChatRepo.findById(id),
    setBotEnabled: (chatId, enabled) => instagramChatRepo.setBotEnabled(chatId, enabled),

    /** El admin responde manualmente desde el panel. */
    async replyAsHuman(chatId, text) {
        const chat = await instagramChatRepo.findById(chatId);
        if (!chat) throw new Error('Chat no encontrado');
        await instagramService.sendMessage(chat.ig_user_id, text);
        await instagramChatRepo.addMessage({
            chatId, direction: 'outbound', sender: 'human', text,
        });
        await instagramChatRepo.updateStatus(chatId, { status: 'human_handled' });
        return true;
    },
};
