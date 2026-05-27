/**
 * Anti-bot scrapers: el email del portfolio no se sirve nunca en texto plano
 * en endpoints públicos. Se ofusca en server-side; el frontend lo decodifica
 * SOLO cuando el usuario hace click en el botón Email (los bots no ejecutan JS).
 *
 * Estrategia: base64 + reversal. Trivial para JS, opaca para regex de scrapers
 * que buscan `[\w.]+@[\w.]+\.\w+` en HTML/JSON.
 */
export function obfuscateEmail(email) {
    if (!email || !email.includes('@')) return '';
    return Buffer.from(String(email).split('').reverse().join(''), 'utf-8').toString('base64');
}

/**
 * Detecta si una key de settings expone un email y debe ofuscarse en /settings GET.
 */
export function isSensitiveKey(key) {
    return /email|mail/i.test(key);
}
