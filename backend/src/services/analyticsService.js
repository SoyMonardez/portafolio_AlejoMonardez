import crypto from 'node:crypto';
import { analyticsRepo } from '../repositories/analyticsRepo.js';
import { env } from '../config/env.js';

// Bots comunes: no queremos contarlos como visitas humanas.
const BOT_RE = /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|quora|pinterest|headless|lighthouse|monitor|curl|wget|python-requests|axios|node-fetch|go-http/i;

/** Detecta el tipo de dispositivo a partir del User-Agent. */
function detectDevice(ua = '') {
    if (/mobile|iphone|android.*mobile|windows phone/i.test(ua)) return 'mobile';
    if (/ipad|tablet|android(?!.*mobile)/i.test(ua)) return 'tablet';
    return 'desktop';
}

/** Agrupa el referrer por fuente conocida. Devuelve { host, group }. */
function classifyReferrer(referrer, ownHost) {
    if (!referrer) return { host: '', group: 'directo' };
    let host = '';
    try { host = new URL(referrer).hostname.replace(/^www\./, ''); }
    catch { return { host: '', group: 'directo' }; }

    if (!host || (ownHost && host === ownHost)) return { host, group: 'directo' };

    if (/google\./.test(host))                 return { host, group: 'google' };
    if (/instagram\./.test(host))              return { host, group: 'instagram' };
    if (/linkedin\.|lnkd\./.test(host))        return { host, group: 'linkedin' };
    if (/facebook\.|fb\./.test(host))          return { host, group: 'facebook' };
    if (/(t\.co|twitter\.|x\.com)/.test(host)) return { host, group: 'twitter/x' };
    if (/bing\./.test(host))                   return { host, group: 'bing' };
    if (/duckduckgo\./.test(host))             return { host, group: 'duckduckgo' };
    if (/(whatsapp|wa\.me)/.test(host))        return { host, group: 'whatsapp' };
    if (/(youtube\.|youtu\.be)/.test(host))    return { host, group: 'youtube' };
    if (/github\./.test(host))                 return { host, group: 'github' };
    return { host, group: 'otros' };
}

/**
 * Hash de visitante ANÓNIMO que rota a diario.
 * = sha256(ip + user-agent + fecha + secret) recortado.
 * No se guarda la IP ni el UA: es imposible revertir a una persona, y como
 * cambia cada día no permite seguir a alguien entre jornadas.
 */
function anonVisitorHash(ip, ua) {
    const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return crypto
        .createHash('sha256')
        .update(`${ip}|${ua}|${day}|${env.jwt.secret}`)
        .digest('hex')
        .slice(0, 16);
}

/** Normaliza el path: solo el pathname, sin query, acotado. */
function cleanPath(raw) {
    if (typeof raw !== 'string' || !raw) return '/';
    let p = raw.split('?')[0].split('#')[0].trim();
    if (!p.startsWith('/')) p = '/' + p;
    return p.slice(0, 255);
}

export const analyticsService = {
    ensureSchema: () => analyticsRepo.ensureSchema(),

    /**
     * Registra una visita. Devuelve false si se descartó (bot).
     * @param {object} p { path, referrer, ip, userAgent, ownHost }
     */
    async track({ path, referrer, ip, userAgent, ownHost }) {
        if (BOT_RE.test(userAgent || '')) return false;

        const { host, group } = classifyReferrer(referrer, ownHost);
        await analyticsRepo.insert({
            path:          cleanPath(path),
            referrerHost:  host.slice(0, 255),
            referrerGroup: group,
            device:        detectDevice(userAgent),
            visitorHash:   anonVisitorHash(ip || '', userAgent || ''),
        });
        return true;
    },

    /** Resumen completo para el panel de admin. */
    async summary(days = 30) {
        const d = Math.min(Math.max(Number(days) || 30, 1), 365);
        const [totals, byDay, topPaths, referrers, devices] = await Promise.all([
            analyticsRepo.totals(d),
            analyticsRepo.byDay(d),
            analyticsRepo.topPaths(d),
            analyticsRepo.byGroup('referrer_group', d),
            analyticsRepo.byGroup('device', d),
        ]);
        return { days: d, totals, byDay, topPaths, referrers, devices };
    },
};
