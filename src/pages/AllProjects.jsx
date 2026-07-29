import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { IoDocumentTextOutline, IoArrowBack } from 'react-icons/io5';
import CustomCursor from '../components/CustomCursor';
import SmoothScroll from '../components/SmoothScroll';
import SmartImage from '../components/SmartImage';
import { ProjectCardSkeleton } from '../components/Skeletons';
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
            ? 'Proyectos de backend, SaaS y automatización | Alejo Monárdez'
            : 'Backend, SaaS & Automation Projects | Alejo Monárdez',
        description: lang === 'es'
            ? 'Proyectos personales y trabajos freelance de Alejo Monárdez: sistemas SaaS, APIs, automatización, datos e inteligencia artificial aplicada.'
            : 'Explore personal projects and freelance work by Alejo Monardez: SaaS, Python backends, automation, and AI integrations with demos and code.',
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
                        url: `https://alejomonardez.com/proyectos/${p.slug}`,
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
            archive: 'Archivo',
            heading: 'todos los proyectos',
            intro: 'Proyectos personales y trabajos freelance presentados con su contexto, funcionalidades y stack. Cuando está disponible, cada ficha incluye demo y repositorio.',
            index: 'Índice',
            back: 'Volver',
            all: 'Todos',
            loading: 'Cargando el archivo…',
            empty: 'Todavía no hay trabajos en esta sección.',
            workCta: '¿Armamos algo juntos?',
            workSub: 'Escribime y lo hacemos realidad.',
            noImage: 'Sin imagen',
            demo: 'Ver demo',
            noDemo: 'Demo no disponible',
            imgs: 'imgs',
            works: 'trabajos',
            downloadCV: 'Descargar CV',
            credentials: 'Credenciales de demo',
            credUser: 'Usuario',
            credPass: 'Contraseña',
            copy: 'Copiar',
            copied: '¡Copiado!',
            credHint: 'Tocá cualquier valor para copiarlo.'
        }
        : {
            archive: 'Archive',
            heading: 'all projects',
            intro: 'Personal products and freelance work presented with their context, core functions, contribution, and verified technology.',
            index: 'Index',
            back: 'Back',
            all: 'All',
            loading: 'Loading the archive…',
            empty: 'No work in this section yet.',
            workCta: 'Want to build something?',
            workSub: 'Drop me a line and let’s make it real.',
            noImage: 'No image',
            demo: 'View demo',
            noDemo: 'Demo not available',
            imgs: 'imgs',
            works: 'works',
            downloadCV: 'Download CV',
            credentials: 'Demo credentials',
            credUser: 'User',
            credPass: 'Password',
            copy: 'Copy',
            copied: 'Copied!',
            credHint: 'Tap any value to copy it.'
        };

    const count = String(visibleProjects.length).padStart(2, '0');

    return (
        <div className="bg-brand-bg min-h-screen text-brand-text selection:bg-white selection:text-black cursor-none overflow-x-clip">
            <CustomCursor />
            <SmoothScroll />

            {/* Nav — ink pill sobre papel, mismo lenguaje de tarjeta que el resto del sitio */}
            <nav className="sticky top-0 left-0 w-full z-40 flex justify-center bg-white/95 backdrop-blur border-b border-brand-bg/10">
                <div className="w-full max-w-[1440px] px-6 md:px-12 py-3.5 md:py-4 flex justify-between items-center text-brand-bg">
                    <Link to="/" aria-label="Home">
                        <img src={logo} alt="Alejo Monardez" className="h-5 md:h-7 w-auto object-contain opacity-90" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <a
                            href={settings.cv_url || "/Monardez_Alejo_2026_CV.pdf"}
                            download="Monardez_Alejo_CV.pdf"
                            aria-label={t.downloadCV}
                            title={t.downloadCV}
                            className="hidden md:inline-flex items-center px-4 py-1.5 border border-brand-bg bg-brand-bg text-white rounded-full hover:bg-transparent hover:text-brand-bg transition-all duration-300 cursor-hover"
                        >
                            <span className="text-[10px] font-sans tracking-widest uppercase font-bold">{t.downloadCV}</span>
                        </a>
                        <a
                            href={settings.cv_url || "/Monardez_Alejo_2026_CV.pdf"}
                            download="Monardez_Alejo_CV.pdf"
                            aria-label={t.downloadCV}
                            title={t.downloadCV}
                            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-brand-bg/20 text-brand-bg hover:bg-brand-bg hover:text-white transition-all duration-300"
                        >
                            <IoDocumentTextOutline className="text-[15px]" />
                        </a>

                        <button
                            onClick={toggleLang}
                            className="text-[10px] md:text-xs border border-brand-bg/20 rounded-full px-3 py-1 h-9 md:h-auto uppercase tracking-widest hover:bg-brand-bg hover:text-white transition-colors"
                        >
                            {lang === 'es' ? 'EN' : 'ES'}
                        </button>

                        <Link
                            to="/"
                            aria-label={t.back}
                            title={t.back}
                            className="hidden md:inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] border border-brand-bg/20 rounded-full px-4 py-2 hover:bg-brand-bg hover:text-white transition-all cursor-hover"
                        >
                            <IoArrowBack className="text-xs" /> {t.back}
                        </Link>
                        <Link
                            to="/"
                            aria-label={t.back}
                            title={t.back}
                            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-full border border-brand-bg/20 text-brand-bg hover:bg-brand-bg hover:text-white transition-all duration-300"
                        >
                            <IoArrowBack className="text-[15px]" />
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Índice del archivo ─────────────────────────────────────────────
                Todo en UNA lámina continua (masthead → barra de contenido reglada →
                grilla), como el índice de una revista. */}
            <main className="px-4 sm:px-8 md:px-12 py-8 md:py-12">
                <div className="bg-white text-brand-bg rounded-sm">

                    {/* Masthead — eyebrow, título didone, intro y el conteo del archivo */}
                    <header className="px-5 sm:px-8 md:px-14 pt-10 md:pt-16 pb-8 md:pb-10">
                        <p className="font-sans text-[10px] md:text-xs uppercase tracking-[0.4em] text-brand-bg/45 mb-5 md:mb-7">
                            {t.archive}
                        </p>
                        <h1 className="font-serif font-bold lowercase leading-[0.82] tracking-tight text-[15vw] sm:text-[12vw] md:text-[7vw]">
                            {t.heading}<span className="text-brand-bg/30">.</span>
                        </h1>
                        <div className="mt-7 md:mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                            <p className="max-w-md text-brand-bg/60 text-sm md:text-[15px] leading-relaxed font-sans">
                                {t.intro}
                            </p>
                            {/* Conteo del archivo — se mueve con el filtro activo */}
                            <p className="shrink-0 font-sans text-[10px] uppercase tracking-[0.35em] text-brand-bg/40 md:text-right">
                                <span className="font-serif text-brand-bg/80 text-xl not-italic tracking-normal mr-1.5">{count}</span>
                                {t.works}
                            </p>
                        </div>
                    </header>

                    {/* Barra de contenido — reglada arriba y abajo, con las secciones
                        como pestañas (tabla de contenidos de la revista) */}
                    <div className="border-y border-brand-bg/15 px-5 sm:px-8 md:px-14 py-4 md:py-4">
                        <div className="flex items-center gap-4 md:gap-6">
                            <span className="hidden md:inline shrink-0 font-sans text-[10px] uppercase tracking-[0.35em] text-brand-bg/40">
                                {t.index}
                            </span>
                            <div className="flex-1 min-w-0 flex gap-2 overflow-x-auto scrollbar-hide snap-x">
                                {categories.map(cat => {
                                    const active = filter === cat;
                                    const label = cat === 'all' ? t.all : cat;
                                    const n = cat === 'all'
                                        ? projects.length
                                        : projects.filter(p => p.category === cat).length;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => setFilter(cat)}
                                            className={`cursor-hover shrink-0 snap-start inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] rounded-full px-4 py-2 transition-all duration-300 whitespace-nowrap border ${
                                                active
                                                    ? 'bg-brand-bg text-white border-brand-bg'
                                                    : 'border-brand-bg/20 text-brand-bg/55 hover:border-brand-bg hover:text-brand-bg'
                                            }`}
                                        >
                                            {label}
                                            <span className={active ? 'text-white/50' : 'text-brand-bg/30'}>
                                                {String(n).padStart(2, '0')}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Grilla de fichas */}
                    <div className="px-5 sm:px-8 md:px-14 py-10 md:py-16">
                        {!loading && visibleProjects.length === 0 && (
                            <p className="text-center text-brand-bg/30 uppercase tracking-[0.3em] text-xs py-24">
                                {t.empty}
                            </p>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14 md:gap-x-10 md:gap-y-16">
                            {loading
                                ? Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)
                                : visibleProjects.map((project, i) => (
                                    <ProjectCard key={project.id || project.slug} project={project} index={i} t={t} lang={lang} />
                                ))}
                        </div>
                    </div>
                </div>
            </main>

            {/* Cierre — invitación a trabajar, lámina propia para dar respiro final */}
            <section className="px-4 sm:px-8 md:px-12 pb-8 md:pb-12">
                <div className="bg-white text-brand-bg rounded-sm px-5 sm:px-8 md:px-14 py-12 md:py-16 flex flex-col items-center text-center">
                    <p className="font-serif text-2xl md:text-3xl leading-tight mb-3">{t.workCta}</p>
                    <p className="font-sans text-sm text-brand-bg/55 mb-7">{t.workSub}</p>
                    <Link
                        to="/contacto"
                        className="cursor-hover inline-flex items-center gap-2 bg-brand-bg text-white px-7 py-3.5 rounded-full text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-transparent hover:text-brand-bg border border-brand-bg transition-colors duration-300"
                    >
                        {lang === 'es' ? 'Contacto' : 'Contact'}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Link>
                    <p className="mt-9 text-[10px] uppercase tracking-[0.3em] text-brand-bg/30">© 2026 Alejo Monárdez</p>
                </div>
            </section>
        </div>
    );
}

const STATUS_DOT = {
    production: 'bg-emerald-500',
    demo:       'bg-amber-500',
    wip:        'bg-blue-500',
};

function ProjectCard({ project, index, t, lang }) {
    const hasDemo = !!project.demo_url;
    const hasGithub = !!project.github_url;
    const credentials = Array.isArray(project.credentials) ? project.credentials.filter(c => c.user || c.password) : [];
    const hasCredentials = credentials.length > 0;
    const [showCreds, setShowCreds] = React.useState(false);
    const [copied, setCopied] = React.useState(null); // "userN-fieldX"

    const status = project.status || 'production';
    const statusDot = STATUS_DOT[status] || STATUS_DOT.production;
    const statusLabel = {
        production: lang === 'es' ? 'Producción' : 'Production',
        demo:       'Demo',
        wip:        lang === 'es' ? 'En desarrollo' : 'In dev',
    }[status] || 'Producción';

    const copyToClipboard = (value, key) => {
        if (!value) return;
        navigator.clipboard?.writeText(value).then(() => {
            setCopied(key);
            setTimeout(() => setCopied(null), 1500);
        });
    };

    const coverImage = Array.isArray(project.images) && project.images.length > 0
        ? project.images[0]
        : project.image;
    const imageCount = Array.isArray(project.images) ? project.images.length : 0;

    const card = (
        <Motion.article
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
            className="group h-full flex flex-col"
        >
            {/* Plancha — marco hairline, imagen en paspartú (fondo desenfocado +
                contain) para que verticales y horizontales convivan en el mismo
                4:3 sin recorte. B&N que gana color al hover, como el resto del sitio. */}
            <div className="relative aspect-[4/3] overflow-hidden bg-brand-bg/[0.04] border border-brand-bg/15">
                {coverImage ? (
                    <SmartImage src={coverImage} alt={project.title} eager={index < 3} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-bg/25 text-xs uppercase tracking-[0.3em]">
                        {t.noImage}
                    </div>
                )}

                {/* Estado — punto + label, esquina superior derecha */}
                <span className="absolute top-3 right-3 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] bg-brand-bg/85 backdrop-blur-sm px-2.5 py-1 rounded-full text-white z-10">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`} />
                    {statusLabel}
                </span>
                {/* Nº de imágenes — abajo a la derecha */}
                {imageCount > 1 && (
                    <span className="absolute bottom-3 right-3 text-[9px] uppercase tracking-[0.2em] bg-brand-bg/85 backdrop-blur-sm px-2 py-1 rounded-full text-white z-10">
                        {imageCount} {t.imgs}
                    </span>
                )}
            </div>

            {/* Pie editorial */}
            <div className="pt-4 flex-1 flex flex-col">
                <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-brand-bg/50">
                    {project.category || '—'}
                </p>
                <h3 className="mt-1.5 font-serif text-xl md:text-2xl leading-tight">
                    <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat group-hover:bg-[length:100%_1px] transition-all duration-500">
                        {project.title}
                    </span>
                </h3>
                <p className="mt-2.5 font-sans text-[13px] text-brand-bg/65 leading-relaxed line-clamp-2">
                    {project.description_short || project.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                    {(project.tech || []).slice(0, 6).map((techKey, i) => {
                        const s = resolveSkill(techKey);
                        if (!s) return null;
                        return (
                            <span key={i} className="flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] border border-brand-bg/15 rounded-full px-2 py-1 text-brand-bg/55">
                                {s.icon && <span className="text-xs">{s.icon}</span>}
                                {s.name}
                            </span>
                        );
                    })}
                </div>

                {/* Panel de credenciales de demo */}
                {hasCredentials && (
                    <div className="mt-4">
                        <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowCreds(s => !s); }}
                            className="w-full flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.2em] text-amber-800 border border-amber-600/30 bg-amber-50 px-4 py-2.5 rounded-full hover:bg-amber-100 transition-colors"
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
                                <p className="text-[10px] text-brand-bg/40 italic">{t.credHint}</p>
                                {credentials.map((cred, i) => (
                                    <div key={i} className="border border-amber-600/25 bg-amber-50/60 p-3 rounded-lg space-y-2">
                                        {cred.label && (
                                            <p className="text-[10px] uppercase tracking-[0.25em] text-amber-800 font-bold">
                                                {cred.label}
                                            </p>
                                        )}
                                        {cred.user && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); copyToClipboard(cred.user, `${i}-u`); }}
                                                className="w-full flex items-center justify-between gap-3 text-left text-xs bg-white px-3 py-2 rounded border border-brand-bg/10 hover:border-amber-600/50 transition-colors group/cred"
                                            >
                                                <span className="text-brand-bg/40 text-[9px] uppercase tracking-widest shrink-0">{t.credUser}</span>
                                                <span className="font-mono text-brand-bg flex-1 truncate text-right">{cred.user}</span>
                                                <span className="text-[9px] uppercase tracking-widest text-amber-700 group-hover/cred:text-amber-900 shrink-0">
                                                    {copied === `${i}-u` ? `✓ ${t.copied}` : t.copy}
                                                </span>
                                            </button>
                                        )}
                                        {cred.password && (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.preventDefault(); copyToClipboard(cred.password, `${i}-p`); }}
                                                className="w-full flex items-center justify-between gap-3 text-left text-xs bg-white px-3 py-2 rounded border border-brand-bg/10 hover:border-amber-600/50 transition-colors group/cred"
                                            >
                                                <span className="text-brand-bg/40 text-[9px] uppercase tracking-widest shrink-0">{t.credPass}</span>
                                                <span className="font-mono text-brand-bg flex-1 truncate text-right">{cred.password}</span>
                                                <span className="text-[9px] uppercase tracking-widest text-amber-700 group-hover/cred:text-amber-900 shrink-0">
                                                    {copied === `${i}-p` ? `✓ ${t.copied}` : t.copy}
                                                </span>
                                            </button>
                                        )}
                                        {cred.note && (
                                            <p className="text-[10px] text-brand-bg/50 italic px-1">{cred.note}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Acciones — separadas por hairline, ancladas al fondo de la ficha */}
                <div className="mt-auto pt-4 flex flex-wrap items-center gap-3 border-t border-brand-bg/10">
                    <Link to={`/proyectos/${project.slug}`} className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.22em] text-brand-bg border-b border-brand-bg/30 pb-1">
                        {lang === 'es' ? 'Ver caso' : 'View case'} →
                    </Link>
                    {hasDemo ? (
                        <span className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.25em] text-brand-bg/70 group-hover:text-brand-bg transition-colors">
                            {status === 'production'
                                ? (lang === 'es' ? 'Ver proyecto' : 'View project')
                                : status === 'wip'
                                    ? (lang === 'es' ? 'En desarrollo' : 'In development')
                                    : t.demo}
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                                <path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-2 font-sans text-[10px] uppercase tracking-[0.25em] text-brand-bg/35">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/><path d="M8 12h8" stroke="currentColor" strokeWidth="1.5"/></svg>
                            {t.noDemo}
                        </span>
                    )}
                    {hasGithub && (
                        <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="GitHub"
                            aria-label="GitHub"
                            onClick={e => e.stopPropagation()}
                            className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full border border-brand-bg/15 text-brand-bg/55 hover:border-brand-bg hover:text-brand-bg transition-all duration-300"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                            </svg>
                        </a>
                    )}
                </div>
            </div>
        </Motion.article>
    );

    return card;
}
