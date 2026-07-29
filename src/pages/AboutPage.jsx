import React from 'react';
import PublicLayout from '../components/PublicLayout';
import SocialLinks from '../components/SocialLinks';
import { useLang } from '../data/useLang';
import { useSeo } from '../hooks/useSeo';

export default function AboutPage() {
    const [lang] = useLang();
    const es = lang === 'es';
    const t = es ? {
        label: 'Perfil profesional', title: 'Construyo productos de software completos.',
        intro: 'Soy Alejo Monárdez. Desarrollo aplicaciones, sistemas SaaS y automatizaciones orientadas a resolver necesidades concretas.',
        work: 'Participo en la definición de funcionalidades, el modelado de datos, la integración de servicios, el desarrollo de APIs e interfaces, las pruebas y la preparación de los proyectos para producción.',
        ai: 'Trabajo principalmente con Python, FastAPI, PostgreSQL, React y Docker. Incorporo inteligencia artificial en asistentes conversacionales, recuperación de información, procesamiento de contenido y automatización cuando cumple una función clara dentro del producto.',
        study: 'Estudio la Licenciatura en Ciencia de Datos en la Universidad Siglo 21, profundizando mi formación en programación, bases de datos, análisis de información e inteligencia artificial aplicada.',
        experience: 'Prácticas profesionales', personal: 'Proyectos personales y freelance',
        jobs: [
            ['Facultad de Ciencias Exactas', 'Participé en tareas de revisión y mejora de una base de datos académica, con foco en la organización de la información y la resolución de problemas técnicos.'],
            ['Centro Cívico de San Juan', 'Colaboré en la revisión de un sistema de software del ámbito público, relevando necesidades y documentando observaciones.'],
        ],
        current: 'En proyectos personales y trabajos freelance convierto necesidades concretas en productos funcionales: defino el alcance, modelo los datos, desarrollo e integro componentes, pruebo y preparo el despliegue.'
    } : {
        label: 'Professional profile', title: 'I build complete software products.',
        intro: 'I’m Alejo Monárdez. I build applications, SaaS systems, and automation focused on concrete needs.',
        work: 'I contribute to feature definition, data modeling, service integration, API and interface development, testing, and production preparation.',
        ai: 'I mainly work with Python, FastAPI, PostgreSQL, React, and Docker. I add AI to conversational assistants, information retrieval, content processing, and automation when it serves a clear product function.',
        study: 'I study Data Science at Universidad Siglo 21, expanding my background in programming, databases, information analysis, and applied AI.',
        experience: 'Professional placements', personal: 'Personal and freelance projects',
        jobs: [
            ['Faculty of Exact Sciences', 'I participated in reviewing and improving an academic database, focusing on information organization and technical problem-solving.'],
            ['San Juan Civic Center', 'I collaborated in reviewing a public-sector software system, gathering needs and documenting observations.'],
        ],
        current: 'In personal and freelance projects, I turn concrete needs into working products: I define scope, model data, develop and integrate components, test, and prepare deployments.'
    };
    useSeo({ lang, canonical: 'https://alejomonardez.com/sobre-mi', title: es ? 'Sobre Alejo Monárdez | Desarrollo de software' : 'About Alejo Monárdez | Software Development', description: es ? 'Perfil profesional de Alejo Monárdez: backend con Python, productos SaaS, PostgreSQL, automatización e inteligencia artificial aplicada.' : 'Alejo Monárdez builds Python backends, SaaS products, PostgreSQL systems, automation, and applied AI integrations.' });
    return <PublicLayout>
        <header className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
            <p className="text-[10px] uppercase tracking-[0.28em] text-white/40">{t.label}</p>
            <h1 className="mt-5 max-w-5xl font-serif text-[clamp(3rem,9vw,7rem)] leading-[0.9] tracking-tight">{t.title}</h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/75 md:text-2xl">{t.intro}</p>
        </header>
        <section className="mx-auto grid max-w-6xl gap-px bg-white/10 border-y border-white/10 md:grid-cols-3">
            {[t.work, t.ai, t.study].map((p, i) => <article key={p} className="bg-brand-bg p-6 md:p-9"><span className="text-[10px] tracking-[0.2em] text-white/30">0{i + 1}</span><p className="mt-5 text-sm leading-7 text-white/65">{p}</p></article>)}
        </section>
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 md:py-24">
            <h2 className="font-serif text-3xl md:text-5xl">{t.experience}</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2">{t.jobs.map(([name, desc]) => <article key={name} className="border border-white/10 p-6 md:p-8"><p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{es ? 'Práctica profesional' : 'Professional placement'}</p><h3 className="mt-3 font-serif text-2xl">{name}</h3><p className="mt-4 text-sm leading-7 text-white/60">{desc}</p></article>)}</div>
            <h2 className="mt-16 font-serif text-3xl md:text-5xl">{t.personal}</h2><p className="mt-6 max-w-3xl text-base leading-8 text-white/65">{t.current}</p>
            <SocialLinks className="mt-10" />
        </section>
    </PublicLayout>;
}
