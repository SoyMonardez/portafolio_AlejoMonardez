import React, { useRef, useState } from 'react';
import { HiMenuAlt4 } from "react-icons/hi";
import { IoClose, IoDocumentTextOutline } from "react-icons/io5";
import { Link } from 'react-router-dom';
import CustomCursor from '../components/CustomCursor';
import SmoothScroll from '../components/SmoothScroll';
import TextReveal from '../components/TextReveal';
import SocialLinks from '../components/SocialLinks';
import ProjectModal from '../components/ProjectModal';
import SmartImage from '../components/SmartImage';
import { FeaturedRowSkeleton } from '../components/Skeletons';
import { useSettings } from '../data/useSettings';
import { resolveSocialHref } from '../data/socialLinks';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import '../App.css';
import { API_URL } from '../config';
import logo from '../assets/logo.png';
import { useProjects } from '../data/useProjects';
import { useLang } from '../data/useLang';
import { resolveSkill } from '../data/skills';
import { useSeo } from '../hooks/useSeo';

// Retrato del hero — URLs estables en /public para poder precargarlo desde
// index.html (<link rel="preload">) sin depender del hash de Vite. El AVIF
// (62KB) es el que descargan los browsers modernos; PNG queda de fallback.
const heroPortraitAvif = '/me/moni_cutout.avif';
const heroPortraitWebp = '/me/moni_cutout.webp';
const heroPortrait = '/me/moni_cutout.png';

// Dynamic skills loaded from DB settings

const STACK_GROUPS = {
  es: [
    { label: 'Backend y APIs', keys: ['python', 'fastapi'] },
    { label: 'Datos', keys: ['postgres', 'mysql'] },
    { label: 'Frontend', keys: ['react', 'typescript', 'tailwind'] },
    { label: 'IA aplicada', items: ['LLM', 'RAG', 'Embeddings', 'Whisper'] },
    { label: 'Infraestructura', keys: ['docker', 'git', 'github', 'nginx'], items: ['Linux', 'VPS'] },
    { label: 'Experiencia complementaria', keys: ['javascript', 'node', 'express', 'php'] },
  ],
  en: [
    { label: 'Backend & APIs', keys: ['python', 'fastapi'] },
    { label: 'Data', keys: ['postgres', 'mysql'] },
    { label: 'Frontend', keys: ['react', 'typescript', 'tailwind'] },
    { label: 'Applied AI', items: ['LLM', 'RAG', 'Embeddings', 'Whisper'] },
    { label: 'Infrastructure', keys: ['docker', 'git', 'github', 'nginx'], items: ['Linux', 'VPS'] },
    { label: 'Additional experience', keys: ['javascript', 'node', 'express', 'php'] },
  ],
};

const translations = {
  es: {
    nav: { about: "Sobre Mí", projects: "Proyectos", services: "Servicios", contact: "Contacto" },
    hero: {
      role: "Desarrollador de software",
      tagline: "Backend, productos SaaS y automatización con inteligencia artificial",
      impact_summary: "Construyo sistemas SaaS, APIs y automatizaciones con Python, FastAPI, PostgreSQL, React y Docker, integrando inteligencia artificial cuando aporta una mejora concreta al producto.",
      meta_location: "San Juan, Argentina",
      meta_availability: "Disponible para proyectos remotos",
      meta_focus: "Backend · SaaS · Automatización",
    },
    about: {
      title: "Sobre Mí",
      p1: "Productos completos.",
      p2: "Backend sólido.",
      p3: "IA con una función concreta.",
      desc: "Desarrollo software con Python, automatización e IA aplicada, desde el análisis y la base de datos hasta las pruebas y el despliegue.",
      bio_intro: "Soy Alejo Monárdez. Desarrollo aplicaciones, sistemas SaaS y automatizaciones: defino funcionalidades, modelo datos, integro servicios, construyo APIs e interfaces y preparo los proyectos para producción. Trabajo principalmente con Python, FastAPI, PostgreSQL, React y Docker. Estudio la Licenciatura en Ciencia de Datos en la Universidad Siglo 21.",
      exp_intro: "Prácticas profesionales realizadas durante mi formación:",
      exp_1: "Facultad de Ciencias Exactas: participación en tareas de revisión y mejora de una base de datos académica.",
      exp_2: "Centro Cívico de San Juan: colaboración en la revisión de un sistema de software del ámbito público.",
      current: "En mis proyectos personales y trabajos freelance convierto necesidades concretas en productos funcionales: defino el alcance, modelo los datos, desarrollo e integro componentes, realizo pruebas y preparo el despliegue.",
      connect: "Conectar",
      downloadCV: "Descargar CV",
      readMore: "Leer más",
      showLess: "Mostrar menos",
      exp_title: "02. PRÁCTICAS PROFESIONALES",
      jobs: [
          {
              company: "Facultad de Ciencias Exactas — Práctica profesional",
              description: "Participé en tareas de revisión y mejora de una base de datos académica, con foco en la organización de la información y la resolución de problemas técnicos."
          },
          {
              company: "Centro Cívico de San Juan — Práctica profesional",
              description: "Colaboré en la revisión de un sistema de software del ámbito público, relevando necesidades y documentando observaciones."
          }
      ],
      current_title: "03. PROYECTOS PERSONALES Y TRABAJOS FREELANCE"
    },
    projects: {
        title: "PROYECTOS",
        subtitle: "Productos y sistemas que puedo demostrar",
        intro: "Una selección de proyectos personales y trabajos freelance. Cada caso muestra el problema abordado, las funcionalidades implementadas y las tecnologías utilizadas.",
        viewAll: "Ver todos los proyectos"
    },
    contact: {
      touch: "Contáctame",
      talk: "Hablemos",
      footer: "San Juan, ARG",
      name: "Nombre",
      email: "Email",
      phone: "Teléfono (opcional)",
      message: "Mensaje",
      send: "Enviar Mensaje"
    }
  },
  en: {
    nav: { about: "About", projects: "Projects", services: "Services", contact: "Contact" },
    hero: {
      role: "Software developer",
      tagline: "Backend, SaaS products and applied AI automation",
      impact_summary: "I build SaaS systems, APIs, and automation with Python, FastAPI, PostgreSQL, React, and Docker, integrating AI when it provides a concrete product improvement.",
      meta_location: "San Juan, Argentina",
      meta_availability: "Available for remote projects",
      meta_focus: "Backend · SaaS · Automation",
    },
    about: {
      title: "About Me",
      p1: "Complete products.",
      p2: "Solid backend.",
      p3: "AI with a clear purpose.",
      desc: "I build software with Python, automation, and applied AI, from analysis and database design through testing and deployment.",
      bio_intro: "I’m Alejo Monárdez. I build applications, SaaS systems, and automation: I define features, model data, integrate services, build APIs and interfaces, and prepare products for production. I mainly work with Python, FastAPI, PostgreSQL, React, and Docker. I study Data Science at Universidad Siglo 21.",
      exp_intro: "Professional placements completed as part of my education:",
      exp_1: "Faculty of Exact Sciences: participation in reviewing and improving an academic database.",
      exp_2: "San Juan Civic Center: collaboration in reviewing a public-sector software system.",
      current: "In personal projects and freelance work, I turn concrete needs into working products: I define scope, model data, develop and integrate components, run tests, and prepare deployments.",
      connect: "Connect",
      downloadCV: "Download CV",
      readMore: "Read More",
      showLess: "Show Less",
      exp_title: "02. PROFESSIONAL PLACEMENTS",
      jobs: [
          {
              company: "Faculty of Exact Sciences — Professional placement",
              description: "I participated in reviewing and improving an academic database, focusing on information organization and technical problem-solving."
          },
          {
              company: "San Juan Civic Center — Professional placement",
              description: "I collaborated in reviewing a public-sector software system, gathering needs and documenting observations."
          }
      ],
      current_title: "03. PERSONAL PROJECTS AND FREELANCE WORK"
    },
    projects: {
        title: "PROJECTS",
        subtitle: "Products and systems I can demonstrate",
        intro: "A selection of personal projects and freelance work. Each case presents the problem, implemented features, and technologies used.",
        viewAll: "View all projects"
    },
    contact: {
      touch: "Get in touch",
      talk: "Let's Talk",
      footer: "San Juan, ARG",
      name: "Name",
      email: "Email",
      phone: "Phone (optional)",
      message: "Message",
      send: "Send Message"
    }
  }
};

export default function PortfolioHome() {
  const heroRef = useRef(null);
  const [lang, setLang] = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showMoreAbout, setShowMoreAbout] = useState(false); // State for mobile collapse
  const t = translations[lang];

  const { settings } = useSettings();

  useSeo({
    lang,
    canonical: 'https://alejomonardez.com/',
    title: lang === 'es'
      ? 'Alejo Monárdez | Backend, SaaS y automatización con IA'
      : 'Alejo Monárdez | Backend, SaaS & Applied AI Automation',
    description: lang === 'es'
      ? 'Desarrollo sistemas SaaS, APIs y automatizaciones con Python, FastAPI, PostgreSQL, React y Docker, integrando inteligencia artificial en productos digitales.'
      : 'I build SaaS systems, APIs, and automation with Python, FastAPI, PostgreSQL, React, and Docker, integrating AI into digital products.',
    keywords: 'desarrollador Python, backend FastAPI, automatización con IA, integración LLM, desarrollo SaaS, PostgreSQL, Docker, VPS',
  });

  const skillGroups = React.useMemo(() => STACK_GROUPS[lang].map((group) => ({
    ...group,
    skills: [
      ...(group.keys || []).map((key) => resolveSkill(key)).filter(Boolean),
      ...(group.items || []).map((name) => ({ key: name, name })),
    ],
  })), [lang]);

  // Proyectos destacados desde el backend (con fallback estático)
  const { projects: featuredProjects, loading: featuredLoading } = useProjects({ featuredOnly: true });

  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState('idle'); // idle, sending, success, error
  const [errorMessage, setErrorMessage] = useState('');


  const handleContactSubmit = async (e) => {
      e.preventDefault();
      setFormStatus('sending');
      setErrorMessage('');
      try {
          const res = await fetch(`${API_URL}/contact`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              // El campo `website` es el honeypot — invisible para humanos, bots lo llenan.
              body: JSON.stringify({ ...formData, website: '' })
          });
          const data = await res.json();
          if (res.ok && data.success) {
              setFormStatus('success');
              setFormData({ name: '', email: '', phone: '', message: '' });
              setTimeout(() => setFormStatus('idle'), 5000);
          } else {
              setFormStatus('error');
              if (res.status === 429) {
                  setErrorMessage(lang === 'es'
                      ? 'Has alcanzado el límite de mensajes por usuario. Se actualizará en 24hs.'
                      : 'You have reached the limit of messages per user. It will reset in 24 hours.');
              } else {
                  setErrorMessage(data.error || (lang === 'es' ? 'Error al enviar el mensaje' : 'Error sending message'));
              }
          }
      } catch {
          setFormStatus('error');
          setErrorMessage(lang === 'es' ? 'Error de red. Intentá de nuevo.' : 'Network error. Try again.');
      }
  };

  return (
    <div className="bg-brand-bg min-h-screen text-brand-text selection:bg-white selection:text-black cursor-none max-w-[1440px] mx-auto">
      <CustomCursor />
      {/* Barra de fondo del nav — aparece con blur al scrollear (controlada por la
          clase .is-scrolled en <html>, ver index.css y SmoothScroll). Va detrás del
          nav (z-30 vs z-40) para no romper el mix-blend-difference del texto. */}
      <div aria-hidden="true" className="nav-scrim fixed top-0 left-0 w-full h-[54px] md:h-[68px] z-30 pointer-events-none" />

      {/* Navigation - Minimal — centrado al mismo ancho máx que el contenido.
          Color plano adaptativo (sin mix-blend-difference: con la tarjeta clara
          del hero detrás, difference daba contraste inconsistente letra a letra).
          Tinta oscura por defecto (sobre la tarjeta clara) → papel claro al
          scrollear (.is-scrolled, sobre el scrim oscuro). Ver .nav-adaptive-* en index.css. */}
      <nav className="fixed top-0 left-0 w-full z-40 flex justify-center">
        <div className="hero-nav-shell w-full max-w-[1440px] px-6 md:px-12 py-3.5 md:py-5 flex justify-between items-center">
        <img src={logo} alt="Alejo Monardez" className="nav-adaptive-logo h-5 md:h-7 w-auto object-contain opacity-90" />

        <div className="flex items-center gap-4 md:gap-8">
            <div className="nav-adaptive-text hidden md:flex gap-8 text-sm font-sans tracking-widest uppercase">
            <Link to="/sobre-mi" className="hover:opacity-50 transition-opacity cursor-hover">{t.nav.about}</Link>
            <a href="#projects" className="hover:opacity-50 transition-opacity cursor-hover">{t.nav.projects}</a>
            <Link to="/servicios" className="hover:opacity-50 transition-opacity cursor-hover">{t.nav.services}</Link>
            <Link to="/contacto" className="hover:opacity-50 transition-opacity cursor-hover">{t.nav.contact}</Link>
            </div>

            {/* CV Download CTA — pill en desktop, icono circular en mobile */}
            <a
                href={settings.cv_url || "/Monardez_Alejo_2026_CV.pdf"}
                download="Monardez_Alejo_CV.pdf"
                aria-label={t.about.downloadCV}
                title={t.about.downloadCV}
                className="nav-adaptive-cta hidden md:inline-flex items-center px-4 py-1.5 rounded-full transition-all duration-300 z-50 relative cursor-hover"
            >
                <span className="text-[10px] font-sans tracking-widest uppercase font-bold">{t.about.downloadCV}</span>
            </a>
            <a
                href={settings.cv_url || "/Monardez_Alejo_2026_CV.pdf"}
                download="Monardez_Alejo_CV.pdf"
                aria-label={t.about.downloadCV}
                title={t.about.downloadCV}
                className="nav-adaptive-icon-btn md:hidden inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 z-50 relative"
            >
                <IoDocumentTextOutline className="text-[15px]" />
            </a>

            {/* Language Toggle */}
            <button
                onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                className="nav-adaptive-icon-btn text-xs rounded-full px-3 py-1 uppercase tracking-widest transition-colors z-50 relative"
            >
                {lang === 'es' ? 'EN' : 'ES'}
            </button>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="nav-adaptive-text md:hidden z-50 text-xl relative">
                {menuOpen ? <IoClose /> : <HiMenuAlt4 />}
            </button>
        </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
            <Motion.div
                initial={{ opacity: 0, y: "-100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "-100%" }}
                transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                className="fixed inset-0 bg-black z-30 flex flex-col justify-center items-center gap-8 text-3xl font-serif text-white/90"
            >
                <Link to="/sobre-mi" onClick={() => setMenuOpen(false)} className="hover:opacity-50 transition-opacity">{t.nav.about}</Link>
                <a href="#projects" onClick={() => setMenuOpen(false)} className="hover:opacity-50 transition-opacity">{t.nav.projects}</a>
                <Link to="/servicios" onClick={() => setMenuOpen(false)} className="hover:opacity-50 transition-opacity">{t.nav.services}</Link>
                <Link to="/contacto" onClick={() => setMenuOpen(false)} className="hover:opacity-50 transition-opacity">{t.nav.contact}</Link>
            </Motion.div>
        )}
      </AnimatePresence>


      {/* Initialize Smooth Scroll */}
      <SmoothScroll />

      {/* Hero — dos versiones distintas por breakpoint (no una sola adaptada):
          mobile usa la tapa de revista de doble exposición (ref: Creative Double
          Exposure Portraits / VOGUE); desktop mantiene la tarjeta de papel + banda
          de tinta original (ref: EL'DORA), sin el tratamiento de tapa. */}
      <header ref={heroRef} className="relative min-h-[100svh] md:min-h-screen flex flex-col px-0 md:px-12 pb-10 md:pt-24 md:pb-16">

        {/* Portada editorial original: una sola composición adaptada a cada ancho. */}
        <div
            className="relative w-full min-h-[100svh] overflow-hidden bg-[#efebe5] text-brand-bg md:hidden"
        >
            <span className="absolute top-5 left-4 z-20 hidden font-sans text-[8px] uppercase tracking-[0.34em] text-brand-bg/60 md:block md:top-7 md:left-8 md:text-[10px]">
                Alejo — Portfolio
            </span>

            <div
                className="hero-masthead absolute top-10 md:top-9 inset-x-0 z-0 text-center font-serif font-bold uppercase leading-[0.82] tracking-[-0.035em] text-[15.5vw] md:text-[clamp(6rem,12vw,11.5rem)] select-none whitespace-nowrap"
            >
                <span className="sr-only">Alejo </span>Monardez
            </div>

            <div className="absolute top-[14.2%] md:top-[19%] left-4 md:left-8 z-20 max-w-[112px] md:max-w-[180px] font-sans uppercase text-brand-bg">
                <p className="text-[10px] md:text-[12px] font-bold tracking-[0.26em]">Python</p>
                <span className="mt-2.5 block h-px w-full bg-brand-bg/25" aria-hidden="true" />
                <p className="mt-2 text-[7px] md:text-[9px] leading-[1.55] tracking-[0.23em] text-brand-bg/55">
                    {lang === 'es' ? <>Automatización<br />de procesos</> : <>Process<br />automation</>}
                </p>
            </div>

            <div className="absolute top-[14.2%] md:top-[19%] right-4 md:right-8 z-20 max-w-[112px] md:max-w-[180px] text-right font-sans uppercase text-brand-bg">
                <p className="text-[10px] md:text-[12px] font-bold tracking-[0.22em]">
                    {lang === 'es' ? 'IA aplicada' : 'Applied AI'}
                </p>
                <span className="mt-2.5 ml-auto block h-px w-full bg-brand-bg/25" aria-hidden="true" />
                <p className="mt-2 text-[7px] md:text-[9px] leading-[1.55] tracking-[0.23em] text-brand-bg/55">
                    {lang === 'es' ? <>Sistemas reales<br />soluciones útiles</> : <>Real systems<br />useful solutions</>}
                </p>
            </div>

            <div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 h-[79%] md:h-[88%] pointer-events-none select-none"
                style={{ aspectRatio: '1070 / 1470' }}
            >
                <picture className="relative block w-full h-full">
                    <source srcSet={heroPortraitAvif} type="image/avif" />
                    <source srcSet={heroPortraitWebp} type="image/webp" />
                    <img
                        src={heroPortrait}
                        alt="Alejo Monardez"
                        width={1070}
                        height={1470}
                        fetchPriority="high"
                        decoding="async"
                        className="w-full h-full object-contain object-bottom grayscale"
                    />
                </picture>

                <div
                    className="absolute"
                    style={{
                        top: '20%', left: '27%', width: '46%', height: '10%',
                        backgroundColor: '#a53525',
                        mixBlendMode: 'color',
                    }}
                    aria-hidden="true"
                />
                <span
                    className="absolute left-1/2 -translate-x-1/2 font-sans font-bold text-white/70 text-[7px] md:text-[9px] uppercase tracking-[0.32em]"
                    style={{ top: '29.8%' }}
                    aria-hidden="true"
                >
                    AI · DATA
                </span>
            </div>

            <a
                href="#projects"
                className="hero-scroll-cue cursor-hover absolute bottom-[12.5%] left-1/2 -translate-x-1/2 z-30 flex flex-col items-center font-sans uppercase text-white/60 hover:text-white transition-colors"
            >
                <span className="text-[6px] md:text-[8px] tracking-[0.28em]">
                    {lang === 'es' ? 'Deslizar' : 'Scroll'}
                </span>
                <span className="relative mt-2 block h-7 md:h-9 w-px bg-white/60" aria-hidden="true">
                    <span className="absolute -bottom-px -left-[3px] h-2 w-2 rotate-45 border-b border-r border-white/60" />
                </span>
            </a>

            <span
                className="absolute bottom-5 left-4 z-30 -rotate-2 font-script text-[20px] text-white/85 select-none md:bottom-8 md:left-8 md:text-4xl"
                aria-hidden="true"
            >
                Alejo Monardez
            </span>

            <p
                className="absolute bottom-5 right-4 md:bottom-8 md:right-8 z-30 max-w-[245px] md:max-w-[390px] text-right font-sans font-medium uppercase leading-[0.92] tracking-[-0.015em] text-white text-[27px] sm:text-[31px] md:text-[clamp(2rem,3.3vw,3.5rem)]"
            >
                {lang === 'es'
                    ? <>Desarrollador<br />de software</>
                    : <>Software<br />developer</>}
                <span className="sr-only"> — {t.hero.role}</span>
            </p>
        </div>

        {/* Escritorio — composición editorial restaurada de e3bbd1a. */}
        <div className="hidden md:block relative w-full bg-white text-brand-bg rounded-sm px-14 pt-10 pb-8">
            <div className="flex justify-between gap-1 font-sans text-[10px] uppercase tracking-[0.3em] text-brand-bg/60 mb-7">
                <span>{t.hero.role}</span>
                <span>{t.hero.meta_location}</span>
            </div>

            <h2 className="relative z-10 max-w-full font-sans font-extrabold uppercase leading-[0.82] tracking-[-0.03em] text-brand-bg text-[9.2vw]">
                Alejo Monardez
            </h2>

            <div className="relative mt-8 min-h-[330px] rounded-sm bg-brand-bg px-10 py-9 text-white flex flex-col justify-between">
                <div
                    className="desktop-hero-portrait absolute bottom-0 left-1/2 z-20 h-[142%] -translate-x-1/2 pointer-events-none select-none"
                    style={{ aspectRatio: '1070 / 1470' }}
                >
                    <picture className="relative block w-full h-full">
                        <source srcSet={heroPortraitAvif} type="image/avif" />
                        <source srcSet={heroPortraitWebp} type="image/webp" />
                        <img
                            src={heroPortrait}
                            alt="Alejo Monardez"
                            width={1070}
                            height={1470}
                            fetchPriority="high"
                            decoding="async"
                            className="w-full h-full object-contain object-bottom"
                        />
                    </picture>
                </div>

                <p className="relative z-10 max-w-[240px] font-sans text-[12.5px] leading-relaxed text-white/65">
                    {t.about.desc}
                </p>

                <div className="relative z-30 mt-6 flex items-end justify-between gap-4">
                    <span className="-rotate-2 select-none font-script text-4xl text-white/85" aria-hidden="true">
                        Alejo Monardez
                    </span>
                    <a
                        href="#projects"
                        className="cursor-hover shrink-0 bg-white px-9 py-4 font-sans text-[11px] font-bold uppercase tracking-[0.25em] text-brand-bg transition-colors duration-300 hover:bg-marfil"
                    >
                        {lang === 'es' ? 'Ver proyectos' : 'View projects'}
                    </a>
                </div>
            </div>
        </div>
        <div className="mx-auto mt-8 md:mt-12 w-full max-w-5xl px-5 sm:px-8 text-center">
            <p className="font-sans text-[10px] uppercase tracking-[0.28em] text-white/45">{t.hero.role}</p>
            <h1 className="mt-4 font-serif text-[clamp(2.35rem,7vw,5.75rem)] leading-[0.96] tracking-tight text-white">
                {lang === 'es' ? 'Desarrollo software para convertir procesos e ideas en productos funcionales.' : 'I build software that turns processes and ideas into working products.'}
            </h1>
            <p className="mx-auto mt-5 max-w-3xl font-sans text-sm md:text-lg leading-relaxed text-white/65">{t.hero.impact_summary}</p>
            <p className="mt-4 font-sans text-[10px] md:text-xs uppercase tracking-[0.22em] text-white/45">{t.hero.tagline}</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
                <a href="#projects" className="inline-flex min-h-11 items-center rounded-full bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-brand-bg transition-colors hover:bg-marfil focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{lang === 'es' ? 'Ver proyectos' : 'View projects'}</a>
                <Link to="/contacto" className="inline-flex min-h-11 items-center rounded-full border border-white/35 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.22em] text-white transition-colors hover:bg-white hover:text-brand-bg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">{lang === 'es' ? 'Contactarme' : 'Contact me'}</Link>
            </div>
        </div>

        {/* Colofón — metadata bajo la portada. */}
        <div
            className="mt-5 flex flex-wrap justify-center items-center gap-x-6 gap-y-1 font-sans text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-white/50"
        >
            <span>{t.hero.meta_location}</span>
            <span className="text-white/25" aria-hidden="true">—</span>
            <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/90 animate-pulse" aria-hidden="true" />
                {t.hero.meta_availability}
            </span>
            <span className="text-white/25 hidden sm:inline" aria-hidden="true">—</span>
            <span className="hidden sm:inline">{t.hero.meta_focus}</span>
        </div>

        {/* Stack agrupado por función y nivel de uso. */}
        <section aria-labelledby="stack-title" className="mt-8 md:mt-10 border-y border-white/10 py-7 md:py-9">
            <div className="mb-6 flex items-end justify-between gap-4">
                <h2 id="stack-title" className="font-serif text-2xl md:text-3xl text-white">{lang === 'es' ? 'Stack de trabajo' : 'Working stack'}</h2>
                <span className="hidden sm:block text-[9px] uppercase tracking-[0.25em] text-white/35">{lang === 'es' ? 'Ordenado por función' : 'Grouped by role'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
                {skillGroups.map((group) => (
                    <article key={group.label} className="bg-brand-bg p-5 md:p-6">
                        <h3 className="text-[10px] uppercase tracking-[0.24em] text-white/45">{group.label}</h3>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {group.skills.map((skill) => (
                                <span key={skill.key || skill.name} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[10px] text-white/75">
                                    {skill.icon && <span aria-hidden="true" className="text-sm">{skill.icon}</span>}{skill.name}
                                </span>
                            ))}
                        </div>
                    </article>
                ))}
            </div>
        </section>

      </header>

      {/* About — spread 01 sobre papel (ref: E-Type editorial) */}
      <section id="about" className="px-4 sm:px-8 md:px-12 py-8 md:py-12">
        <div className="bg-white text-brand-bg rounded-sm px-5 sm:px-8 md:px-14 py-10 md:py-16">

            {/* Cabecera del spread: titular sans gigante + folio */}
            <div className="flex items-end justify-between gap-6 border-b border-brand-bg/15 pb-6 md:pb-8 mb-10 md:mb-14">
                <h2 className="font-serif font-bold lowercase leading-[0.8] tracking-tight text-[14vw] md:text-[7vw]">
                    {t.about.title}<span className="text-brand-bg/35">.</span>
                </h2>
                <span className="font-sans font-extrabold text-brand-bg/15 text-4xl md:text-7xl leading-none select-none" aria-hidden="true">01</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14">
                {/* Columna izquierda — pull-quote en didona */}
                <div className="md:col-span-5">
                    <div className="font-serif font-bold text-3xl md:text-5xl leading-tight text-brand-bg">
                        <TextReveal key={`${lang}-p1`} className="inline-block mr-2">{t.about.p1}</TextReveal>
                        <TextReveal key={`${lang}-p2`} className="inline-block mr-2">{t.about.p2}</TextReveal>
                        <TextReveal key={`${lang}-p3`} className="inline-block">{t.about.p3}</TextReveal>
                    </div>
                </div>

                {/* Columna derecha — cuerpo editorial */}
                <div className="md:col-span-7">
                    <div className="space-y-12 font-sans text-brand-bg/70 leading-relaxed max-w-3xl">
                        <div>
                            <h4 className="text-brand-bg/60 text-xs uppercase tracking-widest mb-4">01. {t.nav.about}</h4>
                            <Motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-lg md:text-xl text-brand-bg/85"
                            >
                                {t.about.bio_intro}
                            </Motion.p>
                        </div>

                        <div className="md:hidden mt-6">
                            <button
                                onClick={() => setShowMoreAbout(!showMoreAbout)}
                                className="text-brand-bg border-b border-brand-bg text-sm uppercase tracking-widest pb-1"
                            >
                                {showMoreAbout ? t.about.showLess : t.about.readMore}
                            </button>
                        </div>

                        {/* Collapsible Content for Mobile (Always visible on Desktop) */}
                        <div className={`${showMoreAbout ? 'block' : 'hidden'} md:block space-y-12`}>
                            <div>
                                <h4 className="text-brand-bg/60 text-xs uppercase tracking-widest mb-4">{t.about.exp_title}</h4>
                                <div className="border-l border-brand-bg/20 pl-6 space-y-6">
                                    {t.about.jobs.map((job, i) => (
                                        <Motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8, delay: 0.5 + (i * 0.1) }}
                                        >
                                            <h5 className="text-brand-bg text-sm mb-1 font-bold">{job.company}</h5>
                                            <p className="text-sm md:text-base opacity-80">{job.description}</p>
                                        </Motion.div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-brand-bg/60 text-xs uppercase tracking-widest mb-4">{t.about.current_title}</h4>
                                <Motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.8 }}
                                    className="text-brand-bg font-serif text-lg italic leading-relaxed"
                                >
                                    {t.about.current}
                                </Motion.p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12">
                        <h4 className="text-brand-bg mb-6 uppercase text-xs tracking-[0.2em] border-b border-brand-bg/20 pb-2">{t.about.connect}</h4>
                        <SocialLinks
                            tone="ink"
                            extra={
                                <a
                                    href={settings.cv_url || "/Monardez_Alejo_2026_CV.pdf"}
                                    download="Monardez_Alejo_CV.pdf"
                                    className="group flex items-center gap-3 px-6 py-3 bg-brand-bg text-white border border-brand-bg rounded-full hover:bg-transparent hover:text-brand-bg transition-all duration-300 ml-0 md:ml-auto"
                                >
                                    <span className="uppercase tracking-widest text-xs font-bold">{t.about.downloadCV}</span>
                                </a>
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Projects — spread 02 sobre papel: filas alternadas imagen/descripción,
          TODAS visibles de un vistazo (sin carrusel — el objetivo de un
          portafolio es que se lea rápido, no que haya que hacer click para
          ver el siguiente). Intercala imagen izquierda/derecha por fila
          (ref: UI_UX.jpg) para dar ritmo editorial sin romper consistencia:
          mismo marco, mismo aspect-ratio, mismas tipografías en las 5 filas. */}
      <section id="projects" className="px-4 sm:px-8 md:px-12 py-8 md:py-12">
        <div className="bg-white text-brand-bg rounded-sm px-5 sm:px-8 md:px-14 py-10 md:py-16">

            {/* Cabecera del spread — título + subtítulo + CTA a "todos los proyectos" */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-brand-bg/15 pb-6 md:pb-8 mb-12 md:mb-16">
                <div>
                    <span className="font-sans font-extrabold text-brand-bg/15 text-4xl md:text-6xl leading-none select-none block mb-3 md:mb-5" aria-hidden="true">02</span>
                    <h2 className="font-serif font-bold lowercase leading-[0.8] tracking-tight text-[clamp(2.75rem,13vw,4.5rem)] md:text-[clamp(2.75rem,4.2vw,4.75rem)]">
                        {t.projects.title}<span className="text-brand-bg/35">.</span>
                    </h2>
                    <p className="mt-4 font-sans text-xs uppercase tracking-[0.2em] text-brand-bg/50">
                        {t.projects.subtitle}
                    </p>
                    <p className="mt-4 max-w-2xl font-sans text-sm leading-relaxed text-brand-bg/65 normal-case tracking-normal">
                        {t.projects.intro}
                    </p>
                </div>
                <Link
                    to="/proyectos"
                    className="group shrink-0 inline-flex items-center gap-4 px-7 py-3.5 bg-brand-bg text-white border border-brand-bg rounded-full hover:bg-transparent hover:text-brand-bg transition-all duration-500 text-[10px] uppercase tracking-[0.3em] font-bold"
                >
                    <span>{t.projects.viewAll}</span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform duration-300">
                        <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </Link>
            </div>

            {/* Filas — una por proyecto destacado (máx. 5), imagen y descripción
                intercaladas: fila 1 imagen a la derecha, fila 2 al revés, etc. */}
            <div className="space-y-12 md:space-y-24">
                {featuredLoading
                    ? Array.from({ length: 3 }).map((_, i) => <FeaturedRowSkeleton key={i} imageRight={i % 2 === 0} />)
                    : featuredProjects.slice(0, 5).map((project, idx) => {
                    const cover = (Array.isArray(project.images) && project.images[0]) || project.image || null;
                    const suffix = lang === 'en' ? '_en' : '';
                    const pick = (base) => project[`${base}${suffix}`] || project[base] || '';
                    const statusLabel = {
                        production: lang === 'es' ? 'Producción' : 'Production',
                        demo: 'Demo',
                        wip: lang === 'es' ? 'En desarrollo' : 'In dev',
                    }[project.status || 'production'];
                    const imageRight = idx % 2 === 0;

                    return (
                        <Motion.div
                            key={project.id || project.slug || idx}
                            initial={{ opacity: 0, y: 28 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.15 }}
                            transition={{ duration: 0.6 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
                        >
                            {/* Lámina — hairline + b&n -> color al hover. Fondo desenfocado
                                (cover) + imagen completa (contain) sobre el mismo marco
                                4:3 en las 5 filas: verticales y horizontales caben igual,
                                sin recorte ni tamaños irregulares. En mobile va a sangre
                                (sin el marco/padding) para que la imagen tenga presencia
                                real y no quede como una miniatura perdida en una caja. */}
                            <button
                                type="button"
                                onClick={() => setSelectedProject(project)}
                                className={`group block w-full text-left cursor-hover ${imageRight ? 'md:order-2' : 'md:order-1'}`}
                            >
                                <div className="md:border md:border-brand-bg/20 bg-brand-bg/[0.03] md:p-2 -mx-5 sm:-mx-8 md:mx-0">
                                    <div className="relative aspect-[16/11] md:aspect-[4/3] overflow-hidden bg-brand-bg/5">
                                        {cover ? (
                                            <SmartImage src={cover} alt={project.title} eager={idx === 0} />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-brand-bg/25 text-[10px] uppercase tracking-widest">
                                                {lang === 'es' ? 'Sin imagen' : 'No image'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="mt-3 font-sans text-[9px] uppercase tracking-[0.3em] text-brand-bg/55">
                                    — {String(idx + 1).padStart(2, '0')} · {project.category || (lang === 'es' ? 'Proyecto' : 'Project')}
                                </p>
                            </button>

                            {/* Descripción */}
                            <div className={imageRight ? 'md:order-1' : 'md:order-2'}>
                                <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-brand-bg/60 mb-2">
                                    {project.category} · {statusLabel}
                                </p>
                                <h3 className="font-serif text-3xl md:text-4xl leading-tight">
                                    {project.title}
                                </h3>
                                <div className="w-10 h-px bg-brand-bg/25 my-4 md:my-5" />
                                <p className="font-sans text-sm text-brand-bg/70 leading-relaxed line-clamp-3">
                                    {pick('description_short') || pick('description')}
                                </p>

                                {Array.isArray(project.tech) && project.tech.length > 0 && (
                                    <div className="mt-5 flex flex-wrap gap-2">
                                        {project.tech.slice(0, 5).map((key, i) => {
                                            const s = resolveSkill(key);
                                            if (!s) return null;
                                            return (
                                                <span key={i} className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.15em] border border-brand-bg/20 rounded-full pl-2 pr-2.5 py-1 text-brand-bg/65">
                                                    {s.icon && <span className="text-xs leading-none">{s.icon}</span>}
                                                    {s.name}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="mt-6 flex flex-wrap items-center gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedProject(project)}
                                        className="cursor-hover inline-flex items-center gap-2 bg-brand-bg text-white px-6 py-3 rounded-full text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-transparent hover:text-brand-bg border border-brand-bg transition-colors duration-300"
                                    >
                                        {lang === 'es' ? 'Caso de estudio' : 'Case study'}
                                    </button>
                                    {project.demo_url && (
                                        <a
                                            href={project.demo_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="cursor-hover font-sans text-[10px] uppercase tracking-[0.25em] text-brand-bg/60 border-b border-brand-bg/30 pb-0.5 hover:text-brand-bg hover:border-brand-bg transition-colors"
                                        >
                                            {lang === 'es' ? 'Ver proyecto ↗' : 'View project ↗'}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </Motion.div>
                    );
                })}
            </div>
        </div>
      </section>

      <ProjectModal
          project={selectedProject}
          lang={lang}
          onClose={() => setSelectedProject(null)}
      />

      {/* Contact — spread 03 sobre papel; titular con punto final (ref: "less.") */}
      <section id="contact" className="px-4 sm:px-8 md:px-12 py-8 md:py-12">
        <div className="bg-white text-brand-bg rounded-sm px-5 sm:px-8 md:px-14 py-10 md:py-16">

            {/* Cabecera del spread */}
            <div className="flex items-end justify-between gap-6 border-b border-brand-bg/15 pb-6 md:pb-8 mb-4">
                <h2 className="font-serif font-bold lowercase leading-[0.8] tracking-tight text-[14vw] md:text-[7vw]">
                    {t.contact.talk}<span className="text-brand-bg/35">.</span>
                </h2>
                <span className="font-sans font-extrabold text-brand-bg/15 text-4xl md:text-7xl leading-none select-none" aria-hidden="true">03</span>
            </div>

        <div className="max-w-2xl mx-auto text-center">
            <p className="text-brand-bg/60 text-sm md:text-base font-sans mb-8 mt-8 max-w-lg mx-auto">
                {lang === 'es' ? 'Contame qué necesitás construir o automatizar.' : 'Tell me what you need to build or automate.'}
            </p>

            <form className="w-full space-y-8 mt-6" onSubmit={handleContactSubmit}>
                {/* Honeypot: invisible para humanos. Si un bot lo completa, el backend lo descarta. */}
                <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                    style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none', height: 0, width: 0 }}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        placeholder={t.contact.name}
                        className="w-full bg-transparent border-b border-brand-bg/25 py-3 text-sm text-brand-bg focus:outline-none focus:border-brand-bg transition-all duration-300 placeholder:text-brand-bg/35 font-sans"
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        placeholder={t.contact.email}
                        className="w-full bg-transparent border-b border-brand-bg/25 py-3 text-sm text-brand-bg focus:outline-none focus:border-brand-bg transition-all duration-300 placeholder:text-brand-bg/35 font-sans"
                    />
                </div>

                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder={t.contact.phone}
                    className="w-full bg-transparent border-b border-brand-bg/25 py-3 text-sm text-brand-bg focus:outline-none focus:border-brand-bg transition-all duration-300 placeholder:text-brand-bg/35 font-sans"
                />

                <textarea
                    rows="4"
                    name="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    placeholder={t.contact.message}
                    className="w-full bg-transparent border-b border-brand-bg/25 py-3 text-sm text-brand-bg focus:outline-none focus:border-brand-bg transition-all duration-300 placeholder:text-brand-bg/35 font-sans resize-none"
                ></textarea>

                <div className="flex justify-end pt-4 items-center gap-4">
                    {formStatus === 'success' && <span role="status" className="text-emerald-700 text-xs uppercase tracking-widest">{lang === 'es' ? 'Mensaje enviado' : 'Message sent'}</span>}
                    {formStatus === 'error' && <span className="text-red-600 text-xs tracking-wide">{errorMessage}</span>}
                    {formStatus === 'sending' && <span role="status" className="text-brand-bg/50 text-xs uppercase tracking-widest">{lang === 'es' ? 'Enviando…' : 'Sending…'}</span>}

                    <button
                        type="submit"
                        disabled={formStatus === 'sending'}
                        className="uppercase text-[10px] tracking-[0.2em] bg-brand-bg text-white border border-brand-bg px-8 py-3 rounded-full hover:bg-transparent hover:text-brand-bg transition-all duration-300 disabled:opacity-50"
                    >
                        {t.contact.send}
                    </button>
                </div>
            </form>

            <SocialLinks tone="ink" className="mt-16 justify-center" />
        </div>
        </div>

        {/* Colofón — sobre la tinta, fuera de la página de papel */}
        <footer className="mt-10 md:mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[10px] text-white/30 uppercase tracking-widest gap-4">
            <span>© 2026 Alejo Monardez.</span>
            <FooterEmail />
        </footer>
      </section>

    </div>
  )
}

/**
 * Email del footer — lee desde settings. Si no hay valor configurado, no renderiza nada.
 */
function FooterEmail() {
    const { settings } = useSettings();

    const href = resolveSocialHref('email', settings.social_email);
    if (!href || !settings.social_email) return null;
    return (
        <a href={href} className="hover:text-white transition-colors">
            {settings.social_email.replace(/^mailto:/, '')}
        </a>
    );
}



