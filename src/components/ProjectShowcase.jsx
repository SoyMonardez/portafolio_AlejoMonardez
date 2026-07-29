import React from 'react';
import { motion as Motion } from 'framer-motion';
import ProjectImageGallery from './ProjectImageGallery';
import { resolveSkill } from '../data/skills';
import { localizeProject } from '../data/useProjects';

/**
 * "Showcase" = una sección completa para un único proyecto.
 * Reemplaza al carrusel-de-proyectos. Ahora cada proyecto tiene SU PROPIO carrusel
 * de imágenes adentro, y se apilan verticalmente alternando lado izquierdo/derecho.
 *
 * @param {object}  project   { title, description, category, badge, demo_url, tech, images }
 * @param {number}  index     posición (para numerar y alternar layout par/impar)
 * @param {string}  lang      'es' | 'en'
 */
export default function ProjectShowcase({ project: rawProject, index, lang = 'es' }) {
    const project = localizeProject(rawProject, lang);
    const [expanded, setExpanded] = React.useState(false);
    const [showCreds, setShowCreds] = React.useState(false);
    const [copied, setCopied] = React.useState(null);
    const isOdd = index % 2 === 1;
    const techT = lang === 'es' ? 'STACK' : 'STACK';
    const status = project.status || 'production';
    const ctaLabel = {
        production: lang === 'es' ? 'Ver Proyecto' : 'View Project',
        demo:       lang === 'es' ? 'Ver Demo'     : 'View Demo',
        wip:        lang === 'es' ? 'En Desarrollo': 'In Development',
    }[status] ?? (lang === 'es' ? 'Ver Proyecto' : 'View Project');

    const credentials = Array.isArray(project.credentials) ? project.credentials.filter(c => c.user || c.password) : [];
    const hasCredentials = credentials.length > 0;

    const credT = lang === 'es'
        ? { title: 'Credenciales de demo', hint: 'Tocá para copiar', user: 'Usuario', pass: 'Contraseña', copy: 'Copiar', copied: '¡Copiado!' }
        : { title: 'Demo credentials',     hint: 'Tap to copy',    user: 'User',    pass: 'Password',   copy: 'Copy',   copied: 'Copied!' };

    const copyToClipboard = (value, key) => {
        if (!value) return;
        navigator.clipboard?.writeText(value).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 1500);
        });
    };

    return (
        <section className="relative border-t border-white/10 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center px-6 sm:px-12">

                {/* Galería de imágenes (lado alternado) */}
                <Motion.div
                    initial={{ opacity: 0, x: isOdd ? 60 : -60 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
                    className={`md:col-span-7 ${isOdd ? 'md:order-2' : ''}`}
                >
                    <ProjectImageGallery
                        images={project.images}
                        alt={project.title}
                        cursorText={lang === 'es' ? 'AMPLIAR' : 'ZOOM'}
                        interval={4500}
                    />
                </Motion.div>

                {/* Info */}
                <Motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className={`md:col-span-5 ${isOdd ? 'md:order-1' : ''} mix-blend-difference text-white`}
                >
                    <span className="text-xs uppercase tracking-[0.3em] opacity-50 block mb-4">
                        {String(index + 1).padStart(2, '0')} — {project.category}
                    </span>
                    <h3 className="text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl font-serif leading-[0.95] mb-6 break-words">
                        {project.title}
                    </h3>
                    {/* Badges: badge del proyecto + estado */}
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        {project.badge && (
                            <span className="text-[10px] uppercase tracking-[0.25em] border border-white/20 rounded-full px-3 py-1 text-white/60">
                                {project.badge}
                            </span>
                        )}
                        {(() => {
                            const st = project.status || 'production';
                            const map = {
                                production: { dot: 'bg-green-400', label: lang === 'es' ? 'Producción' : 'Production', cls: 'border-green-400/30 text-green-300/80' },
                                demo:       { dot: 'bg-amber-400', label: 'Demo',                                       cls: 'border-amber-400/30 text-amber-300/80' },
                                wip:        { dot: 'bg-blue-400',  label: lang === 'es' ? 'En desarrollo' : 'In dev',   cls: 'border-blue-400/30  text-blue-300/80'  },
                            };
                            const s = map[st] || map.production;
                            return (
                                <span className={`flex items-center gap-1.5 text-[9px] uppercase tracking-[0.25em] border rounded-full px-3 py-1 ${s.cls}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${s.dot} animate-pulse`} />
                                    {s.label}
                                </span>
                            );
                        })()}
                    </div>
                    {project.situation ? (
                        <div className="space-y-6 mb-8 text-left max-w-xl font-sans">
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 border-b border-white/5 pb-3">
                                <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold block sm:col-span-1 pt-0.5">
                                    {lang === 'es' ? 'SITUACIÓN' : 'SITUATION'}
                                </span>
                                <p className="text-sm text-white/70 leading-relaxed sm:col-span-3">
                                    {project.situation}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 border-b border-white/5 pb-3">
                                <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold block sm:col-span-1 pt-0.5">
                                    {lang === 'es' ? 'TAREA' : 'TASK'}
                                </span>
                                <p className="text-sm text-white/70 leading-relaxed sm:col-span-3">
                                    {project.task}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 border-b border-white/5 pb-3">
                                <span className="text-[9px] uppercase tracking-[0.25em] text-white/40 font-bold block sm:col-span-1 pt-0.5">
                                    {lang === 'es' ? 'ACCIÓN' : 'ACTION'}
                                </span>
                                <p className="text-sm text-white/70 leading-relaxed sm:col-span-3">
                                    {project.action}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-1 bg-white/5 p-4 rounded border-l-2 border-white/80">
                                <span className="text-[9px] uppercase tracking-[0.25em] text-white/90 font-extrabold block sm:col-span-1">
                                    {lang === 'es' ? 'MÉTRICA' : 'METRIC'}
                                </span>
                                <p className="text-sm text-white font-bold leading-relaxed sm:col-span-3">
                                    {project.result}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="font-sans leading-relaxed mb-6 max-w-md space-y-4">
                            <p className="text-sm md:text-base text-white/90 leading-relaxed">
                                {project.description_short || project.description}
                            </p>
                            
                            {(project.description_short && project.description && project.description !== project.description_short) && (
                                <div className="space-y-3 pt-2">
                                    {expanded && (
                                        <Motion.p 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ duration: 0.3 }}
                                            className="text-xs md:text-sm text-white/60 leading-relaxed border-t border-white/10 pt-2"
                                        >
                                            {project.description}
                                        </Motion.p>
                                    )}
                                    <button
                                        onClick={() => setExpanded(!expanded)}
                                        className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                                    >
                                        <span>{expanded ? '—' : '+'}</span>
                                        <span>{expanded 
                                            ? (lang === 'es' ? 'Leer menos' : 'Read less')
                                            : (lang === 'es' ? 'Leer más' : 'Read more')}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tech stack */}
                    {project.tech && project.tech.length > 0 && (
                        <div className="mb-8">
                            <p className="text-[9px] uppercase tracking-[0.3em] text-white/30 mb-3">{techT}</p>
                            <div className="flex flex-wrap gap-2 max-w-md">
                                {project.tech.map((techKey, i) => {
                                    const s = resolveSkill(techKey);
                                    if (!s) return null;
                                    return (
                                        <span
                                            key={i}
                                            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.15em] border border-white/20 rounded-full px-3 py-1 opacity-70 hover:opacity-100 hover:border-white transition-all duration-300"
                                        >
                                            {s.icon && <span className="text-sm">{s.icon}</span>}
                                            {s.name}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Credenciales de demo */}
                    {hasCredentials && (
                        <div className="mb-6 max-w-md">
                            <button
                                type="button"
                                onClick={() => setShowCreds(s => !s)}
                                className="w-full flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.25em] text-amber-300/90 border border-amber-300/30 bg-amber-300/5 px-4 py-2.5 rounded-full hover:bg-amber-300/15 transition-colors"
                            >
                                <span className="flex items-center gap-2">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    {credT.title} ({credentials.length})
                                </span>
                                <span>{showCreds ? '−' : '+'}</span>
                            </button>

                            {showCreds && (
                                <div className="mt-3 space-y-3">
                                    <p className="text-[10px] text-white/40 italic">{credT.hint}</p>
                                    {credentials.map((cred, i) => (
                                        <div key={i} className="border border-amber-300/20 bg-amber-300/[0.03] p-3 rounded-lg space-y-2">
                                            {cred.label && (
                                                <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/80 font-bold">{cred.label}</p>
                                            )}
                                            {cred.user && (
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(cred.user, `${i}-u`)}
                                                    className="w-full flex items-center justify-between gap-3 text-left text-xs bg-black/30 px-3 py-2 rounded border border-white/10 hover:border-amber-300/50 transition-colors group/cred"
                                                >
                                                    <span className="text-white/40 text-[9px] uppercase tracking-widest shrink-0">{credT.user}</span>
                                                    <span className="font-mono text-white flex-1 truncate text-right">{cred.user}</span>
                                                    <span className="text-[9px] uppercase tracking-widest text-amber-300/70 group-hover/cred:text-amber-300 shrink-0">
                                                        {copied === `${i}-u` ? `✓ ${credT.copied}` : credT.copy}
                                                    </span>
                                                </button>
                                            )}
                                            {cred.password && (
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(cred.password, `${i}-p`)}
                                                    className="w-full flex items-center justify-between gap-3 text-left text-xs bg-black/30 px-3 py-2 rounded border border-white/10 hover:border-amber-300/50 transition-colors group/cred"
                                                >
                                                    <span className="text-white/40 text-[9px] uppercase tracking-widest shrink-0">{credT.pass}</span>
                                                    <span className="font-mono text-white flex-1 truncate text-right">{cred.password}</span>
                                                    <span className="text-[9px] uppercase tracking-widest text-amber-300/70 group-hover/cred:text-amber-300 shrink-0">
                                                        {copied === `${i}-p` ? `✓ ${credT.copied}` : credT.copy}
                                                    </span>
                                                </button>
                                            )}
                                            {cred.note && (
                                                <p className="text-[10px] text-white/50 italic px-1">{cred.note}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3">
                        {project.demo_url && (
                            <a
                                href={project.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] border border-white/40 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-300"
                            >
                                <span>{ctaLabel}</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            </a>
                        )}
                        {project.github_url && (
                            <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Ver código en GitHub"
                                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] border border-white/20 px-5 py-3 rounded-full text-white/70 hover:border-white hover:text-white transition-all duration-300"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                                </svg>
                                GitHub
                            </a>
                        )}
                    </div>
                </Motion.div>
            </div>
        </section>
    );
}
