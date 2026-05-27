import React from 'react';
import { motion } from 'framer-motion';
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
    const isOdd = index % 2 === 1;
    const ctaLabel = lang === 'es' ? 'Ver Demo' : 'View Demo';
    const techT    = lang === 'es' ? 'STACK' : 'STACK';

    return (
        <section className="relative border-t border-white/10 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center px-6 sm:px-12">

                {/* Galería de imágenes (lado alternado) */}
                <motion.div
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
                </motion.div>

                {/* Info */}
                <motion.div
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
                    {project.badge && (
                        <span className="inline-block text-[10px] uppercase tracking-[0.25em] border border-white/20 rounded-full px-3 py-1 mb-6 text-white/60">
                            {project.badge}
                        </span>
                    )}
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
                                        <motion.p 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            transition={{ duration: 0.3 }}
                                            className="text-xs md:text-sm text-white/60 leading-relaxed border-t border-white/10 pt-2"
                                        >
                                            {project.description}
                                        </motion.p>
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
                </motion.div>
            </div>
        </section>
    );
}
