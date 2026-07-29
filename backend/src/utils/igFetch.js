/**
 * fetch con reintentos y backoff exponencial para la Graph API de Meta.
 *
 * Meta devuelve 429 (rate limit) y a veces 500/503 transitorios. En vez de
 * fallar a la primera, reintentamos con espera creciente (1s, 2s, 4s, 8s…),
 * respetando el header `Retry-After` cuando viene.
 *
 * Mantiene la firma de fetch nativo: igFetch(url, options) -> Response.
 */

const sleep = ms => new Promise(r => setTimeout(r, ms));

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export async function igFetch(url, options = {}, { maxRetries = 4, baseDelayMs = 1000 } = {}) {
    let lastErr;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch(url, options);

            if (!RETRYABLE_STATUS.has(res.status)) return res; // OK o error no-reintentable

            if (attempt === maxRetries) return res; // se acabaron los intentos: devolvemos la última

            // Respeta Retry-After (segundos) si Meta lo manda; si no, backoff exponencial.
            const retryAfter = Number(res.headers.get('retry-after'));
            const delay = Number.isFinite(retryAfter) && retryAfter > 0
                ? retryAfter * 1000
                : baseDelayMs * Math.pow(2, attempt);

            console.warn(`[igFetch] ${res.status} en ${url.split('?')[0]} — reintento ${attempt + 1}/${maxRetries} en ${delay}ms`);
            await sleep(delay);
        } catch (err) {
            // Error de red (no llegó respuesta) → también reintentamos
            lastErr = err;
            if (attempt === maxRetries) throw err;
            const delay = baseDelayMs * Math.pow(2, attempt);
            console.warn(`[igFetch] red caída (${err.message}) — reintento ${attempt + 1}/${maxRetries} en ${delay}ms`);
            await sleep(delay);
        }
    }
    throw lastErr || new Error('igFetch: agotó reintentos');
}
