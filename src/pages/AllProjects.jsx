import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoDocumentTextOutline, IoArrowBack } from 'react-icons/io5';
import CustomCursor from '../components/CustomCursor';
import NoiseOverlay from '../components/NoiseOverlay';
import SmoothScroll from '../components/SmoothScroll';
import { useProjects, localizeProject } from '../data/useProjects';
import { resolveSkill } from '../data/skills';
import { useSeo } from '../hooks/useSeo';
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

    // SEO por ruta — canonical propio + schema de colección de proyectos
    useSeo({
        lang,
        canonical: 'https://alejomonardez.com/proyectos',
        title: lang === 'es'
            ? 'Proyectos — Alejo Monardez | SaaS, IA y Desarrollo Full Stack'
            : 'Projects — Alejo Monardez | SaaS, AI & Full Stack Development',
        description: lang === 'es'
            ? 'Portafolio completo de proyectos de Alejo Monardez: plataformas SaaS, sistemas de gestión, soluciones de IA y desarrollos full-stack con React, Node.js y Python. Mirá las demos en vivo.'
            : 'Complete project portfolio by Alejo Monardez: SaaS platforms, management systems, AI solutions and full-stack builds with React, Node.js and Python. See the live demos.',
        keywords: 'proyectos Alejo Monardez, portafolio desarrollador, proyectos SaaS, sistemas de gestión, demos web, react node python',
        jsonLd: [
            {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : 'Home', item: 'https://alejomonardez.com/' },
                    { '@type': 'ListItem', position: 2, name: lang === 'es' ? 'Proyectos' : 'Projects', item: 'https://alejomonardez.com/proyectos' },
                ],
            },
            {
                '@context': 'https://schema.org',
                '@type': 'CollectionPage',
                name: lang === 'es' ? 'Proyectos de Alejo Monardez' : 'Alejo Monardez Projects',
                url: 'https://alejomonardez.com/proyectos',
                isPartOf: { '@id': 'https://alejomonardez.com/#website' },
                about: { '@id': 'https://alejomonardez.com/#person' },
                mainEntity: {
                    '@type': 'ItemList',
                    numberOfItems: projects.length,
                    itemListElement: projects.map((p, i) => ({
                        '@type': 'ListItem',
                        position: i + 1,
                        name: p.title,
                        description: p.description_short || p.description || undefined,
                        url: p.demo_url || 'https://alejomonardez.com/proyectos',
                    })),
                },
            },
        ],
    });

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
            downloadCV: 'Descargar CV',
            credentials: 'Credenciales de demo',
            credentialsCta: 'Ver credenciales',
            credentialsHide: 'Ocultar',
            credUser: 'Usuario',
            credPass: 'Contraseña',
            copy: 'Copiar',
            copied: '¡Copiado!',
            credHint: 'Tocá cualquier valor para copiarlo.'
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
            downloadCV: 'Download CV',
            credentials: 'Demo credentials',
            credentialsCta: 'Show credentials',
            credentialsHide: 'Hide',
            credUser: 'User',
            credPass: 'Password',
            copy: 'Copy',
            copied: 'Copied!',
            credHint: 'Tap any value to copy it.'
        };

    return (
        <div className="bg-brand-bg min-h-screen text-brand-text selection:bg-white selection:text-black cursor-none overflow-x-hidden">
            <CustomCursor />
            <SmoothScroll />

            {/* Nav — mismo patrón que Home: pill en desktop, círculos en mobile */}
            <nav className="fixed top-0 left-0 w-full p-6 md:p-12 flex justify-between items-center z-40 mix-blend-difference">
                <Link to="/" aria-label="Home">
                    <img src={logo} alt="Alejo Monardez" className="h-6 md:h-10 w-auto object-contain invert brightness-0 opacity-90" />
                </Link>
                <div className="flex items-center gap-3">
                    {/* CV — pill desktop / icono circular mobile */}
                    <a
                        href={settings.cv_url || "/Monardez_Alejo_2026_CV.pdf"}
                        download="Monardez_Alejo_CV.pdf"
                        aria-label={t.downloadCV}
                        title={t.downloadCV}
                        className="hidden md:inline-flex items-center px-4 py-1.5 border border-white text-black bg-white rounded-full hover:bg-transparent hover:text-white transition-all duration-300 z-50 relative shadow-[0_0_15px_rgba(255,255,255,0.12)] cursor-hover"
                    >
                        <span className="text-[10px] font-sans tracking-widest uppercase font-bold">{t.downloadCV}</span>
                    </a>
                    <a
                        href={settings.cv_url || "/Monardez_Alejo_2026_CV.pdf"}
                        download="Monardez_Alejo_CV.pdf"
                        aria-label={t.downloadCV}
                        title={t.downloadCV}
                        className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all duration-300 z-50 relative shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                    >
                        <IoDocumentTextOutline className="text-[17px]" />
                    </a>

                    <button
                        onClick={toggleLang}
                        className="text-[10px] md:text-xs border border-white/20 rounded-full px-3 py-1 md:py-1 h-9 md:h-auto uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                    >
                        {lang === 'es' ? 'EN' : 'ES'}
                    </button>

                    {/* Volver — pill con texto en desktop, círculo con flecha en mobile */}
                    <Link
                        to="/"
                        aria-label={t.back}
                        title={t.back}
                        className="hidden md:inline-flex items-center text-xs uppercase tracking-[0.25em] border border-white/20 rounded-full px-4 py-2 hover:bg-white hover:text-black transition-all"
                    >
                        {t.back}
                    </Link>
                    <Link
                        to="/"
                        aria-label={t.back}
                        title={t.back}
                        className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white hover:text-black transition-all duration-300"
                    >
                        <IoArrowBack className="text-[15px]" />
                    </Link>
                </div>
            </nav>

            {/* Header */}
            <header className="relative pt-28 md:pt-40 pb-12 md:pb-24 px-6 sm:px-12 border-b border-white/10">
                <NoiseOverlay />
                <div className="max-w-7xl mx-auto">
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/40 mb-5 md:mb-6">
                        {t.archive}
                    </p>
                    <h1 className="font-serif text-[13vw] sm:text-[12vw] md:text-[10vw] leading-[0.9] md:leading-[0.85] tracking-tighter text-white mix-blend-difference break-words">
                        {t.heading1}
                        <br />
                        {t.heading2}
                    </h1>
                    <p className="mt-6 md:mt-8 max-w-xl text-white/60 text-sm md:text-base leading-relaxed">
                        {t.intro}
                    </p>
                </div>
            </header>

            {/* Filtros — strip horizontal swipeable en mobile, wrap en desktop */}
            <section className="border-b border-white/10">
                <div className="max-w-7xl mx-auto py-6 md:py-10">
                    {/* Mobile: scroll horizontal sin scrollbar */}
                    <div className="md:hidden flex gap-2 overflow-x-auto scrollbar-hide px-6 snap-x snap-mandatory">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`shrink-0 snap-start text-[10px] uppercase tracking-[0.2em] border rounded-full px-4 py-2 transition-all duration-300 whitespace-nowrap ${
                                    filter === cat
                                        ? 'bg-white text-black border-white'
                                        : 'border-white/20 text-white/60 active:bg-white/10'
                                }`}
                            >
                                {cat === 'all' ? t.all : cat}
                            </button>
                        ))}
                    </div>
                    {/* Desktop: wrap normal */}
                    <div className="hidden md:flex flex-wrap gap-3 px-12">
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
                </div>
            </section>

            {/* Grid de proyectos */}
            <section className="px-6 sm:px-12 py-12 md:py-24">
                <div className="max-w-7xl mx-auto">
                    {loading && (
                        <p className="text-center text-white/30 uppercase tracking-widest text-xs">{t.loading}</p>
                    )}

                    {!loading && visibleProjects.length === 0 && (
                        <p className="text-center text-white/30 uppercase tracking-widest text-xs py-24">
                            {t.empty}
                        </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
                        {visibleProjects.map((project, i) => (
                            <ProjectCard key={project.id || project.slug} project={project} index={i} t={t} lang={lang} />
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

const STATUS_MAP = {
    production: { dot: 'bg-green-400', cls: 'border-green-400/30 text-green-300/80' },
    demo:       { dot: 'bg-amber-400', cls: 'border-amber-400/30 text-amber-300/80' },
    wip:        { dot: 'bg-blue-400',  cls: 'border-blue-400/30  text-blue-300/80'  },
};

function ProjectCard({ project, index, t, lang }) {
    const hasDemo = !!project.demo_url;
    const hasGithub = !!project.github_url;
    const credentials = Array.isArray(project.credentials) ? project.credentials.filter(c => c.user || c.password) : [];
    const hasCredentials = credentials.length > 0;
    const [showCreds, setShowCreds] = React.useState(false);
    const [copied, setCopied] = React.useState(null); // "userN-fieldX"

    const status = project.status || 'production';
    const statusStyle = STATUS_MAP[status] || STATUS_MAP.production;
    const statusLabel = {
        production: lang === 'es' ? 'Producción' : 'Production',
        demo:       'Demo',
        wip:        lang === 'es' ? 'En desarrollo' : 'In dev',
    }[status] || 'Producción';

    // Copy with feedback
    const copyToClipboard = (value, key) => {
        if (!value) return;
        navigator.clipboard?.writeText(value).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 1500);
        });
    };
    const card = (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
            className="group relative border border-white/10 bg-neutral-900/30 active:bg-neutral-900/50 md:hover:bg-neutral-900/50 transition-all duration-500 overflow-hidden"
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-950 flex items-center justify-center">
                {(() => {
                    const coverImage = Array.isArray(project.images) && project.images.length > 0
                        ? project.images[0]
                        : project.image;
                    const imageCount = Array.isArray(project.images) ? project.images.length : 0;
                    return coverImage ? (
                        <>
                            {/* Backdrop blureado (la portada en gigante de fondo) — da textura editorial */}
                            <img
                                src={coverImage}
                                alt=""
                                aria-hidden="true"
                                className="absolute inset-0 w-full h-full object-cover blur-xl opacity-30 scale-110 pointer-events-none"
                            />
                            {/* Imagen real, full color, centrada con respiración */}
                            <img
                                src={coverImage}
                                alt={project.title}
                                loading={index < 3 ? 'eager' : 'lazy'}
                                decoding="async"
                                onError={(e) => { e.currentTarget.style.opacity = '0.15'; }}
                                className="relative w-full h-full object-contain md:group-hover:scale-[1.03] transition-transform duration-700"
                            />
                            {imageCount > 1 && (
                                <span className="absolute bottom-3 right-3 text-[9px] uppercase tracking-[0.2em] bg-black/70 backdrop-blur-sm border border-white/20 px-2 py-1 rounded-full text-white/90 z-10">
                                    {imageCount} {t.imgs}
                                </span>
                            )}
                            {/* Overlay sutil al hover para hacer obvio que es clickeable */}
                            {hasDemo && (
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-xs uppercase tracking-widest">
                            {t.noImage}
                        </div>
                    );
                })()}
                {project.badge && (
                    <span className="absolute top-3 left-3 md:top-4 md:left-4 text-[9px] uppercase tracking-[0.2em] bg-black/70 backdrop-blur-sm border border-white/20 px-3 py-1 rounded-full text-white z-10">
                        {project.badge}
                    </span>
                )}
                {/* Status badge */}
                <span className={`absolute top-3 right-3 md:top-4 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] bg-black/70 backdrop-blur-sm border px-2.5 py-1 rounded-full z-10 ${statusStyle.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot} animate-pulse`} />
                    {statusLabel}
                </span>
            </div>

            <div className="p-5 md:p-8">
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2 md:mb-3">
                    {project.category || '—'}
                </p>
                <h3 className="font-serif text-xl md:text-3xl leading-tight mb-2.5 md:mb-3 text-white">
                    {project.title}
                </h3>
                <p className="text-[13px] md:text-sm text-white/60 leading-relaxed mb-5 md:mb-6 line-clamp-3">
                    {project.description_short || project.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-5 md:mb-6">
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

                {/* Panel de credenciales de demo */}
                {hasCredentials && (
                    <div className="mb-5 md:mb-6">
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCreds(s => !s); }}
                            className="w-full flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.25em] text-amber-300/90 border border-amber-300/30 bg-amber-300/5 px-4 py-2.5 rounded-full hover:bg-amber-300/15 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                {t.credentials} ({credentials.length})
                            </span>
                            <span className="text-[10px]">{showCreds ? '−' : '+'}</span>
                        </button>

                        {showCreds && (
                            <div className="mt-3 space-y-3" onClick={e => e.stopPropagation()} onMouseDown={e => e.stopPropagation()}>
                                <p className="text-[10px] text-white/40 italic">{t.credHint}</p>
                                {credentials.map((cred, i) => (
                                    <div key={i} className="border border-amber-300/20 bg-amber-300/[0.03] p-3 rounded-lg space-y-2">
                                        {cred.label && (
                                            <p className="text-[10px] uppercase tracking-[0.25em] text-amber-200/80 font-bold">
                                                {cred.label}
                                            </p>
                                        )}
                                        {cred.user && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); copyToClipboard(cred.user, `${i}-u`); }}
                                                className="w-full flex items-center justify-between gap-3 text-left text-xs bg-black/30 px-3 py-2 rounded border border-white/10 hover:border-amber-300/50 transition-colors group/cred"
                                            >
                                                <span className="text-white/40 text-[9px] uppercase tracking-widest shrink-0">{t.credUser}</span>
                                                <span className="font-mono text-white flex-1 truncate text-right">{cred.user}</span>
                                                <span className="text-[9px] uppercase tracking-widest text-amber-300/70 group-hover/cred:text-amber-300 shrink-0">
                                                    {copied === `${i}-u` ? `✓ ${t.copied}` : t.copy}
                                                </span>
                                            </button>
                                        )}
                                        {cred.password && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); copyToClipboard(cred.password, `${i}-p`); }}
                                                className="w-full flex items-center justify-between gap-3 text-left text-xs bg-black/30 px-3 py-2 rounded border border-white/10 hover:border-amber-300/50 transition-colors group/cred"
                                            >
                                                <span className="text-white/40 text-[9px] uppercase tracking-widest shrink-0">{t.credPass}</span>
                                                <span className="font-mono text-white flex-1 truncate text-right">{cred.password}</span>
                                                <span className="text-[9px] uppercase tracking-widest text-amber-300/70 group-hover/cred:text-amber-300 shrink-0">
                                                    {copied === `${i}-p` ? `✓ ${t.copied}` : t.copy}
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

                <div className="flex flex-wrap items-center gap-2">
                    {hasDemo ? (
                        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] bg-white text-black px-4 py-2.5 rounded-full font-bold md:group-hover:bg-gray-200 md:group-hover:gap-3 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.08)]">
                            {status === 'production'
                                ? (lang === 'es' ? 'Ver Proyecto' : 'View Project')
                                : status === 'wip'
                                    ? (lang === 'es' ? 'En Desarrollo' : 'In Development')
                                    : t.demo}
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-white/30 border border-white/15 px-4 py-2.5 rounded-full">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M8 12h8" stroke="currentColor" strokeWidth="1.5"/></svg>
                            {t.noDemo}
                        </span>
                    )}
                    {hasGithub && (
                        <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver código en GitHub"
                            onClick={e => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] border border-white/20 px-3 py-2.5 rounded-full text-white/60 hover:border-white hover:text-white transition-all duration-300"
                        >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                            </svg>
                            GitHub
                        </a>
                    )}
                </div>
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
