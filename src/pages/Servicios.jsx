import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../components/PublicLayout';
import { useLang } from '../data/useLang';
import { useSeo } from '../hooks/useSeo';

const CONTENT = {
    es: {
        label: 'Servicios de desarrollo', title: 'Sistemas que resuelven una función concreta.',
        intro: 'Trabajo en productos donde backend, datos, integraciones e interfaz necesitan funcionar como un solo sistema.',
        services: [
            ['Desarrollo de sistemas SaaS', 'Aplicaciones para gestionar procesos, clientes, reservas, productos, operaciones o información interna.'],
            ['Backend y APIs', 'Servicios con Python, FastAPI y PostgreSQL: autenticación, reglas de negocio, integraciones y documentación.'],
            ['Automatización de procesos', 'Flujos para reducir tareas manuales, conectar plataformas y transformar información entre sistemas.'],
            ['Integración de inteligencia artificial', 'Asistentes, RAG, generación estructurada, clasificación y procesamiento de lenguaje dentro de productos existentes.'],
            ['Integración de servicios', 'Conexiones con APIs externas, WhatsApp, correo y otras herramientas respaldadas por los proyectos publicados.'],
            ['Datos aplicados a productos', 'Modelado, consultas, procesamiento, reportes y visualización de información dentro de aplicaciones.'],
        ],
        process: 'Cómo trabajo', steps: [['Contexto', 'Entiendo el proceso, los usuarios y la información que necesita manejar el sistema.'], ['Alcance', 'Defino funciones y una estructura técnica que pueda probarse por etapas.'], ['Construcción', 'Desarrollo, integro y verifico cada flujo antes de preparar el despliegue.']],
        cta: '¿Tenés un proceso para ordenar o automatizar?', button: 'Hablemos de tu proyecto'
    },
    en: {
        label: 'Development services', title: 'Systems built around a concrete function.',
        intro: 'I work on products where backend, data, integrations, and interface need to operate as one system.',
        services: [
            ['SaaS product development', 'Applications for managing processes, clients, bookings, products, operations, or internal information.'],
            ['Backend and APIs', 'Python, FastAPI, and PostgreSQL services covering authentication, business rules, integrations, and documentation.'],
            ['Process automation', 'Workflows that reduce manual tasks, connect platforms, and transform information across systems.'],
            ['Applied AI integration', 'Assistants, RAG, structured generation, classification, and language processing inside existing products.'],
            ['Service integration', 'Connections with external APIs, WhatsApp, email, and other tools backed by published projects.'],
            ['Product data', 'Data modeling, queries, processing, reports, and visualization inside applications.'],
        ],
        process: 'How I work', steps: [['Context', 'I understand the process, its users, and the information the system needs to handle.'], ['Scope', 'I define features and a technical structure that can be tested in stages.'], ['Build', 'I develop, integrate, and verify each flow before preparing deployment.']],
        cta: 'Have a process to organize or automate?', button: 'Tell me about your project'
    }
};

export default function Servicios() {
    const [lang] = useLang(); const t = CONTENT[lang]; const es = lang === 'es';
    useSeo({ lang, canonical: 'https://alejomonardez.com/servicios', title: es ? 'Servicios de backend, SaaS y automatización | Alejo Monárdez' : 'Backend, SaaS & Automation Services | Alejo Monárdez', description: es ? 'Desarrollo de sistemas SaaS, backend y APIs con Python, automatización, integraciones e inteligencia artificial aplicada.' : 'SaaS development, Python backend and APIs, automation, integrations, and applied AI for digital products.', jsonLd: { '@context': 'https://schema.org', '@type': 'Service', provider: { '@id': 'https://alejomonardez.com/#person' }, url: 'https://alejomonardez.com/servicios', hasOfferCatalog: { '@type': 'OfferCatalog', name: t.label, itemListElement: t.services.map(([name, description]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name, description } })) } } });
    return <PublicLayout>
        <header className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24"><p className="text-[10px] uppercase tracking-[0.28em] text-white/40">{t.label}</p><h1 className="mt-5 max-w-5xl font-serif text-[clamp(3rem,9vw,7rem)] leading-[0.9] tracking-tight">{t.title}</h1><p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/65 md:text-xl">{t.intro}</p></header>
        <section aria-label={t.label} className="mx-auto grid max-w-6xl gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">{t.services.map(([name, desc], i) => <article key={name} className="bg-brand-bg p-6 md:p-8"><span className="text-[10px] tracking-[0.2em] text-white/25">{String(i + 1).padStart(2, '0')}</span><h2 className="mt-5 font-serif text-2xl leading-tight md:text-3xl">{name}</h2><p className="mt-4 text-sm leading-7 text-white/60">{desc}</p></article>)}</section>
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24"><h2 className="font-serif text-3xl md:text-5xl">{t.process}</h2><div className="mt-8 grid gap-6 md:grid-cols-3">{t.steps.map(([name, desc], i) => <article key={name} className="border-t border-white/20 pt-5"><p className="text-[10px] uppercase tracking-[0.2em] text-white/35">0{i + 1} · {name}</p><p className="mt-4 text-sm leading-7 text-white/60">{desc}</p></article>)}</div><div className="mt-20 border border-white/15 p-8 text-center md:p-14"><h2 className="font-serif text-3xl md:text-5xl">{t.cta}</h2><Link to="/contacto" className="mt-7 inline-flex min-h-11 items-center rounded-full bg-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-bg">{t.button}</Link></div></section>
    </PublicLayout>;
}
