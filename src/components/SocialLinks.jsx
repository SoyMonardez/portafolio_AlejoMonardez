import React from 'react';
import { useSettings, decodeObfuscatedEmail } from '../data/useSettings';
import { SOCIAL_LINKS, resolveSocialHref } from '../data/socialLinks';
import { useLang } from '../data/useLang';

/**
 * Renderiza los botones de redes sociales SÓLO para las redes que tienen valor.
 * Lee desde useSettings (que pega a /settings).
 *
 * Anti-bot: el email NUNCA aparece como `mailto:foo@bar.com` en el HTML inicial.
 * Solo se decodifica en el click handler — los bots scrapers no ejecutan JS.
 *
 * Props:
 *   - variant: "pill" (default) | "compact"
 *   - extra: nodos JSX extra al final (ej. "Descargar CV")
 *   - className: clases para el contenedor
 */
export default function SocialLinks({ variant = 'pill', extra = null, className = '', tone = 'light' }) {
    const { settings } = useSettings();
    const [lang] = useLang();

    // Estilos según el fondo: 'light' (texto claro sobre tinta) | 'ink' (texto tinta sobre papel)
    const pillCls = tone === 'ink'
        ? 'border-brand-bg/25 hover:bg-brand-bg hover:text-white'
        : 'border-white/20 hover:bg-white hover:text-black';

    // Construye la lista de links visibles. El email tiene tratamiento especial:
    // si solo viene la versión b64, lo marcamos como "lazy" para decodificar al click.
    const visible = SOCIAL_LINKS.flatMap(s => {
        if (s.type === 'email') {
            const plain = settings[s.key];
            const b64   = settings[`${s.key}_b64`];
            if (!plain && !b64) return [];
            return [{
                ...s,
                href: null,        // se construye en el handler
                lazyEmail: b64 || plain,
                plain: !b64,
            }];
        }
        const href = resolveSocialHref(s.type, settings[s.key], { lang });
        return href ? [{ ...s, href }] : [];
    });

    /**
     * Click handler para el botón de email — decodifica y navega.
     * Esto impide que el href aparezca pre-renderizado en el HTML (anti-bot).
     * Usa resolveSocialHref para aplicar el preset de subject/body según idioma.
     */
    const handleEmailClick = (e, link) => {
        e.preventDefault();
        const email = link.plain ? link.lazyEmail : decodeObfuscatedEmail(link.lazyEmail);
        if (!email) return;
        const href = resolveSocialHref('email', email, { lang });
        if (href) window.location.href = href;
    };

    const isEmail = (s) => s.type === 'email';

    if (variant === 'compact') {
        return (
            <div className={`flex flex-wrap gap-3 ${className}`}>
                {visible.map(s => (
                    <a
                        key={s.key}
                        href={isEmail(s) ? '#' : s.href}
                        onClick={isEmail(s) ? (e) => handleEmailClick(e, s) : undefined}
                        target={isEmail(s) ? undefined : '_blank'}
                        rel="noopener noreferrer"
                        title={s.label}
                        aria-label={s.label}
                        className={`w-10 h-10 rounded-full border flex items-center justify-center text-lg transition-all ${pillCls}`}
                    >
                        {s.icon}
                    </a>
                ))}
                {extra}
            </div>
        );
    }

    return (
        <div className={`flex flex-wrap gap-4 md:gap-6 ${className}`}>
            {visible.map(s => (
                <a
                    key={s.key}
                    href={isEmail(s) ? '#' : s.href}
                    onClick={isEmail(s) ? (e) => handleEmailClick(e, s) : undefined}
                    target={isEmail(s) ? undefined : '_blank'}
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-3 px-6 py-3 border rounded-full transition-all duration-300 ${pillCls}`}
                >
                    <span className="text-xl">{s.icon}</span>
                    <span className="uppercase tracking-widest text-xs">{s.label}</span>
                </a>
            ))}
            {extra}
        </div>
    );
}
