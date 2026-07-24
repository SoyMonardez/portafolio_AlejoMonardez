import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoDocumentTextOutline, IoArrowBack } from 'react-icons/io5';
import { SiPython, SiReact, SiOpenai, SiFastapi } from 'react-icons/si';
import CustomCursor from '../components/CustomCursor';
import NoiseOverlay from '../components/NoiseOverlay';
import SmoothScroll from '../components/SmoothScroll';
import { useSeo } from '../hooks/useSeo';
import { useLang } from '../data/useLang';
import { useSettings } from '../data/useSettings';
import logo from '../assets/logo.png';

/**
 * Página /servicios — captura intención de contratación
 * ("contratar programador", "desarrollador de IA", "python freelance").
 * Copy honesta según el perfil real: Python + integración de IA/LLMs en
 * sistemas, estudiante de Ciencia de Datos, experiencia propia con SaaS.
 * Sin métricas ni afirmaciones inventadas.
 */
export default function Servicios() {
    const { settings } = useSettings();
    const [lang, , toggleLang] = useLang();

    const t = lang === 'es'
        ? {
            label: 'Servicios / Cómo puedo ayudarte',
            heading1: 'LO QUE',
            heading2: 'CONSTRUYO',
            intro: 'Desarrollo backends y aplicaciones web con Python e integro IA en sistemas concretos. Soy estudiante de primer año de Ciencia de Datos y demuestro mi trabajo mediante proyectos y repositorios.',
            back: '← Volver',
            downloadCV: 'Descargar CV',
            servicesTitle: 'Áreas de trabajo',
            faqTitle: 'Preguntas frecuentes',
            ctaTitle: '¿Tenés un proyecto en mente?',
            ctaText: 'Contame qué necesitás y lo vemos.',
            ctaBtn: 'Hablemos',
            services: [
                {
                    icon: <SiPython />,
                    name: 'Desarrollo con Python',
                    desc: 'Backends, APIs, automatizaciones y scripts con Python y FastAPI. Diseño la base de datos, integro servicios y preparo pruebas y despliegues.',
                },
                {
                    icon: <SiOpenai />,
                    name: 'Integración de IA / LLMs',
                    desc: 'Conecto modelos de lenguaje (Llama, Groq, OpenAI) a productos reales: generación de contenido, chatbots y automatización inteligente dentro de tus sistemas.',
                },
                {
                    icon: <SiFastapi />,
                    name: 'Datos y formación',
                    desc: 'Análisis, limpieza y visualización de datos como parte de mi formación de grado. Curso el primer año de la Licenciatura en Ciencia de Datos.',
                },
                {
                    icon: <SiReact />,
                    name: 'Desarrollo de SaaS / MVPs',
                    desc: 'Plataformas full-stack de punta a punta: base de datos, backend, panel de administración y UI. De la idea a un producto funcionando.',
                },
            ],
            faqs: [
                {
                    q: '¿Qué tecnologías usás para IA?',
                    a: 'Integro modelos de lenguaje (LLMs) como Llama 3.3 vía Groq dentro de sistemas reales — por ejemplo, generación de contenido y automatización en plataformas SaaS.',
                },
                {
                    q: '¿Qué tipo de proyectos desarrollás?',
                    a: 'Plataformas SaaS, sistemas de gestión, integración de IA y automatización con Python. Podés ver demos en vivo en la sección Proyectos.',
                },
                {
                    q: '¿Puedo ver ejemplos de tu trabajo?',
                    a: 'Sí. En Proyectos hay demos en vivo con credenciales de prueba para que explores cada plataforma por dentro.',
                },
                {
                    q: '¿Dónde estás y trabajás de forma remota?',
                    a: 'Estoy en San Juan, Argentina, y puedo trabajar de forma remota. Escribime por WhatsApp, email o LinkedIn para contarme tu proyecto.',
                },
            ],
        }
        : {
            label: 'Services / How I can help',
            heading1: 'WHAT I',
            heading2: 'BUILD',
            intro: 'I build with Python and integrate Artificial Intelligence into real systems. Data Science student with hands-on experience building SaaS platforms and my own end-to-end projects.',
            back: '← Back',
            downloadCV: 'Download CV',
            servicesTitle: 'What I work on',
            faqTitle: 'Frequently asked questions',
            ctaTitle: 'Got a project in mind?',
            ctaText: 'Tell me what you need and we’ll figure it out.',
            ctaBtn: 'Let’s talk',
            services: [
                {
                    icon: <SiPython />,
                    name: 'Python development',
                    desc: 'Backends, APIs, automations and scripts. Clean, maintainable code with FastAPI, Flask and the Python data ecosystem.',
                },
                {
                    icon: <SiOpenai />,
                    name: 'AI / LLM integration',
                    desc: 'I connect language models (Llama, Groq, OpenAI) to real products: content generation, chatbots and smart automation inside your systems.',
                },
                {
                    icon: <SiFastapi />,
                    name: 'Data science',
                    desc: 'Data analysis, cleaning, visualization and predictive models to turn raw data into decisions. Continuously learning as a Data Science student.',
                },
                {
                    icon: <SiReact />,
                    name: 'SaaS / MVP development',
                    desc: 'End-to-end full-stack platforms: database, backend, admin panel and UI. From idea to a working product.',
                },
            ],
            faqs: [
                {
                    q: 'What tech do you use for AI?',
                    a: 'I integrate language models (LLMs) like Llama 3.3 via Groq into real systems — for example, content generation and automation inside SaaS platforms.',
                },
                {
                    q: 'What kind of projects do you build?',
                    a: 'SaaS platforms, management systems, AI integration and automation with Python. You can see live demos in the Projects section.',
                },
                {
                    q: 'Can I see examples of your work?',
                    a: 'Yes. The Projects section has live demos with test credentials so you can explore each platform from the inside.',
                },
                {
                    q: 'Where are you and do you work remotely?',
                    a: 'I’m in San Juan, Argentina, and I work with clients remotely. Reach me on WhatsApp, email or LinkedIn to tell me about your project.',
                },
            ],
        };

    // SEO por ruta — canonical propio + Service + FAQPage + Breadcrumb schema
    useSeo({
        lang,
        canonical: 'https://alejomonardez.com/servicios',
        title: lang === 'es'
            ? 'Desarrollo Python, automatización e IA | Alejo Monardez'
            : 'Python, Automation & AI Development | Alejo Monardez',
        description: lang === 'es'
            ? 'Desarrollo backends con Python, APIs, automatizaciones, integraciones de IA y productos SaaS. Revisá proyectos y demos de Alejo Monardez.'
            : 'Python backends, APIs, automation, AI integrations, and SaaS products. Review Alejo Monardez projects and live demos.',
        keywords: 'contratar programador python, desarrollador de IA argentina, integración de LLMs, desarrollo SaaS, ciencia de datos, programador freelance argentina, desarrollador de software san juan',
        jsonLd: [
            {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: lang === 'es' ? 'Inicio' : 'Home', item: 'https://alejomonardez.com/' },
                    { '@type': 'ListItem', position: 2, name: lang === 'es' ? 'Servicios' : 'Services', item: 'https://alejomonardez.com/servicios' },
                ],
            },
            {
                '@context': 'https://schema.org',
                '@type': 'Service',
                serviceType: lang === 'es'
                    ? 'Desarrollo de software, automatización e integración de IA'
                    : 'Software development, automation and AI integration',
                provider: { '@id': 'https://alejomonardez.com/#person' },
                areaServed: ['AR', 'ES', 'MX', 'US'],
                url: 'https://alejomonardez.com/servicios',
                hasOfferCatalog: {
                    '@type': 'OfferCatalog',
                    name: t.servicesTitle,
                    itemListElement: t.services.map((s) => ({
                        '@type': 'Offer',
                        itemOffered: { '@type': 'Service', name: s.name, description: s.desc },
                    })),
                },
            },
            {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: t.faqs.map((f) => ({
                    '@type': 'Question',
                    name: f.q,
                    acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
            },
        ],
    });

    return (
        <div className="bg-brand-bg min-h-screen text-brand-text selection:bg-white selection:text-black cursor-none overflow-x-hidden">
            <CustomCursor />
            <SmoothScroll />

            {/* Nav — mismo patrón que Home / Proyectos */}
            <nav className="fixed top-0 left-0 w-full p-6 md:p-12 flex justify-between items-center z-40 mix-blend-difference">
                <Link to="/" aria-label="Home">
                    <img src={logo} alt="Alejo Monardez" className="h-6 md:h-10 w-auto object-contain invert brightness-0 opacity-90" />
                </Link>
                <div className="flex items-center gap-3">
                    <a
                        href={settings.cv_url || '/Monardez_Alejo_2026_CV.pdf'}
                        download="Monardez_Alejo_CV.pdf"
                        aria-label={t.downloadCV}
                        title={t.downloadCV}
                        className="hidden md:inline-flex items-center px-4 py-1.5 border border-white text-black bg-white rounded-full hover:bg-transparent hover:text-white transition-all duration-300 z-50 relative shadow-[0_0_15px_rgba(255,255,255,0.12)] cursor-hover"
                    >
                        <span className="text-[10px] font-sans tracking-widest uppercase font-bold">{t.downloadCV}</span>
                    </a>
                    <button
                        onClick={toggleLang}
                        className="text-[10px] md:text-xs border border-white/20 rounded-full px-3 py-1 md:py-1 h-9 md:h-auto uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                    >
                        {lang === 'es' ? 'EN' : 'ES'}
                    </button>
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
                        {t.label}
                    </p>
                    <h1 className="font-serif text-[13vw] sm:text-[12vw] md:text-[10vw] leading-[0.9] md:leading-[0.85] tracking-tighter text-white mix-blend-difference break-words">
                        {t.heading1}
                        <br />
                        {t.heading2}
                    </h1>
                    <p className="mt-6 md:mt-8 max-w-2xl text-white/60 text-sm md:text-base leading-relaxed">
                        {t.intro}
                    </p>
                </div>
            </header>

            {/* Grid de servicios */}
            <section className="px-6 sm:px-12 py-12 md:py-24 border-b border-white/10">
                <div className="max-w-7xl mx-auto">
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/40 mb-8 md:mb-12">
                        {t.servicesTitle}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        {t.services.map((s, i) => (
                            <motion.article
                                key={i}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
                                className="group border border-white/10 bg-neutral-900/30 md:hover:bg-neutral-900/50 transition-all duration-500 p-6 md:p-10"
                            >
                                <span className="text-3xl md:text-4xl text-white/40 group-hover:text-white transition-colors duration-300">
                                    {s.icon}
                                </span>
                                <h2 className="font-serif text-2xl md:text-3xl leading-tight mt-5 md:mt-6 mb-3 text-white">
                                    {s.name}
                                </h2>
                                <p className="text-[13px] md:text-sm text-white/60 leading-relaxed">
                                    {s.desc}
                                </p>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="px-6 sm:px-12 py-12 md:py-24 border-b border-white/10">
                <div className="max-w-3xl mx-auto">
                    <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/40 mb-8 md:mb-12">
                        {t.faqTitle}
                    </p>
                    <div className="divide-y divide-white/10">
                        {t.faqs.map((f, i) => (
                            <div key={i} className="py-6 md:py-8">
                                <h3 className="font-serif text-lg md:text-2xl text-white mb-3">{f.q}</h3>
                                <p className="text-sm md:text-base text-white/60 leading-relaxed">{f.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-6 sm:px-12 py-16 md:py-28 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight mb-4">{t.ctaTitle}</h2>
                    <p className="text-white/60 text-sm md:text-base mb-8">{t.ctaText}</p>
                    <Link
                        to="/#contact"
                        className="inline-flex items-center gap-3 text-xs uppercase tracking-[0.25em] bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-marfil transition-all"
                    >
                        {t.ctaBtn} <span>→</span>
                    </Link>
                </div>
            </section>

            {/* Footer mini */}
            <footer className="px-6 sm:px-12 py-12 border-t border-white/10 text-center">
                <p className="text-[10px] uppercase tracking-widest text-white/30">© 2026 Alejo Monardez</p>
            </footer>
        </div>
    );
}
