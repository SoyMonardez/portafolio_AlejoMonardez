import { settingsRepo } from '../repositories/settingsRepo.js';
import { obfuscateEmail, isSensitiveKey } from '../utils/obfuscate.js';
import { badRequest } from '../utils/httpError.js';

export const settingsService = {
    /**
     * Devuelve TODAS las settings con emails ofuscados.
     * El frontend público recibe esto. Bots scrapers no encuentran emails en plano.
     */
    async getPublic() {
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
        return settingsRepo.upsertMany(normalized);
    },

    async delete(key) {
        if (!key) throw badRequest('Falta key');
        return settingsRepo.delete(key);
    },
};
