import { useEffect } from 'react';

/**
 * Hook de SEO por ruta para SPA (sin dependencias externas).
 *
 * Actualiza dinámicamente el <head> en cada cambio de ruta/idioma:
 *   - document.title
 *   - meta description / keywords
 *   - canonical self-referente (CLAVE: sin esto el SPA canonicaliza todo a "/")
 *   - Open Graph (og:title, og:description, og:url, og:image)
 *   - Twitter Card
 *   - robots (para permitir noindex en rutas privadas)
 *   - <html lang>
 *   - JSON-LD por ruta (opcional)
 *
 * Google ejecuta JS y lee estos cambios, por lo que cada página obtiene
 * su propio canonical y metadatos en lugar de heredar los de index.html.
 *
 * @param {object}  opts
 * @param {string}  opts.title          Título de la pestaña / og:title
 * @param {string}  opts.description    Meta description (120-160 chars ideal)
 * @param {string}  opts.canonical      URL canónica absoluta de ESTA página
 * @param {string} [opts.image]         URL absoluta de la imagen OG
 * @param {string} [opts.keywords]      Keywords separadas por coma
 * @param {boolean}[opts.noindex]       true → noindex,nofollow (rutas privadas)
 * @param {string} [opts.lang]          'es' | 'en' → setea <html lang>
 * @param {object|object[]} [opts.jsonLd]  Schema(s) JSON-LD a inyectar
 */
export function useSeo({
    title,
    description,
    canonical,
    image = 'https://alejomonardez.com/og-image.png',
    keywords,
    noindex = false,
    lang,
    jsonLd,
} = {}) {
    useEffect(() => {
        if (title) document.title = title;

        if (lang) document.documentElement.setAttribute('lang', lang);

        // --- meta name="..." ---
        setMetaName('description', description);
        if (keywords) setMetaName('keywords', keywords);
        setMetaName('robots', noindex
            ? 'noindex, nofollow'
            : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

        // --- Open Graph (property="...") ---
        setMetaProp('og:title', title);
        setMetaProp('og:description', description);
        if (canonical) setMetaProp('og:url', canonical);
        if (image) setMetaProp('og:image', image);

        // --- Twitter ---
        setMetaProp('twitter:title', title);
        setMetaProp('twitter:description', description);
        if (image) setMetaProp('twitter:image', image);

        // --- canonical self-referente ---
        if (canonical) setCanonical(canonical);

        // --- JSON-LD por ruta ---
        let injected = [];
        if (jsonLd) {
            const blocks = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
            injected = blocks.map((obj, i) => injectJsonLd(obj, `route-jsonld-${i}`));
        }

        return () => {
            // Limpiar SOLO el JSON-LD por ruta al desmontar (los meta los pisa la próxima ruta)
            injected.forEach(el => el && el.remove());
        };
    }, [title, description, canonical, image, keywords, noindex, lang, JSON.stringify(jsonLd)]);
}

// ───────────────────── helpers DOM ─────────────────────
function setMetaName(name, content) {
    if (content == null) return;
    let el = document.head.querySelector(`meta[name="${name}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setMetaProp(prop, content) {
    if (content == null) return;
    let el = document.head.querySelector(`meta[property="${prop}"]`);
    if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', prop);
        document.head.appendChild(el);
    }
    el.setAttribute('content', content);
}

function setCanonical(href) {
    let el = document.head.querySelector('link[rel="canonical"]');
    if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
    }
    el.setAttribute('href', href);
}

function injectJsonLd(obj, id) {
    const prev = document.getElementById(id);
    if (prev) prev.remove();
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(obj);
    document.head.appendChild(script);
    return script;
}
