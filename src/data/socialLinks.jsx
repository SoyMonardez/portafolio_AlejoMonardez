import React from 'react';
import {
    SiGithub, SiWhatsapp, SiGmail, SiLinkedin, SiInstagram
} from 'react-icons/si';

/**
 * Catálogo de redes sociales soportadas.
 * Si querés agregar una nueva, sumá una entrada acá — automáticamente aparece
 * en el admin para editar y en el frontend para mostrar.
 *
 * `type` controla cómo se construye el href si el usuario no pega una URL completa:
 *   - 'url'      → se usa tal cual (https://...)
 *   - 'whatsapp' → si son sólo números, prefija con https://wa.me/
 *   - 'email'    → si no tiene mailto:, se prefija
 *   - 'phone'    → si no tiene tel:, se prefija
 */
export const SOCIAL_LINKS = [
    {
        key: 'social_github',
        label: 'GitHub',
        icon: <SiGithub />,
        type: 'url',
        placeholder: 'https://github.com/tu-usuario'
    },
    {
        key: 'social_whatsapp',
        label: 'WhatsApp',
        icon: <SiWhatsapp />,
        type: 'whatsapp',
        placeholder: '2646296764  ó  https://wa.me/2646296764'
    },
    {
        key: 'social_email',
        label: 'Email',
        icon: <SiGmail />,
        type: 'email',
        placeholder: 'tu@correo.com'
    },
    {
        key: 'social_linkedin',
        label: 'LinkedIn',
        icon: <SiLinkedin />,
        type: 'url',
        placeholder: 'https://linkedin.com/in/tu-perfil'
    },
    {
        key: 'social_instagram',
        label: 'Instagram',
        icon: <SiInstagram />,
        type: 'url',
        placeholder: 'https://instagram.com/tu-cuenta'
    },
];

/**
 * Mensajes pre-cargados para los botones de redes sociales.
 * El visitante no tiene que pensar qué escribir — el botón abre el chat/mail
 * con texto listo, en el idioma activo del sitio.
 *
 * NOTA TÉCNICA: solo WhatsApp y Email permiten pre-llenar texto vía URL.
 *   - LinkedIn: no acepta mensaje en la URL (limitación de su sistema).
 *   - Instagram: no tiene DM por URL pública.
 *   - GitHub: es perfil, no chat — abre el perfil directo.
 *
 * Para cambiar el texto, editá las strings de acá.
 */
export const SOCIAL_PRESETS = {
    whatsapp: {
        es: '¡Hola Alejo! Vi tu portfolio en alejomonardez.com y me gustaría hablar sobre un proyecto.',
        en: 'Hi Alejo! I saw your portfolio at alejomonardez.com and would like to talk about a project.',
    },
    email: {
        es: {
            subject: 'Consulta desde alejomonardez.com',
            body:
`Hola Alejo,

Vi tu portfolio y me gustaría hablar sobre un proyecto. Te cuento un poco:

- Tipo de proyecto:
- Plazo aproximado:
- Presupuesto estimado:

Saludos!`,
        },
        en: {
            subject: 'Inquiry from alejomonardez.com',
            body:
`Hi Alejo,

I came across your portfolio and would love to discuss a project. A quick brief:

- Project type:
- Approximate timeline:
- Estimated budget:

Best regards!`,
        },
    },
};

// Alias retrocompatible — algunos archivos antiguos pueden seguir importando esto.
export const WHATSAPP_PRESET = SOCIAL_PRESETS.whatsapp;

/**
 * Convierte el valor que entró el admin en un href válido según el `type`.
 * Devuelve null si el valor está vacío.
 *
 * @param {string} type  – 'url' | 'whatsapp' | 'email' | 'phone'
 * @param {string} value – lo que se guardó en settings
 * @param {object} opts  – { lang: 'es' | 'en' } para WhatsApp preset
 */
export function resolveSocialHref(type, value, opts = {}) {
    if (!value) return null;
    const v = String(value).trim();
    if (!v) return null;

    const lang = opts.lang === 'en' ? 'en' : 'es';

    switch (type) {
        case 'whatsapp': {
            // Detectamos el número aún si vino como URL completa de wa.me
            const digits = v.replace(/\D/g, '');
            if (!digits) return null;
            const text = encodeURIComponent(SOCIAL_PRESETS.whatsapp[lang]);
            return `https://wa.me/${digits}?text=${text}`;
        }
        case 'email': {
            const addr = v.replace(/^mailto:/, '');
            const preset = SOCIAL_PRESETS.email[lang];
            const qs = new URLSearchParams({
                subject: preset.subject,
                body:    preset.body,
            }).toString();
            return `mailto:${addr}?${qs}`;
        }
        case 'phone':
            if (/^tel:/.test(v)) return v;
            return `tel:${v.replace(/\s/g, '')}`;
        case 'url':
        default:
            if (/^https?:/.test(v)) return v;
            return v.startsWith('//') ? `https:${v}` : `https://${v}`;
    }
}

// Mapa rápido por key
export const SOCIAL_BY_KEY = SOCIAL_LINKS.reduce((acc, s) => {
    acc[s.key] = s;
    return acc;
}, {});
