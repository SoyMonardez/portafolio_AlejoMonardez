import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  SiReact, SiTailwindcss, SiJavascript, SiHtml5, SiCss3,
  SiNodedotjs, SiExpress, SiPhp, SiPython, SiMysql,
  SiDocker, SiGit, SiGithub, SiWhatsapp, SiGmail
} from "react-icons/si";
import { HiMenuAlt4 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { Link } from 'react-router-dom';
import HeroTitle from '../components/HeroTitle';
import NoiseOverlay from '../components/NoiseOverlay';
import CustomCursor from '../components/CustomCursor';
import SmoothScroll from '../components/SmoothScroll';
import TextReveal from '../components/TextReveal';
import ProjectShowcase from '../components/ProjectShowcase';
import SocialLinks from '../components/SocialLinks';
import { useSettings } from '../data/useSettings';
import { resolveSocialHref } from '../data/socialLinks';
import { motion, AnimatePresence } from 'framer-motion';
import heroPortrait from '../assets/me/hero_portrait.png';
import '../App.css';
import { API_URL } from '../config';
import logo from '../assets/logo.png';
import { useProjects } from '../data/useProjects';
import { useLang } from '../data/useLang';
import { resolveSkill } from '../data/skills';

gsap.registerPlugin(ScrollTrigger);

// Dynamic skills loaded from DB settings

const translations = {
  es: {
    nav: { about: "Sobre Mí", projects: "Proyectos", contact: "Contacto" },
    hero: {
      role: "Software Engineer | AI & Data Science Specialist",
      tagline: "Código limpio. Estética cruda. Soluciones escalables.",
      impact_summary: "Ingeniería de software de alto rendimiento aplicada a la toma de decisiones algorítmica. Diseño e implemento arquitecturas de datos y soluciones de IA que optimizan infraestructuras críticas, automatizan operaciones comerciales y transforman flujos gubernamentales en activos medibles."
    },
    about: {
      title: "Sobre Mí",
      p1: "Infraestructuras Resilientes.", 
      p2: "Gobernanza de Datos.", 
      p3: "Decisiones Algorítmicas.",
      desc: "Integro ingeniería de software de alto rendimiento con inteligencia algorítmica para maximizar el valor operativo en Pymes, sector público y plataformas escalables.",
      bio_intro: "Software Engineer enfocado en Inteligencia Artificial y Ciencia de Datos. Especializado en traducir requerimientos comerciales complejos en arquitecturas de datos optimizadas y modelos predictivos de alto rendimiento. Automatización inteligente. Escalabilidad absoluta.",
      exp_intro: "Trayectoria en ingeniería de software y optimización de sistemas críticos de alta disponibilidad:",
      exp_1: "Facultad de Ciencias Exactas: Optimización de infraestructura de datos y resolución de cuellos de botella técnicos.",
      exp_2: "Centro Cívico de San Juan: Auditoría y modernización de arquitecturas de software críticas.",
      current: "Diseño y desarrollo productos SaaS desde la base: arquitectura de bases de datos robustas, lógica de automatización y UI/UX de alta conversión.",
      connect: "Conectar",
      downloadCV: "Descargar CV",
      readMore: "Leer más",
      showLess: "Mostrar menos",
      exp_title: "02. EXPERIENCIA TÉCNICA CONSULTIVA",
      jobs: [
          {
              company: "Facultad de Ciencias Exactas (Data Governance & Infrastructure)",
              description: "Lideré la optimización de la infraestructura de base de datos de alto rendimiento, erradicando cuellos de botella técnicos en sistemas académicos críticos de alta disponibilidad."
          },
          {
              company: "Centro Cívico San Juan (Governmental Solutions Architecture)",
              description: "Audité y modernicé infraestructuras de software críticas del gobierno provincial, garantizando la operatividad, seguridad y resiliencia de servicios digitales de alta demanda."
          }
      ],
      current_title: "03. DESARROLLO DE PRODUCTO END-TO-END"
    },
    projects: {
        title: "PROYECTOS",
        subtitle: "Trabajos Destacados",
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
    nav: { about: "About", projects: "Projects", contact: "Contact" },
    hero: {
      role: "Software Engineer | AI & Data Science Specialist",
      tagline: "Clean code. Raw aesthetics. Scalable solutions.",
      impact_summary: "High-performance software engineering applied to algorithmic decision-making. I design and implement data architectures and AI solutions that optimize critical infrastructures, automate commercial operations, and transform government workflows into measurable assets."
    },
    about: {
      title: "About Me",
      p1: "Resilient Infrastructure.", 
      p2: "Data Governance.", 
      p3: "Algorithmic Decisions.",
      desc: "I integrate high-performance software engineering with algorithmic intelligence to maximize operational value across SMEs, public sectors, and scalable platforms.",
      bio_intro: "Software Engineer focused on AI and Data Science. Specialized in translating complex business requirements into optimized data architectures and high-performance predictive models. Intelligent automation. Absolute scalability.",
      exp_intro: "Track record in software engineering and optimizing high-availability critical systems:",
      exp_1: "Faculty of Exact Sciences: Optimization of data infrastructure and technical bottleneck resolution.",
      exp_2: "San Juan Civic Center: Auditing and modernization of critical software architectures.",
      current: "I design and build SaaS products from the ground up: robust relational database design, automation logic, and high-conversion UI/UX.",
      connect: "Connect",
      downloadCV: "Download CV",
      readMore: "Read More",
      showLess: "Show Less",
      exp_title: "02. CONSULTATIVE TECHNICAL EXPERIENCE",
      jobs: [
          {
              company: "Faculty of Exact Sciences (Data Governance & Infrastructure)",
              description: "Spearheaded database infrastructure optimizations, eliminating technical bottlenecks in critical, high-availability academic platforms."
          },
          {
              company: "San Juan Civic Center (Governmental Solutions Architecture)",
              description: "Audited and modernized critical legacy software architectures for the provincial government, ensuring reliability and security for high-demand civic portals."
          }
      ],
      current_title: "03. END-TO-END PRODUCT DEVELOPMENT"
    },
    projects: {
        title: "PROJECTS",
        subtitle: "Featured Work",
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
  const [showMoreAbout, setShowMoreAbout] = useState(false); // State for mobile collapse
  const t = translations[lang];

  const { settings } = useSettings();

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
  const { projects: featuredProjects } = useProjects({ featuredOnly: true });

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
    <div className="bg-brand-bg min-h-screen text-brand-text selection:bg-white selection:text-black cursor-none">
      <CustomCursor />
      
      {/* Navigation - Minimal */}
      {/* Navigation - Minimal */}
      <nav className="fixed top-0 left-0 w-full p-6 md:p-12 flex justify-between items-center z-40 mix-blend-difference">
        <img src={logo} alt="Alejo Monardez" className="h-6 md:h-10 w-auto object-contain invert brightness-0 opacity-90" />
        
        <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:flex gap-8 text-sm font-sans tracking-widest uppercase">
            <a href="#about" className="hover:opacity-50 transition-opacity cursor-hover">{t.nav.about}</a>
            <a href="#projects" className="hover:opacity-50 transition-opacity cursor-hover">{t.nav.projects}</a>
            <a href="#contact" className="hover:opacity-50 transition-opacity cursor-hover">{t.nav.contact}</a>
            </div>
            
            {/* CV Download CTA */}
            <a
                href={settings.cv_url || "/Monardez_Alejo_2026_CV.pdf"}
                download="Monardez_Alejo_CV.pdf"
                className="px-4 py-1.5 border border-white text-black bg-white rounded-full hover:bg-transparent hover:text-white transition-all duration-300 z-50 relative shadow-[0_0_15px_rgba(255,255,255,0.12)] cursor-hover"
            >
                <span className="text-[10px] font-sans tracking-widest uppercase font-bold">{t.about.downloadCV}</span>
            </a>

            {/* Language Toggle */}
            <button 
                onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
                className="text-xs border border-white/20 rounded-full px-3 py-1 uppercase tracking-widest hover:bg-white hover:text-black transition-colors z-50 relative"
            >
                {lang === 'es' ? 'EN' : 'ES'}
            </button>

            {/* Mobile Menu Toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden z-50 text-2xl mix-blend-difference relative">
                {menuOpen ? <IoClose /> : <HiMenuAlt4 />}
            </button>
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
                <a href="#contact" onClick={() => setMenuOpen(false)} className="hover:opacity-50 transition-opacity">{t.nav.contact}</a>
            </motion.div>
        )}
      </AnimatePresence>


      {/* Initialize Smooth Scroll */}
      <SmoothScroll />
      
      {/* Hero Section */}
      <header ref={heroRef} className="relative min-h-screen flex flex-col justify-center px-6 sm:px-12 pt-20 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full items-center pb-4 md:pb-0 relative">
            <div className="md:col-span-12 z-20 relative mix-blend-difference">
                <p className="font-sans text-sm tracking-[0.3em] uppercase mb-8 text-gray-500 ml-2">{t.hero.role}</p>
                <HeroTitle />

                <div className="mt-6 md:mt-12 flex flex-wrap gap-x-6 gap-y-4 md:gap-x-8 md:gap-y-6 ml-2 max-w-[80vw] md:max-w-2xl">
                    {resolvedSkills.map((skill, index) => (
                        <div key={index} className="flex flex-col items-center gap-1 group cursor-default">
                            <span className="text-xl md:text-2xl text-white/40 group-hover:text-white transition-colors duration-300">
                                {skill.icon}
                            </span>
                            <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-white/40 group-hover:text-white transition-colors duration-300">
                                {skill.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Hero Image / Graphic - Floating/Background position to allow overlap */}
            <div className="absolute top-[30%] md:top-1/2 right-0 translate-y-0 md:-translate-y-1/2 w-[90vw] md:w-[50vw] h-[70vh] md:h-[90vh] z-10 opacity-100 pointer-events-none select-none">
                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="w-full h-full relative"
                >
                    {/* Gradient Masks to fade image into background */}
                    {/* Left Fade (stronger for text overlap) */}
                    <div className="absolute inset-y-0 left-0 w-[50%] bg-gradient-to-r from-brand-bg via-brand-bg/80 to-transparent z-20"></div>
                    {/* Bottom Fade */}
                    <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-brand-bg via-brand-bg/80 to-transparent z-20"></div>
                    {/* Top Fade */}
                    <div className="absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-brand-bg via-brand-bg/80 to-transparent z-20"></div>
                    {/* Right Fade */}
                    <div className="absolute inset-y-0 right-0 w-[15%] bg-gradient-to-l from-brand-bg to-transparent z-20"></div>

                    <img
                        src={heroPortrait}
                        alt="Alejo Monardez"
                        className="w-full h-full object-cover grayscale brightness-75 contrast-125"
                    />
                </motion.div>
            </div>
        </div>
        
        {/* Scroll Indicator - Positioned relative to Header (Viewport) */}
        <motion.div 
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 mix-blend-difference"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
        >
            <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center gap-2"
            >
               <span className="text-[10px] uppercase tracking-[0.2em] text-white">Scroll</span>
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white w-4 h-4 md:w-6 md:h-6 opacity-80">
                    <path d="M12 4V20M12 20L18 14M12 20L6 14" stroke="currentColor" strokeWidth="1" strokeLinecap="square"/>
               </svg>
            </motion.div>
        </motion.div>
      </header>

      {/* About Section */}
      <section id="about" className="py-24 md:py-32 px-6 sm:px-12 bg-neutral-900/20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
                <h3 className="text-xl font-serif mb-6 text-white/80">{t.about.title}</h3>
            </div>
            <div className="md:col-span-8">
                <div className="text-2xl md:text-4xl font-serif leading-none md:leading-tight text-white/90">
                    <TextReveal key={`${lang}-p1`} className="inline-block mr-2">{t.about.p1}</TextReveal>
                    <TextReveal key={`${lang}-p2`} className="inline-block mr-2">{t.about.p2}</TextReveal>
                    <TextReveal key={`${lang}-p3`} className="inline-block">{t.about.p3}</TextReveal>
                    <br/><br/>
                    
                    <div className="space-y-12 font-sans text-gray-400 leading-relaxed max-w-3xl">
                        {/* 01. Bio */}
                        <div>
                            <h4 className="text-white/30 text-xs uppercase tracking-widest mb-4">01. {t.nav.about}</h4>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="text-lg md:text-xl text-white/80"
                            >
                                {t.about.bio_intro}
                            </motion.p>
                        </div>

                        <div className="md:hidden mt-6">
                            <button 
                                onClick={() => setShowMoreAbout(!showMoreAbout)}
                                className="text-white border-b border-white text-sm uppercase tracking-widest pb-1"
                            >
                                {showMoreAbout ? t.about.showLess : t.about.readMore}
                            </button>
                        </div>

                        {/* Collapsible Content for Mobile (Always visible on Desktop) */}
                        <div className={`${showMoreAbout ? 'block' : 'hidden'} md:block space-y-12`}>
                            {/* 02. Experience */}
                            <div>
                                <h4 className="text-white/30 text-xs uppercase tracking-widest mb-4">{t.about.exp_title}</h4>
                                <div className="border-l border-white/20 pl-6 space-y-6">
                                    {t.about.jobs.map((job, i) => (
                                        <motion.div 
                                            key={i}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.8, delay: 0.5 + (i * 0.1) }}
                                        >
                                            <h5 className="text-white text-sm mb-1 font-bold">{job.company}</h5>
                                            <p className="text-sm md:text-base opacity-70">{job.description}</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* 03. Current Role */}
                            <div>
                                <h4 className="text-white/30 text-xs uppercase tracking-widest mb-4">{t.about.current_title}</h4>
                                <motion.p 
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    transition={{ duration: 0.8, delay: 0.8 }}
                                    className="text-white font-serif text-lg italic leading-relaxed"
                                >
                                    {t.about.current}
                                </motion.p>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="mt-12">
                    <h4 className="text-white mb-6 uppercase text-xs tracking-[0.2em] border-b border-white/20 pb-2">{t.about.connect}</h4>
                    <SocialLinks
                        extra={
                            <a
                                href={settings.cv_url || "/Monardez_Alejo_2026_CV.pdf"}
                                download="Monardez_Alejo_CV.pdf"
                                className="group flex items-center gap-3 px-6 py-3 bg-white text-black border border-white rounded-full hover:bg-transparent hover:text-white transition-all duration-300 ml-0 md:ml-auto"
                            >
                                <span className="uppercase tracking-widest text-xs font-bold">{t.about.downloadCV}</span>
                            </a>
                        }
                    />
                </div>
            </div>
        </div>
      </section>

      {/* Featured Projects Section - Stack of showcases */}
      <section id="projects" className="relative bg-black text-white py-24 md:py-32 overflow-hidden">
        <NoiseOverlay />

        {/* Massive Section Title */}
        <div className="px-6 sm:px-12 mb-16 md:mb-24 border-t border-white/20 pt-12">
            <h2 className="font-serif text-[12vw] leading-[0.8] tracking-tighter mix-blend-difference opacity-90">
                {t.projects.title}
            </h2>
            <div className="flex justify-end mt-4">
                <span className="font-sans text-xs uppercase tracking-[0.2em] opacity-50">
                    {t.projects.subtitle}
                </span>
            </div>
        </div>

        {/* Cada proyecto destacado = su propia sección con galería de imágenes */}
        <div>
            {featuredProjects.map((project, idx) => (
                <ProjectShowcase
                    key={project.id || project.slug || idx}
                    project={project}
                    index={idx}
                    lang={lang}
                />
            ))}
        </div>

        {/* CTA Ver todos */}
        <div className="px-6 sm:px-12 mt-24 md:mt-32 flex justify-center">
            <Link
                to="/proyectos"
                className="group inline-flex items-center gap-4 px-8 py-4 border border-white/30 rounded-full hover:bg-white hover:text-black transition-all duration-500 text-xs uppercase tracking-[0.3em]"
            >
                <span>{t.projects.viewAll}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="group-hover:translate-x-1 transition-transform duration-300">
                    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke="currentColor" strokeWidth="1.5" />
                </svg>
            </Link>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 md:py-32 px-6 sm:px-12 border-t border-white/10">
        <div className="max-w-2xl mx-auto text-center">
            
            <h2 className="text-4xl md:text-5xl font-serif uppercase tracking-tighter mb-4 text-white">
                {t.contact.talk}
            </h2>
            <p className="text-white/50 text-sm md:text-base font-sans mb-12 max-w-lg mx-auto">
                {lang === 'es' ? 'Construyamos algo excepcional.' : 'Let\'s build something exceptional.'}
            </p>

            <form className="w-full space-y-8 mt-12" onSubmit={handleContactSubmit}>
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
                        className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white focus:outline-none focus:border-white transition-all duration-300 placeholder:text-white/30 font-sans"
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        placeholder={t.contact.email}
                        className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white focus:outline-none focus:border-white transition-all duration-300 placeholder:text-white/30 font-sans"
                    />
                </div>

                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder={t.contact.phone}
                    className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white focus:outline-none focus:border-white transition-all duration-300 placeholder:text-white/30 font-sans"
                />

                <textarea
                    rows="4"
                    name="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    placeholder={t.contact.message}
                    className="w-full bg-transparent border-b border-white/20 py-3 text-sm text-white focus:outline-none focus:border-white transition-all duration-300 placeholder:text-white/30 font-sans resize-none"
                ></textarea>
                
                <div className="flex justify-end pt-4 items-center gap-4">
                    {formStatus === 'success' && <span className="text-green-400 text-xs uppercase tracking-widest">Message Sent</span>}
                    {formStatus === 'error' && <span className="text-red-400 text-xs tracking-wide">{errorMessage}</span>}
                    {formStatus === 'sending' && <span className="text-white/50 text-xs uppercase tracking-widest">Sending...</span>}
                    
                    <button 
                        type="submit" 
                        disabled={formStatus === 'sending'}
                        className="uppercase text-[10px] tracking-[0.2em] text-white border border-white/20 px-8 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-300 disabled:opacity-50"
                    >
                        {t.contact.send}
                    </button>
                </div>
            </form>

            <SocialLinks className="mt-20 justify-center" />
        </div>

        <footer className="mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[10px] text-white/30 uppercase tracking-widest gap-4">
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


