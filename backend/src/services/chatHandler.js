/**
 * ChatHandler — motor de IA del chatbot de Instagram.
 *
 * Desacoplado a propósito de la API de Instagram (no sabe nada de tokens, psid
 * ni endpoints de Meta). Solo recibe texto del cliente + un poco de historial y
 * devuelve { intent, reply, handoff }. Quien lo llama (el webhook) se encarga de
 * persistir y de mandar la respuesta por el canal que sea.
 *
 * Intenciones:
 *   GREETING | INFO | PRICING | SUPPORT | URGENT | COMPLEX | SPAM | OTHER
 * Las dos que disparan handoff a humano: URGENT y COMPLEX.
 */

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL   = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

const HANDOFF_INTENTS = new Set(['URGENT', 'COMPLEX']);
const VALID_INTENTS = ['GREETING', 'INFO', 'PRICING', 'SUPPORT', 'URGENT', 'COMPLEX', 'SPAM', 'OTHER'];

const SYSTEM_PROMPT = `Sos el asistente virtual de Alejo Monardez, desarrollador de software freelance (San Juan, Argentina).
Respondés mensajes directos de Instagram de posibles clientes.

TU TAREA tiene dos partes y SIEMPRE devolvés un JSON válido, sin texto extra:
{"intent":"<INTENT>","reply":"<respuesta al cliente>"}

INTENT debe ser EXACTAMENTE uno de:
- GREETING: saludo o presentación sin pregunta concreta.
- INFO: pregunta general sobre qué hace, servicios, tecnologías, portfolio.
- PRICING: pregunta por precios, presupuesto o cotización.
- SUPPORT: consulta de soporte sobre un proyecto ya existente.
- URGENT: algo urgente, molesto, una queja fuerte o pedido que requiere atención inmediata.
- COMPLEX: requerimiento técnico detallado o negociación que conviene que maneje Alejo en persona.
- SPAM: promoción, bot, mensaje irrelevante o sospechoso.
- OTHER: no encaja en lo anterior.

REGLAS para "reply":
- Español argentino, tono cercano y profesional. Breve (máx 3 frases, sin relleno).
- Si es PRICING: explicá que cada proyecto se cotiza según alcance y ofrecé tomar los detalles.
- Si es URGENT o COMPLEX: decí que le pasás el mensaje directamente a Alejo y que te responde a la brevedad. NO inventes datos ni te comprometas con plazos.
- Si es SPAM: respuesta vacía ("reply":"").
- Nunca inventes precios cerrados, fechas ni promesas que no puedas cumplir.
- No reveles que sos una IA salvo que te lo pregunten directamente.`;

/** Extrae el primer objeto JSON de un texto (por si el modelo agrega ruido). */
function extractJson(text) {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1 || end < start) return null;
    try { return JSON.parse(text.slice(start, end + 1)); }
    catch { return null; }
}

export const chatHandler = {
    handoffIntents: HANDOFF_INTENTS,

    /**
     * Procesa un mensaje entrante.
     * @param {string} text       texto del cliente
     * @param {Array}  history    [{ sender, text }] mensajes previos (opcional, para contexto)
     * @returns {{ intent, reply, handoff }}
     */
    async process(text, history = []) {
        if (!GROQ_API_KEY) {
            // Sin IA configurada: no clasificamos, derivamos a humano por las dudas.
            return { intent: 'COMPLEX', reply: '', handoff: true, degraded: true };
        }

        // Armamos el contexto: system + historial reciente + mensaje actual.
        const messages = [{ role: 'system', content: SYSTEM_PROMPT }];
        for (const h of history.slice(-6)) {
            messages.push({
                role: h.sender === 'customer' ? 'user' : 'assistant',
                content: h.text || '',
            });
        }
        messages.push({ role: 'user', content: text });

        let data;
        try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type':  'application/json',
                },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    messages,
                    temperature: 0.5,
                    max_tokens: 400,
                    response_format: { type: 'json_object' },
                }),
            });
            if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
            const json = await res.json();
            data = extractJson(json.choices?.[0]?.message?.content || '');
        } catch (err) {
            console.error('[chatHandler] fallo IA:', err.message);
            // Ante error de IA, derivamos a humano (nunca dejamos al cliente sin red).
            return { intent: 'COMPLEX', reply: '', handoff: true, degraded: true };
        }

        if (!data || !data.intent) {
            return { intent: 'OTHER', reply: data?.reply || '', handoff: false };
        }

        const intent = VALID_INTENTS.includes(data.intent) ? data.intent : 'OTHER';
        return {
            intent,
            reply: typeof data.reply === 'string' ? data.reply.trim() : '',
            handoff: HANDOFF_INTENTS.has(intent),
        };
    },
};
