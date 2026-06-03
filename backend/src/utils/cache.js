/**
 * Cache TTL en memoria — sin dependencias externas (no Redis).
 *
 * Pensado para esta escala (un solo proceso Node): los datos públicos
 * (projects, settings) cambian poco y se leen mucho. En vez de pegarle a
 * MySQL en cada request, calculamos UNA vez, guardamos el resultado y lo
 * servimos desde memoria hasta que expire el TTL o se invalide por escritura.
 *
 * Uso típico:
 *   const data = await cache.wrap('projects:all', 60_000, () => repo.findAll());
 *   cache.delPrefix('projects:');   // invalidar al crear/editar/borrar
 */

const store = new Map(); // key -> { value, expiresAt }

let hits = 0;
let misses = 0;

export const cache = {
    /** Devuelve el valor cacheado o undefined si no existe / expiró. */
    get(key) {
        const entry = store.get(key);
        if (!entry) { misses++; return undefined; }
        if (entry.expiresAt && entry.expiresAt < Date.now()) {
            store.delete(key);
            misses++;
            return undefined;
        }
        hits++;
        return entry.value;
    },

    /** Guarda un valor con TTL en ms (0 / omitido = sin expiración). */
    set(key, value, ttlMs = 0) {
        store.set(key, {
            value,
            expiresAt: ttlMs > 0 ? Date.now() + ttlMs : 0,
        });
        return value;
    },

    /** Borra una clave puntual. */
    del(key) {
        return store.delete(key);
    },

    /** Borra todas las claves que empiezan con un prefijo (invalidación por grupo). */
    delPrefix(prefix) {
        let n = 0;
        for (const key of store.keys()) {
            if (key.startsWith(prefix)) { store.delete(key); n++; }
        }
        return n;
    },

    /** Vacía todo el cache. */
    clear() {
        store.clear();
    },

    /**
     * Memoización con cache: si la clave existe la devuelve; si no, ejecuta
     * `producer()`, guarda el resultado con TTL y lo devuelve.
     * Protege contra "stampede" simple: si dos requests llegan juntos, ambos
     * calculan, pero el resultado igual se cachea. Para esta escala alcanza.
     */
    async wrap(key, ttlMs, producer) {
        const cached = this.get(key);
        if (cached !== undefined) return cached;
        const value = await producer();
        this.set(key, value, ttlMs);
        return value;
    },

    /** Métricas para debug / endpoint de health. */
    stats() {
        const total = hits + misses;
        return {
            size: store.size,
            hits,
            misses,
            hitRate: total ? +(hits / total).toFixed(3) : 0,
            keys: [...store.keys()],
        };
    },
};
