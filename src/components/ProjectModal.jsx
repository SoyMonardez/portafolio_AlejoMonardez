import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import { resolveSkill } from '../data/skills';
import Coverflow from './Coverflow';
import SmartImage from './SmartImage';

const STATUS_LABEL = {
    production: { es: 'Producción', en: 'Production' },
    demo:       { es: 'Demo', en: 'Demo' },
    wip:        { es: 'En desarrollo', en: 'In development' },
};

/**
 * Modal de detalle de proyecto — coverflow de las capturas del proyecto arriba
 * (tarjetas en abanico con foco central, auto-rotación que se pausa al usarlo)
 * + caso de estudio editorial (STAR / stack / CTAs) debajo. Estética papel/tinta.
 */
export default function ProjectModal({ project, lang, onClose }) {
    const cardRef = useRef(null);

    // Lenis escucha wheel/touch en window para su smooth-scroll global.
    // data-lenis-prevent ya lo excluye; cortamos además la propagación acá
    // (listener nativo) para que el scroll interno del modal funcione siempre.
    useEffect(() => {
        const el = cardRef.current;
        if (!el || !project) return;
        const stop = (e) => e.stopPropagation();
        el.addEventListener('wheel', stop, { passive: true });
        el.addEventListener('touchmove', stop, { passive: true });
        return () => {
            el.removeEventListener('wheel', stop);
            el.removeEventListener('touchmove', stop);
        };
    }, [project]);

    const images = (Array.isArray(project?.images) && project.images.length > 0)
        ? project.images
        : (project?.image ? [project.image] : []);

    useEffect(() => {
        if (!project) return;
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        // Lenis mueve el scroll con su propio loop en JS: overflow:hidden en el
        // body no alcanza, hay que pausar la instancia explícitamente.
        window.__lenis?.stop();
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
            window.__lenis?.start();
        };
    }, [project, onClose]);

    if (!project) return null;

    const t = lang === 'es'
        ? {
            situation: 'Situación', task: 'Tarea', action: 'Acción', result: 'Resultado',
            stack: 'Stack', viewProject: 'Ver proyecto', close: 'Cerrar', noImage: 'Sin imagen',
        }
        : {
            situation: 'Situation', task: 'Task', action: 'Action', result: 'Result',
            stack: 'Stack', viewProject: 'View project', close: 'Close', noImage: 'No image',
        };

    const suffix = lang === 'en' ? '_en' : '';
    const field = (base) => project[`${base}${suffix}`] || project[base] || '';

    const hasSTAR = field('situation') || field('task') || field('action') || field('result');
    const statusKey = project.status || 'production';
    const statusLabel = STATUS_LABEL[statusKey]?.[lang === 'en' ? 'en' : 'es'] || STATUS_LABEL.production.es;

    return (
        <AnimatePresence>
            <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-[200] md:flex md:items-center md:justify-center md:p-8"
                onClick={onClose}
            >
                {/* backdrop-blur solo en desktop: en mobile el modal ocupa toda la
                    pantalla (el fondo no se ve) y el blur solo quema GPU al pedo */}
                <div className="absolute inset-0 bg-black/85 md:backdrop-blur-sm" />

                <Motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.98 }}
                    transition={{ duration: 0.35, ease: [0.2, 0.65, 0.3, 0.9] }}
                    data-lenis-prevent
                    ref={cardRef}
                    className="relative bg-white text-brand-bg w-full h-full md:h-auto md:max-h-[90vh] md:max-w-4xl overflow-y-auto overflow-x-hidden overscroll-contain md:rounded-2xl shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Barra superior — solo mobile: categoría + cerrar, siempre a mano */}
                    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between pl-5 pr-3 h-12 bg-white/95 backdrop-blur border-b border-brand-bg/10">
                        <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-brand-bg/60 truncate">
                            {project.category} · {statusLabel}
                        </span>
                        <button
                            onClick={onClose}
                            aria-label={t.close}
                            className="shrink-0 w-9 h-9 flex items-center justify-center text-brand-bg/70 hover:text-brand-bg transition-colors"
                        >
                            <IoClose className="text-xl" />
                        </button>
                    </div>

                    {/* Cerrar — solo desktop, esquina del papel, sobre el coverflow */}
                    <button
                        onClick={onClose}
                        aria-label={t.close}
                        className="cursor-hover hidden md:flex absolute top-5 right-5 z-30 w-9 h-9 rounded-full border border-brand-bg/25 text-brand-bg/70 items-center justify-center bg-white/70 backdrop-blur hover:bg-brand-bg hover:text-white hover:border-brand-bg transition-colors duration-300"
                    >
                        <IoClose className="text-lg" />
                    </button>

                    {/* Coverflow de capturas — tarjetas con marco de tinta sobre papel,
                        para que las capturas resalten sin salir de la paleta. */}
                    {/* overflow-x-clip: las tarjetas laterales del coverflow se
                        desplazan más allá del ancho — clipeamos acá para que ese
                        desborde ni exista como layout (sin esto, el contenedor
                        scrolleable del modal permitía scroll horizontal). */}
                    <div className="px-4 sm:px-8 pt-8 md:pt-12 pb-2 overflow-x-clip">
                        {images.length > 0 ? (
                            <Coverflow
                                key={project.id || project.slug}
                                count={images.length}
                                ariaLabel={`${lang === 'es' ? 'Capturas de' : 'Screenshots of'} ${project.title}`}
                                stageClassName="h-[clamp(210px,40vh,400px)]"
                                cardClassName="w-[72%] max-w-[520px] aspect-[16/10]"
                                spread={44}
                                renderItem={(i) => (
                                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-brand-bg shadow-[0_20px_50px_-20px_rgba(10,10,10,0.6)] ring-1 ring-brand-bg/10">
                                        <SmartImage
                                            cover
                                            fit="contain"
                                            src={images[i]}
                                            alt={`${project.title} — ${i + 1}/${images.length}`}
                                            eager={i === 0}
                                            className="pointer-events-none"
                                        />
                                    </div>
                                )}
                            />
                        ) : (
                            <div className="h-[clamp(200px,36vh,360px)] flex items-center justify-center rounded-xl bg-brand-bg/[0.04] border border-brand-bg/10 text-brand-bg/30 text-xs uppercase tracking-[0.3em]">
                                {t.noImage}
                            </div>
                        )}
                    </div>

                    {/* Caso de estudio — papel */}
                    <div className="px-6 sm:px-10 md:px-12 pt-6 md:pt-8 pb-8 md:pb-12">
                        <p className="hidden md:block font-sans text-[10px] uppercase tracking-[0.3em] text-brand-bg/60 mb-2">
                            {project.category} · {statusLabel}
                        </p>
                        <h3 className="font-serif text-3xl md:text-4xl leading-tight mb-5">
                            {project.title}
                        </h3>
                        <div className="w-10 h-px bg-brand-bg/20 mb-6" />

                        {hasSTAR ? (
                            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 mb-8">
                                {[
                                    ['situation', t.situation],
                                    ['task', t.task],
                                    ['action', t.action],
                                    ['result', t.result],
                                ].map(([key, label]) => field(key) && (
                                    <div key={key}>
                                        <h4 className="text-brand-bg/60 text-[10px] uppercase tracking-widest mb-1.5">{label}</h4>
                                        <p className="text-sm md:text-[15px] text-brand-bg/75 leading-relaxed">{field(key)}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm md:text-base text-brand-bg/75 leading-relaxed mb-8 max-w-2xl">
                                {field('description') || field('description_short')}
                            </p>
                        )}

                        {Array.isArray(project.tech) && project.tech.length > 0 && (
                            <div className="mb-8">
                                <h4 className="text-brand-bg/60 text-[10px] uppercase tracking-widest mb-3">{t.stack}</h4>
                                <div className="flex flex-wrap gap-2">
                                    {project.tech.map((key, i) => {
                                        const s = resolveSkill(key);
                                        if (!s) return null;
                                        return (
                                            <span key={i} className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.15em] border border-brand-bg/20 rounded-full pl-2.5 pr-3 py-1.5 text-brand-bg/70">
                                                {s.icon && <span className="text-sm leading-none">{s.icon}</span>}
                                                {s.name}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                            {project.demo_url && (
                                <a
                                    href={project.demo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cursor-hover inline-flex items-center gap-2 bg-brand-bg text-white px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-transparent hover:text-brand-bg border border-brand-bg transition-colors duration-300"
                                >
                                    {t.viewProject}
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </a>
                            )}
                            {project.github_url && (
                                <a
                                    href={project.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="cursor-hover inline-flex items-center gap-2 border border-brand-bg/25 text-brand-bg/70 px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.25em] hover:border-brand-bg hover:text-brand-bg transition-colors duration-300"
                                >
                                    GitHub
                                </a>
                            )}
                        </div>
                    </div>
                </Motion.div>
            </Motion.div>
        </AnimatePresence>
    );
}
