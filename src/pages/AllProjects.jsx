import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomCursor from '../components/CustomCursor';
import NoiseOverlay from '../components/NoiseOverlay';
import SmoothScroll from '../components/SmoothScroll';
import { useProjects, localizeProject } from '../data/useProjects';
import { resolveSkill } from '../data/skills';
import { useLang } from '../data/useLang';
import { useSettings } from '../data/useSettings';
import logo from '../assets/logo.png';

export default function AllProjects() {
    const { projects: rawProjects, loading } = useProjects({ featuredOnly: false });
    const { settings } = useSettings();
    const [lang, , toggleLang] = useLang();
    const [filter, setFilter] = useState('all');

    // Aplicar localización a todos los proyectos según el lang actual
    const projects = useMemo(
        () => rawProjects.map(p => localizeProject(p, lang)),
        [rawProjects, lang]
    );

    // Categorías únicas detectadas (en el lang actual)
    const categories = useMemo(() => {
        const set = new Set();
        projects.forEach(p => p.category && set.add(p.category));
        return ['all', ...Array.from(set)];
    }, [projects]);

    const visibleProjects = filter === 'all'
        ? projects
        : projects.filter(p => p.category === filter);

    const t = lang === 'es'
        ? {
            archive: 'Archivo / Trabajos completos',
            heading1: 'TODOS LOS',
            heading2: 'PROYECTOS',
            intro: 'Una colección completa de las plataformas, sistemas y experiencias web que he diseñado y desarrollado. Hacé click en cualquier proyecto para abrir su demo en vivo.',
            back: '← Volver',
            all: 'Todos',
            loading: 'Cargando...',
            empty: 'No hay proyectos en esta categoría todavía.',
            workCta: '¿Te interesa trabajar juntos?',
            noImage: 'Sin imagen',
            demo: 'Ver Demo',
            noDemo: 'Demo no disponible',
            imgs: 'imgs',
            downloadCV: 'Descargar CV'
        }
        : {
            archive: 'Archive / Full work',
            heading1: 'ALL',
            heading2: 'PROJECTS',
            intro: 'A complete collection of the platforms, systems and web experiences I have designed and built. Click any project to open its live demo.',
            back: '← Back',
            all: 'All',
            loading: 'Loading...',
            empty: 'No projects in this category yet.',
            workCta: 'Interested in working together?',
            noImage: 'No image',
            demo: 'View Demo',
            noDemo: 'Demo not available',
            imgs: 'imgs',
            downloadCV: 'Download CV'
        };

    return (
        <div className="bg-brand-bg min-h-screen text-brand-text selection:bg-white selection:text-black cursor-none">
            <CustomCursor />
            <SmoothScroll />

            {/* Nav */}
            <nav className="fixed top-0 left-0 w-full p-6 md:p-12 flex justify-between items-center z-40 mix-blend-difference">
                <Link to="/">
                    <img src={logo} alt="Alejo Monardez" className="h-6 md:h-10 w-auto object-contain invert brightness-0 opacity-90" />
                </Link>
                <div className="flex items-center gap-3">
                    {/* CV Download CTA */}
                    <a
                        href={settings.cv_url || "/Monardez_Alejo_2026_CV.pdf"}
                        download="Monardez_Alejo_CV.pdf"
                        className="px-4 py-1.5 border border-white text-black bg-white rounded-full hover:bg-transparent hover:text-white transition-all duration-300 z-50 relative shadow-[0_0_15px_rgba(255,255,255,0.12)] cursor-hover"
                    >
                        <span className="text-[10px] font-sans tracking-widest uppercase font-bold">{t.downloadCV}</span>
                    </a>

                    <button
                        onClick={toggleLang}
                        className="text-xs border border-white/20 rounded-full px-3 py-1 uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                    >
                        {lang === 'es' ? 'EN' : 'ES'}
                    </button>
                    <Link
                        to="/"
                        className="text-xs uppercase tracking-[0.25em] border border-white/20 rounded-full px-4 py-2 hover:bg-white hover:text-black transition-all"
                    >
                        {t.back}
                    </Link>
                </div>
            </nav>

            {/* Header */}
            <header className="relative pt-32 md:pt-40 pb-16 md:pb-24 px-6 sm:px-12 border-b border-white/10">
                <NoiseOverlay />
                <div className="max-w-7xl mx-auto">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-6">
                        {t.archive}
                    </p>
                    <h1 className="font-serif text-[14vw] md:text-[10vw] leading-[0.85] tracking-tighter text-white mix-blend-difference">
                        {t.heading1}
                        <br />
                        {t.heading2}
                    </h1>
                    <p className="mt-8 max-w-xl text-white/60 text-sm md:text-base leading-relaxed">
                        {t.intro}
                    </p>
                </div>
            </header>

            {/* Filtros */}
            <section className="px-6 sm:px-12 py-10 border-b border-white/10">
                <div className="max-w-7xl mx-auto flex flex-wrap gap-3">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`text-[10px] uppercase tracking-[0.25em] border rounded-full px-4 py-2 transition-all duration-300 ${
                                filter === cat
                                    ? 'bg-white text-black border-white'
                                    : 'border-white/20 text-white/60 hover:border-white hover:text-white'
                            }`}
                        >
                            {cat === 'all' ? t.all : cat}
                        </button>
                    ))}
                </div>
            </section>

            {/* Grid de proyectos */}
            <section className="px-6 sm:px-12 py-16 md:py-24">
                <div className="max-w-7xl mx-auto">
                    {loading && (
                        <p className="text-center text-white/30 uppercase tracking-widest text-xs">{t.loading}</p>
                    )}

                    {!loading && visibleProjects.length === 0 && (
                        <p className="text-center text-white/30 uppercase tracking-widest text-xs py-24">
                            {t.empty}
                        </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {visibleProjects.map((project, i) => (
                            <ProjectCard key={project.id || project.slug} project={project} index={i} t={t} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer mini */}
            <footer className="px-6 sm:px-12 py-12 border-t border-white/10 text-center">
                <Link
                    to="/#contact"
                    className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/60 hover:text-white transition-colors"
                >
                    {t.workCta} <span>→</span>
                </Link>
                <p className="mt-6 text-[10px] uppercase tracking-widest text-white/30">© 2026 Alejo Monardez</p>
            </footer>
        </div>
    );
}

function ProjectCard({ project, index, t }) {
    const hasDemo = !!project.demo_url;
    const card = (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: (index % 6) * 0.08 }}
            className="group relative border border-white/10 bg-neutral-900/30 hover:bg-neutral-900/50 transition-all duration-500 overflow-hidden"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-black flex items-center justify-center">
                {(() => {
                    const coverImage = Array.isArray(project.images) && project.images.length > 0
                        ? project.images[0]
                        : project.image;
                    const imageCount = Array.isArray(project.images) ? project.images.length : 0;
                    return coverImage ? (
                        <>
                            <img
                                src={coverImage}
                                alt={project.title}
                                onError={(e) => { e.currentTarget.style.opacity = '0.15'; }}
                                className="w-full h-full object-contain grayscale brightness-90 contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                            />
                            {imageCount > 1 && (
                                <span className="absolute bottom-3 right-3 text-[9px] uppercase tracking-[0.2em] bg-black/60 backdrop-blur-sm border border-white/20 px-2 py-1 rounded-full text-white/80">
                                    {imageCount} {t.imgs}
                                </span>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-xs uppercase tracking-widest">
                            {t.noImage}
                        </div>
                    );
                })()}
                {project.badge && (
                    <span className="absolute top-4 left-4 text-[9px] uppercase tracking-[0.2em] bg-black/60 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-white">
                        {project.badge}
                    </span>
                )}
            </div>

            <div className="p-6 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-3">
                    {project.category || '—'}
                </p>
                <h3 className="font-serif text-2xl md:text-3xl leading-tight mb-3 text-white">
                    {project.title}
                </h3>
                <p className="text-sm text-white/60 leading-relaxed mb-6 line-clamp-3">
                    {project.description_short || project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                    {(project.tech || []).slice(0, 6).map((techKey, i) => {
                        const s = resolveSkill(techKey);
                        if (!s) return null;
                        return (
                            <span
                                key={i}
                                className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] border border-white/15 rounded-full px-2 py-1 text-white/60"
                            >
                                {s.icon && <span className="text-xs">{s.icon}</span>}
                                {s.name}
                            </span>
                        );
                    })}
                </div>

                {hasDemo ? (
                    <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/80 group-hover:text-white border-b border-white/20 group-hover:border-white pb-1 transition-all">
                        {t.demo}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.5"/>
                        </svg>
                    </span>
                ) : (
                    <span className="inline-block text-[10px] uppercase tracking-[0.25em] text-white/30">
                        {t.noDemo}
                    </span>
                )}
            </div>
        </motion.article>
    );

    if (hasDemo) {
        return (
            <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block cursor-none"
                data-cursor-text="DEMO"
            >
                {card}
            </a>
        );
    }
    return card;
}
