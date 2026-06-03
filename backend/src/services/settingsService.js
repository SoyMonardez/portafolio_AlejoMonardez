import { settingsRepo } from '../repositories/settingsRepo.js';
import { obfuscateEmail, isSensitiveKey } from '../utils/obfuscate.js';
import { badRequest } from '../utils/httpError.js';
import { cache } from '../utils/cache.js';

const SETTINGS_TTL = 10 * 60 * 1000; // 10 min; se invalida en cada update/delete
const CACHE_KEY_PUBLIC = 'settings:public';

export const settingsService = {
    /**
     * Devuelve TODAS las settings con emails ofuscados.
     * El frontend público recibe esto. Bots scrapers no encuentran emails en plano.
     */
    async getPublic() {
        // Se calcula una vez (incluida la ofuscación de emails) y se cachea.
        return cache.wrap(CACHE_KEY_PUBLIC, SETTINGS_TTL, async () => {
            const all = await settingsRepo.findAll();
            const out = {};
            for (const [key, value] of Object.entries(all)) {
                if (isSensitiveKey(key) && value && value.includes('@')) {
                    out[key] = '';                      // El campo "plano" queda vacío
                    out[`${key}_b64`] = obfuscateEmail(value); // Versión ofuscada
                } else {
                    out[key] = value;
                }
            }
            return out;
        });
    },

    /** Versión sin ofuscar — solo para el panel admin autenticado. */
    async getRaw() {
        return settingsRepo.findAll();
    },

    async update(kv) {
        if (!kv || typeof kv !== 'object' || Array.isArray(kv)) {
            throw badRequest('Body vacío o inválido');
        }
        const normalized = kv.settings && typeof kv.settings === 'object' ? kv.settings : kv;
        const res = await settingsRepo.upsertMany(normalized);
        cache.del(CACHE_KEY_PUBLIC); // invalidar settings públicas cacheadas
        return res;
    },

    async delete(key) {
        if (!key) throw badRequest('Falta key');
        const res = await settingsRepo.delete(key);
        cache.del(CACHE_KEY_PUBLIC);
        return res;
    },
};
