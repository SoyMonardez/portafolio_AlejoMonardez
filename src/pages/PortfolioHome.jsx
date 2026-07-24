import React, { useEffect, useRef, useState } from 'react';
import {
  SiReact, SiTailwindcss, SiJavascript, SiHtml5, SiCss3,
  SiNodedotjs, SiExpress, SiPhp, SiPython, SiMysql,
  SiDocker, SiGit, SiGithub, SiWhatsapp, SiGmail
} from "react-icons/si";
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
import { motion, AnimatePresence } from 'framer-motion';
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

const translations = {
  es: {
    nav: { about: "Sobre Mí", projects: "Proyectos", services: "Servicios", contact: "Contacto" },
    hero: {
      role: "Desarrollador de software | Python, automatización e IA aplicada",
      tagline: "Sistemas claros. Automatización útil. Productos en producción.",
      impact_summary: "Desarrollo sistemas SaaS y aplicaciones web con asistencia de herramientas de inteligencia artificial. Analizo la necesidad, estructuro el sistema, diseño la base de datos, defino funcionalidades, integro APIs, pruebo el producto y lo despliego en Docker y VPS.",
      meta_location: "San Juan, Argentina",
      meta_availability: "Disponible para proyectos remotos",
      meta_focus: "Python · IA · SaaS",
    },
    about: {
      title: "Sobre Mí",
      p1: "Software aplicado.",
      p2: "Automatización útil.",
      p3: "Productos demostrables.",
      desc: "Desarrollo software con Python, automatización e IA aplicada, desde el análisis y la base de datos hasta las pruebas y el despliegue.",
      bio_intro: "Soy estudiante de primer año de la Licenciatura en Ciencia de Datos y desarrollo sistemas SaaS y aplicaciones web. Trabajo con Python, FastAPI, PostgreSQL, React, JavaScript, Docker, Git, Linux y VPS; también integro LLM, RAG, chatbots, automatizaciones y generación de contenido. Actualmente fortalezco mi capacidad para escribir, depurar y probar código Python de manera autónoma.",
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
              description: "Colaboré en la revisión de un sistema de software del ámbito público, relevando necesidades, documentando observaciones y proponiendo mejoras."
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
      role: "Software Developer | Python, Automation & Applied AI",
      tagline: "Clear systems. Useful automation. Production-ready products.",
      impact_summary: "I build SaaS systems and web applications with the assistance of artificial intelligence tools. I analyze needs, structure the system, design the database, define features, integrate APIs, test the product, and deploy it with Docker and VPS infrastructure.",
      meta_location: "San Juan, Argentina",
      meta_availability: "Available for remote projects",
      meta_focus: "Python · AI · SaaS",
    },
    about: {
      title: "About Me",
      p1: "Applied software.",
      p2: "Useful automation.",
      p3: "Demonstrable products.",
      desc: "I build software with Python, automation, and applied AI, from analysis and database design through testing and deployment.",
      bio_intro: "I am a first-year Data Science undergraduate student and I build SaaS systems and web applications. I work with Python, FastAPI, PostgreSQL, React, JavaScript, Docker, Git, Linux, and VPS infrastructure; I also integrate LLMs, RAG, chatbots, automation, and content generation. I am currently strengthening my ability to write, debug, and test Python code independently.",
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
              description: "I collaborated in reviewing a public-sector software system, gathering needs, documenting observations, and proposing improvements."
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
      ? 'Desarrollador Python e IA aplicada | Alejo Monardez'
      : 'Python & Applied AI Developer | Alejo Monardez',
    description: lang === 'es'
      ? 'Portfolio de Alejo Monardez: sistemas SaaS, backend con Python, automatizaciones, integraciones de IA, APIs y despliegues en Docker y VPS.'
      : 'Alejo Monardez portfolio: SaaS systems, Python backends, automation, AI integrations, APIs, and deployments with Docker and VPS infrastructure.',
    keywords: 'desarrollador Python, backend FastAPI, automatización con IA, integración LLM, desarrollo SaaS, PostgreSQL, Docker, VPS',
  });

  const resolvedSkills = React.useMemo(() => {
    let keys = ['html', 'css', 'javascript', 'react', 'tailwind', 'node', 'express', 'php', 'python', 'mysql', 'docker', 'git', 'github'];
    if (settings && settings.skills_list) {
      try {
        const parsed = JSON.parse(settings.skills_list);
        if (Array.isArray(parsed)) {
          keys = parsed;
        }
      } catch (e) {
        console.warn('Failed to parse skills_list setting:', e);
      }
    }
    return keys.map(key => resolveSkill(key)).filter(Boolean);
  }, [settings]);

  // Proyectos destacados desde el backend (con fallback estático)
  const { projects: featuredProjects, loading: featuredLoading } = useProjects({ featuredOnly: true });

  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [formStatus, setFormStatus] = useState('idle'); // idle, sending, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

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
      } catch (error) {
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
        <div className="w-full max-w-[1440px] px-6 md:px-12 py-3.5 md:py-5 flex justify-between items-center">
        <img src={logo} alt="Alejo Monardez" className="nav-adaptive-logo h-5 md:h-7 w-auto object-contain opacity-90" />

        <div className="flex items-center gap-4 md:gap-8">
            <div className="nav-adaptive-text hidden md:flex gap-8 text-sm font-sans tracking-widest uppercase">
            <a href="#about" className="hover:opacity-50 transition-opacity cursor-hover">{t.nav.about}</a>
            <a href="#projects" className="hover:opacity-50 transition-opacity cursor-hover">{t.nav.projects}</a>
            <Link to="/servicios" className="hover:opacity-50 transition-opacity cursor-hover">{t.nav.services}</Link>
            <a href="#contact" className="hover:opacity-50 transition-opacity cursor-hover">{t.nav.contact}</a>
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
            <motion.div
                initial={{ opacity: 0, y: "-100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "-100%" }}
                transition={{ duration: 0.5, ease: [0.76, 0, 0.24, 1] }}
                className="fixed inset-0 bg-black z-30 flex flex-col justify-center items-center gap-8 text-3xl font-serif text-white/90"
            >
                <a href="#about" onClick={() => setMenuOpen(false)} className="hover:opacity-50 transition-opacity">{t.nav.about}</a>
                <a href="#projects" onClick={() => setMenuOpen(false)} className="hover:opacity-50 transition-opacity">{t.nav.projects}</a>
                <Link to="/servicios" onClick={() => setMenuOpen(false)} className="hover:opacity-50 transition-opacity">{t.nav.services}</Link>
                <a href="#contact" onClick={() => setMenuOpen(false)} className="hover:opacity-50 transition-opacity">{t.nav.contact}</a>
            </motion.div>
        )}
      </AnimatePresence>


      {/* Initialize Smooth Scroll */}
      <SmoothScroll />

      {/* Hero — dos versiones distintas por breakpoint (no una sola adaptada):
          mobile usa la tapa de revista de doble exposición (ref: Creative Double
          Exposure Portraits / VOGUE); desktop mantiene la tarjeta de papel + banda
          de tinta original (ref: EL'DORA), sin el tratamiento de tapa. */}
      <header ref={heroRef} className="relative min-h-[100svh] md:min-h-screen flex flex-col justify-center px-4 sm:px-8 md:px-12 pt-20 md:pt-24 pb-10 md:pb-16">

        {/* ===== Mobile — tapa de revista, doble exposición ===== */}
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="md:hidden relative w-full flex-1 min-h-[74svh] bg-white text-brand-bg rounded-sm overflow-hidden"
        >
            {/* Fila superior — kicker y rol, como el "FASHION" de la tapa */}
            <div className="absolute top-0 inset-x-0 z-30 flex justify-between items-center px-5 sm:px-8 md:px-12 pt-5 md:pt-6 font-sans text-[8.5px] md:text-[10px] uppercase tracking-[0.3em] text-brand-bg/60">
                <span>Alejo — Portfolio</span>
                <span className="hidden sm:block">{t.hero.role}</span>
            </div>

            {/* Masthead — didone gigante, el retrato lo pisa por delante */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}
                className="absolute top-10 md:top-12 inset-x-0 z-0 text-center font-serif font-bold uppercase leading-[0.85] tracking-[-0.01em] text-[18.5vw] md:text-[clamp(5rem,11vw,10.5rem)] select-none"
            >
                <span className="sr-only">Alejo </span>Monardez
            </motion.h1>

            {/* Retrato — B&N, anclado al borde inferior, delante del masthead.
                aspect-ratio explícito (1070:1470, el de la foto real) para que el
                parche de los ojos quede anclado sea cual sea el viewport; si en
                pantallas muy angostas sobra ancho, overflow-hidden de la tapa lo
                recorta simétrico (gesto de tapa, nunca scroll horizontal). */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.4, delay: 0.45, ease: 'easeOut' }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 h-[81%] md:h-[86%] pointer-events-none select-none"
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

                {/* Parche "doble exposición" — único gesto de color de la tapa.
                    mix-blend-mode: color tiñe la franja de los ojos preservando el
                    detalle del B&N (ref: bloque rojo "CATCHY" de la tapa VOGUE). */}
                <div
                    className="absolute"
                    style={{
                        top: '20%', left: '27%', width: '46%', height: '10%',
                        backgroundColor: '#9A3324',
                        mixBlendMode: 'color',
                    }}
                    aria-hidden="true"
                />
                <span
                    className="absolute left-1/2 -translate-x-1/2 font-sans font-bold text-white text-[8px] md:text-[10px] uppercase tracking-[0.3em]"
                    style={{ top: '30.5%' }}
                    aria-hidden="true"
                >
                    Python · IA
                </span>
            </motion.div>

            {/* Cover-line izquierda — nº de proyectos (ref: "27 different styles") */}
            {featuredProjects.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="absolute left-5 sm:left-8 md:left-12 top-[34%] z-20"
                >
                    <span className="font-serif font-bold leading-none text-6xl md:text-8xl">
                        {String(featuredProjects.length).padStart(2, '0')}
                    </span>
                    <p className="mt-2 font-sans text-[9px] md:text-[11px] uppercase tracking-[0.25em] text-brand-bg/75 leading-snug">
                        {lang === 'es' ? <>proyectos<br />destacados</> : <>featured<br />projects</>}
                    </p>
                </motion.div>
            )}

            {/* Cover-line derecha — año y lugar (ref: "20 / 26 · FEBRUARY") */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute right-5 sm:right-8 md:right-12 top-[27%] z-20 text-right"
            >
                <span className="block font-serif font-bold leading-[0.9] text-4xl md:text-6xl">20<br />26</span>
                <p className="mt-2 font-sans text-[9px] md:text-[11px] uppercase tracking-[0.25em] text-brand-bg/75">San Juan, AR</p>
            </motion.div>

            {/* Firma — abajo a la izquierda. mix-blend-difference: blanca sobre el
                sweater negro, tinta sobre el papel — legible caiga donde caiga. */}
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="absolute bottom-6 left-5 sm:left-8 md:bottom-10 md:left-12 z-20 font-script text-2xl md:text-4xl -rotate-2 text-white mix-blend-difference select-none"
                aria-hidden="true"
            >
                Alejo Monardez
            </motion.span>

            {/* CTA — cover-line grande (ref: "LOOK FAMOUS"), mismo blend */}
            <motion.a
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.05 }}
                href="#projects"
                className="cursor-hover absolute bottom-5 right-5 sm:right-8 md:bottom-8 md:right-12 z-20 text-right font-sans font-light uppercase leading-[0.95] tracking-[0.02em] text-white mix-blend-difference text-[8.5vw] md:text-[3.2vw] hover:opacity-70 transition-opacity"
            >
                {lang === 'es' ? <>Ver<br />Proyectos</> : <>View<br />Projects</>}
            </motion.a>
        </motion.div>

        {/* ===== Desktop — tarjeta de papel + banda de tinta (ref: EL'DORA) ===== */}
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="hidden md:block relative w-full bg-white text-brand-bg rounded-sm px-14 pt-10 pb-8"
        >
            {/* Fila superior — rol y ubicación en tinta suave */}
            <div className="flex justify-between gap-1 font-sans text-[10px] uppercase tracking-[0.3em] text-brand-bg/60 mb-7">
                <span>{t.hero.role}</span>
                <span>{t.hero.meta_location}</span>
            </div>

            {/* Wordmark — tinta pura, pesado, borde a borde */}
            <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.2, 0.65, 0.3, 0.9] }}
                className="relative z-10 font-sans font-extrabold uppercase leading-[0.82] tracking-[-0.03em] text-brand-bg text-[9.2vw] max-w-full"
            >
                Alejo Monardez
            </motion.h2>

            {/* Banda de tinta — bio, firma y CTA; el retrato emerge por encima */}
            <div className="relative mt-8 bg-brand-bg text-white rounded-sm min-h-[330px] flex flex-col justify-between px-10 py-9">

                {/* Retrato — centrado, sobresale de la banda y pisa el nombre.
                    aspect-ratio explícito (1070:1470, el de la foto real): el ancho del
                    wrapper se deriva matemáticamente de la altura, sin depender del
                    shrink-to-fit del navegador. */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 h-[142%] pointer-events-none select-none"
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
                </motion.div>

                {/* Bio corta — arriba a la izquierda */}
                <p className="relative z-10 max-w-[240px] font-sans text-[12.5px] leading-relaxed text-white/65">
                    {t.about.desc}
                </p>

                {/* Fila inferior — firma a la izquierda, CTA a la derecha */}
                <div className="relative z-30 flex items-end justify-between gap-4 mt-6">
                    <span className="font-script text-4xl text-white/85 -rotate-2 select-none" aria-hidden="true">
                        Alejo Monardez
                    </span>
                    <a
                        href="#projects"
                        className="cursor-hover shrink-0 bg-white text-brand-bg font-sans text-[11px] uppercase tracking-[0.25em] font-bold px-9 py-4 hover:bg-marfil transition-colors duration-300"
                    >
                        {lang === 'es' ? 'Ver proyectos' : 'View projects'}
                    </a>
                </div>
            </div>
        </motion.div>

        {/* Colofón — metadata bajo la tapa, como pie de foto */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
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
        </motion.div>

        {/* Strip de skills — banda editorial bajo la tapa, único y responsive */}
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.1 }}
            className="mt-8 md:mt-10 border-y border-white/10 py-5 md:py-6 flex flex-wrap justify-center gap-x-5 gap-y-4 md:gap-x-9"
        >
            {resolvedSkills.map((skill, index) => (
                <div key={index} className="flex flex-col items-center gap-1 group cursor-default">
                    <span className="text-[19px] md:text-2xl text-white/40 group-hover:text-white transition-colors duration-300">
                        {skill.icon}
                    </span>
                    <span className="text-[7.5px] md:text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors duration-300 whitespace-nowrap">
                        {skill.name}
                    </span>
                </div>
            ))}
        </motion.div>

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
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-lg md:text-xl text-brand-bg/85"
                            >
                                {t.about.bio_intro}
                            </motion.p>
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
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8, delay: 0.5 + (i * 0.1) }}
                                        >
                                            <h5 className="text-brand-bg text-sm mb-1 font-bold">{job.company}</h5>
                                            <p className="text-sm md:text-base opacity-80">{job.description}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="text-brand-bg/60 text-xs uppercase tracking-widest mb-4">{t.about.current_title}</h4>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.8 }}
                                    className="text-brand-bg font-serif text-lg italic leading-relaxed"
                                >
                                    {t.about.current}
                                </motion.p>
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
                        <motion.div
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
                        </motion.div>
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
                {lang === 'es' ? 'Construyamos algo excepcional.' : 'Let\'s build something exceptional.'}
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
                    {formStatus === 'success' && <span className="text-emerald-700 text-xs uppercase tracking-widest">Message Sent</span>}
                    {formStatus === 'error' && <span className="text-red-600 text-xs tracking-wide">{errorMessage}</span>}
                    {formStatus === 'sending' && <span className="text-brand-bg/50 text-xs uppercase tracking-widest">Sending...</span>}

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


