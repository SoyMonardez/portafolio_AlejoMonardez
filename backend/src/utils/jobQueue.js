/**
 * Cola de trabajos en background — in-process, sin dependencias (no Redis/BullMQ).
 *
 * Objetivo: que el usuario NO espere por tareas pesadas o lentas (mandar email,
 * reescribir metadatos de un PDF). El handler de la request encola el trabajo y
 * responde al instante; la cola lo procesa en 2do plano, con concurrencia
 * limitada y reintentos con backoff.
 *
 * Limitación consciente: si el proceso se reinicia, los jobs pendientes en
 * memoria se pierden. Para un portafolio es aceptable; si algún día hace falta
 * durabilidad, se reemplaza el storage interno por Redis sin tocar los callers.
 *
 *   jobQueue.register('email', async (payload) => { ... });
 *   jobQueue.enqueue('email', { to, subject });   // no bloquea
 */

class JobQueue {
    constructor({ concurrency = 2, maxRetries = 3, baseRetryDelayMs = 2000 } = {}) {
        this.queue = [];
        this.active = 0;
        this.concurrency = concurrency;
        this.maxRetries = maxRetries;
        this.baseRetryDelayMs = baseRetryDelayMs;
        this.handlers = new Map();
        this.counters = { enqueued: 0, completed: 0, failed: 0, retried: 0 };
        this._seq = 0;
    }

    /** Registra el handler para un tipo de job. */
    register(type, handler) {
        this.handlers.set(type, handler);
        return this;
    }

    /**
     * Encola un job y dispara el procesamiento. Devuelve el id del job.
     * NO es async a propósito: el caller no debe await-earlo.
     */
    enqueue(type, payload = {}, opts = {}) {
        const job = {
            id: `${type}#${++this._seq}`,
            type,
            payload,
            attempts: 0,
            maxRetries: opts.maxRetries ?? this.maxRetries,
        };
        this.queue.push(job);
        this.counters.enqueued++;
        // Arrancar en el próximo tick para no bloquear la respuesta actual
        setImmediate(() => this._drain());
        return job.id;
    }

    _drain() {
        while (this.active < this.concurrency && this.queue.length > 0) {
            const job = this.queue.shift();
            this.active++;
            this._run(job).finally(() => {
                this.active--;
                this._drain();
            });
        }
    }

    async _run(job) {
        const handler = this.handlers.get(job.type);
        if (!handler) {
            this.counters.failed++;
            console.error(`[jobQueue] Sin handler para "${job.type}" (job ${job.id})`);
            return;
        }
        job.attempts++;
        try {
            await handler(job.payload);
            this.counters.completed++;
        } catch (err) {
            if (job.attempts <= job.maxRetries) {
                this.counters.retried++;
                const delay = this.baseRetryDelayMs * job.attempts; // backoff lineal
                console.warn(
                    `[jobQueue] ${job.id} falló (intento ${job.attempts}/${job.maxRetries}): ` +
                    `${err.message}. Reintentando en ${delay}ms`
                );
                setTimeout(() => { this.queue.push(job); this._drain(); }, delay);
            } else {
                this.counters.failed++;
                console.error(`[jobQueue] ${job.id} agotó reintentos: ${err.message}`);
            }
        }
    }

    /** Métricas para debug / health. */
    stats() {
        return {
            ...this.counters,
            pending: this.queue.length,
            active: this.active,
            concurrency: this.concurrency,
        };
    }
}

// Instancia única compartida por toda la app.
export const jobQueue = new JobQueue({ concurrency: 2, maxRetries: 3 });
