import { useEffect, useState } from 'react';
import { API_URL } from '../config';

/**
 * Categorías predefinidas (usadas en el admin y para filtrar en /proyectos).
 */
export const PROJECT_CATEGORIES = [
    'Producto personal',
    'Trabajo freelance',
    'Proyecto académico',
    'Portfolio personal',
    'Otra'
];

/**
 * Genera el demo URL automático a partir del slug.
 */
export function autoDemoUrl(slug) {
    if (!slug) return '';
    return `https://${slug}.alejomonardez.com`;
}

export function slugify(text) {
    if (!text) return '';
    return String(text)
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Contenido editorial verificable usado cuando la API no responde.
 * No incluye métricas ni enlaces que no estén respaldados en el repositorio.
 */
export const FALLBACK_PROJECTS = [
    {
        id: 'miturno', slug: 'miturno', title: 'MiTurno', title_en: 'MiTurno',
        category: 'Producto personal', category_en: 'Personal product', badge: 'SaaS de turnos', badge_en: 'Scheduling SaaS',
        description_short: 'Plataforma SaaS multi-tenant para reservas y gestión de negocios de servicios.',
        description_short_en: 'Multi-tenant SaaS for bookings and service-business management.',
        description: 'Centraliza reservas, clientes, servicios y disponibilidad en un mismo sistema, con integraciones de WhatsApp e inteligencia artificial aplicadas a la gestión.',
        description_en: 'It centralizes bookings, clients, services, and availability in one system, with WhatsApp and applied AI integrations.',
        situation: 'Los negocios de servicios necesitan coordinar turnos, disponibilidad y datos de clientes sin dispersar la operación en varias herramientas.',
        situation_en: 'Service businesses need to coordinate bookings, availability, and client data without spreading operations across multiple tools.',
        task: 'Diseñar un producto SaaS que organice la operación de distintos negocios dentro de una misma plataforma.',
        task_en: 'Design a SaaS product that organizes multiple businesses within one platform.',
        action: 'Desarrollé el backend con FastAPI y PostgreSQL, la interfaz con React y la preparación del sistema con Docker.',
        action_en: 'I built the backend with FastAPI and PostgreSQL, the React interface, and the Docker setup.',
        result: 'Producto personal con una base técnica preparada para gestionar reservas y operaciones de negocios de servicios.',
        result_en: 'Personal product with a technical foundation for managing bookings and service-business operations.',
        images: [], demo_url: '', github_url: '', tech: ['python', 'fastapi', 'postgres', 'react', 'docker'], featured: true, status: 'wip', sort_order: 1
    },
    {
        id: 'finbot', slug: 'finbot-whatsapp', title: 'FinBot WhatsApp', title_en: 'FinBot WhatsApp',
        category: 'Producto personal', category_en: 'Personal product', badge: 'Automatización financiera', badge_en: 'Financial automation',
        description_short: 'Asistente por WhatsApp para registrar y consultar movimientos financieros mediante texto o audio.',
        description_short_en: 'WhatsApp assistant for recording and querying financial transactions through text or audio.',
        description: 'Convierte mensajes y audios en movimientos estructurados para facilitar el registro, la categorización y las consultas financieras desde una conversación.',
        description_en: 'It turns messages and audio into structured transactions for recording, categorizing, and querying finances from a conversation.',
        situation: 'Registrar gastos e ingresos de forma manual agrega fricción y deja información distribuida fuera del flujo cotidiano.',
        situation_en: 'Manual income and expense tracking adds friction and leaves information outside the everyday workflow.',
        task: 'Llevar el registro financiero a WhatsApp sin perder una estructura consultable de datos.',
        task_en: 'Bring financial tracking into WhatsApp while keeping the data structured and queryable.',
        action: 'Construí una API con FastAPI y PostgreSQL, integré Evolution API y procesé audios con Whisper para interpretar entradas de texto y voz.',
        action_en: 'I built an API with FastAPI and PostgreSQL, integrated Evolution API, and processed audio with Whisper to interpret text and voice input.',
        result: 'Proyecto personal que reúne mensajería, transcripción y persistencia de datos en un único flujo.',
        result_en: 'Personal project combining messaging, transcription, and data persistence in one flow.',
        images: [], demo_url: '', github_url: '', tech: ['python', 'fastapi', 'postgres', 'groq'], featured: true, status: 'wip', sort_order: 2
    },
    {
        id: 'fluxa', slug: 'fluxa', title: 'Fluxa', title_en: 'Fluxa', category: 'Producto personal', category_en: 'Personal product', badge: 'Gestión operativa', badge_en: 'Operations management',
        description_short: 'Sistema para gestionar proyectos, trabajadores, asistencias, ingresos, gastos y métricas.',
        description_short_en: 'System for managing projects, workers, attendance, income, expenses, and metrics.',
        description: 'Reúne información operativa y financiera en paneles de gestión para evitar planillas separadas y facilitar el seguimiento de la actividad.',
        description_en: 'It brings operational and financial information into management dashboards, replacing disconnected spreadsheets and simplifying activity tracking.',
        situation: 'La información de proyectos, personas y movimientos económicos necesitaba una estructura centralizada.', situation_en: 'Project, workforce, and financial information needed a centralized structure.',
        task: 'Construir un sistema de gestión con datos relacionados, controles operativos y visualizaciones.', task_en: 'Build a management system with related data, operational controls, and visualizations.',
        action: 'Desarrollé la aplicación con React, Express y MySQL y preparé su ejecución con Docker.', action_en: 'I built the application with React, Express, and MySQL and prepared it to run with Docker.',
        result: 'Sistema funcional para centralizar la gestión de proyectos y su información asociada.', result_en: 'Working system for centralizing project management and related information.',
        images: [], demo_url: 'https://fluxa.alejomonardez.com', github_url: '', tech: ['react', 'node', 'express', 'mysql', 'docker'], featured: true, status: 'production', sort_order: 3
    },
    {
        id: 'etan', slug: 'etan-construcciones', title: 'Etán Construcciones', title_en: 'Etán Construcciones', category: 'Trabajo freelance', category_en: 'Freelance work', badge: 'Sitio y gestión', badge_en: 'Website and management',
        description_short: 'Sitio institucional y panel de gestión para una empresa constructora.', description_short_en: 'Institutional website and management panel for a construction company.',
        description: 'Presenta los servicios y proyectos de la empresa y suma herramientas de administración para organizar el contenido.', description_en: 'It presents the company’s services and projects and adds administration tools for organizing content.',
        situation: 'La empresa necesitaba reunir su presencia institucional y la gestión de contenidos en una misma solución.', situation_en: 'The company needed to combine its institutional presence and content management in one solution.',
        task: 'Desarrollar una aplicación web con sitio público y panel de gestión.', task_en: 'Build a web application with a public website and management panel.',
        action: 'Participé en el desarrollo con React, Node.js, PostgreSQL y Docker, incorporando funciones de inteligencia artificial aplicadas al producto.', action_en: 'I worked on the product with React, Node.js, PostgreSQL, and Docker, including applied AI features.',
        result: 'Trabajo freelance llevado a una versión funcional con administración de contenido.', result_en: 'Freelance project delivered as a working product with content administration.',
        images: [], demo_url: '', github_url: '', tech: ['react', 'node', 'postgres', 'docker'], featured: true, status: 'production', sort_order: 4
    },
    {
        id: 'cloudmenu', slug: 'cloudmenu', title: 'CloudMenu', title_en: 'CloudMenu', category: 'Producto personal', category_en: 'Personal product', badge: 'Carta digital', badge_en: 'Digital menu',
        description_short: 'Carta digital PWA con panel administrativo, códigos QR, estadísticas y gestión de productos.', description_short_en: 'Digital-menu PWA with an admin panel, QR codes, analytics, and product management.',
        description: 'Permite mantener una carta gastronómica actualizada y administrar productos, disponibilidad y contenido desde un panel.', description_en: 'It keeps a restaurant menu up to date and manages products, availability, and content from an admin panel.',
        situation: 'Los cambios de precios, productos y disponibilidad requieren una carta que pueda actualizarse sin reimprimir material.', situation_en: 'Price, product, and availability changes require a menu that can be updated without reprinting.',
        task: 'Construir una carta digital administrable y accesible mediante QR.', task_en: 'Build an admin-managed digital menu accessible through QR codes.',
        action: 'Desarrollé la PWA y su panel con PHP, MySQL, JavaScript y Docker.', action_en: 'I built the PWA and its admin panel with PHP, MySQL, JavaScript, and Docker.',
        result: 'Producto funcional para publicar y mantener cartas digitales desde una interfaz de gestión.', result_en: 'Working product for publishing and maintaining digital menus from a management interface.',
        images: [], demo_url: 'https://cloudmenu.alejomonardez.com', github_url: '', tech: ['php', 'javascript', 'mysql', 'docker'], featured: false, status: 'production', sort_order: 5
    },
    {
        id: 'natasha', slug: 'natasha', title: 'Natasha Models', title_en: 'Natasha Models', category: 'Trabajo freelance', category_en: 'Freelance work', badge: 'Plataforma educativa', badge_en: 'Education platform',
        description_short: 'Plataforma para una academia de modelaje con cursos, modelos, inscripciones y noticias.', description_short_en: 'Platform for a modeling academy with courses, model profiles, enrollment, and news.',
        description: 'Organiza la propuesta educativa y la información institucional en una experiencia web con gestión de contenidos.', description_en: 'It organizes educational offerings and institutional information in a web experience with content management.',
        situation: 'La academia necesitaba presentar cursos, inscripciones, noticias y perfiles en un mismo canal digital.', situation_en: 'The academy needed one digital channel for courses, enrollment, news, and profiles.',
        task: 'Construir una plataforma web que reuniera esos contenidos y procesos.', task_en: 'Build a web platform that brought those contents and processes together.',
        action: 'Desarrollé la aplicación con React, Node.js, Express y PostgreSQL.', action_en: 'I built the application with React, Node.js, Express, and PostgreSQL.',
        result: 'Trabajo freelance publicado con secciones de contenido y procesos de inscripción.', result_en: 'Published freelance project with content sections and enrollment flows.',
        images: [], demo_url: 'https://natashamodel.agency', github_url: '', tech: ['react', 'node', 'express', 'postgres'], featured: false, status: 'production', sort_order: 6
    },
    {
        id: 'portfolio', slug: 'portfolio-personal', title: 'Portfolio personal', title_en: 'Personal portfolio', category: 'Portfolio personal', category_en: 'Personal portfolio', badge: 'CMS e i18n', badge_en: 'CMS and i18n',
        description_short: 'Portfolio full-stack con CMS, panel administrativo, contenido bilingüe e integración de IA.', description_short_en: 'Full-stack portfolio with a CMS, admin dashboard, bilingual content, and AI integration.',
        description: 'Este sitio combina una interfaz pública con administración de proyectos, ajustes, mensajes y publicación de contenido.', description_en: 'This site combines a public interface with project, settings, message, and content-publishing administration.',
        situation: 'El portfolio necesitaba contenido editable, rutas públicas y una administración separada de la experiencia de visita.', situation_en: 'The portfolio needed editable content, public routes, and administration separated from the visitor experience.',
        task: 'Construir y desplegar un portfolio que también funcionara como producto administrable.', task_en: 'Build and deploy a portfolio that also works as an admin-managed product.',
        action: 'Desarrollé el frontend con React, la API con Express, la persistencia con MySQL y el despliegue con Docker y Nginx.', action_en: 'I built the React frontend, Express API, MySQL persistence, and Docker/Nginx deployment.',
        result: 'Sitio en producción con CMS, formulario de contacto, contenido bilingüe y panel administrativo.', result_en: 'Production site with a CMS, contact form, bilingual content, and admin dashboard.',
        images: [], demo_url: 'https://alejomonardez.com', github_url: '', tech: ['react', 'node', 'express', 'mysql', 'docker', 'nginx'], featured: false, status: 'production', sort_order: 7
    }
];
/**
 * Devuelve el proyecto con los campos textuales en el idioma pedido.
 * Si el campo _en está vacío, cae al ES. Si pedís ES, devuelve tal cual.
 *
 * @param {object} project  - proyecto con campos tanto en ES como en EN
 * @param {'es'|'en'} lang  - idioma deseado
 */
export function localizeProject(project, lang = 'es') {
    if (!project) return project;
    if (lang !== 'en') {
        return {
            ...project,
            description_short: project.description_short || '',
            situation:   project.situation   || '',
            task:        project.task        || '',
            action:      project.action      || '',
            result:      project.result      || '',
        };
    }
    return {
        ...project,
        title:             project.title_en             || project.title,
        category:          project.category_en          || project.category,
        badge:             project.badge_en             || project.badge,
        description_short: project.description_short_en || project.description_short || '',
        description:       project.description_en       || project.description,
        situation:         project.situation_en         || project.situation || '',
        task:              project.task_en              || project.task      || '',
        action:            project.action_en            || project.action    || '',
        result:            project.result_en            || project.result    || '',
    };
}

/**
 * Normaliza un proyecto que pudo haber venido con `image` (string) en vez de `images` (array).
 */
const PROJECT_PRIORITY = ['miturno', 'finbot-whatsapp', 'fluxa', 'etan-construcciones', 'cloudmenu', 'natasha', 'portfolio-personal'];
const UNSUPPORTED_METRIC = /(?:\d+(?:[.,]\d+)?\s*%|\d+\s*(?:usuarios|alumnos|clientes)|precisión|accuracy|reduction|reducción|incremento)/i;

function normalizeProject(p) {
    if (!p) return p;
    let images = Array.isArray(p.images) ? p.images : [];
    if (!images.length && typeof p.image === 'string' && p.image) images = [p.image];
    return {
        ...p,
        images,
        result: UNSUPPORTED_METRIC.test(p.result || '') ? '' : (p.result || ''),
        result_en: UNSUPPORTED_METRIC.test(p.result_en || '') ? '' : (p.result_en || ''),
    };
}

function prepareProjects(apiProjects, featuredOnly) {
    const normalized = apiProjects.map(normalizeProject);
    const knownSlugs = new Set(normalized.map((p) => p.slug));
    const merged = [...normalized, ...FALLBACK_PROJECTS.filter((p) => !knownSlugs.has(p.slug))];
    const ordered = merged.sort((a, b) => {
        const ai = PROJECT_PRIORITY.indexOf(a.slug);
        const bi = PROJECT_PRIORITY.indexOf(b.slug);
        const ar = ai === -1 ? 1000 + Number(a.sort_order || 0) : ai;
        const br = bi === -1 ? 1000 + Number(b.sort_order || 0) : bi;
        return ar - br;
    });
    return featuredOnly ? ordered.filter((p) => p.featured || PROJECT_PRIORITY.indexOf(p.slug) < 4) : ordered;
}

/**
 * Hook para cargar proyectos desde el backend con fallback estático.
 */
export function useProjects({ featuredOnly = false } = {}) {
    const [projects, setProjects] = useState(
        featuredOnly ? FALLBACK_PROJECTS.filter(p => p.featured) : FALLBACK_PROJECTS
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const url = `${API_URL}/projects${featuredOnly ? '?featured=1' : ''}`;
        fetch(url)
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(data => {
                if (cancelled) return;
                if (Array.isArray(data) && data.length > 0) {
                    setProjects(prepareProjects(data, featuredOnly));
                }
                setLoading(false);
            })
            .catch(err => {
                if (cancelled) return;
                console.warn('[useProjects] Falling back to static list:', err);
                setError(err);
                setLoading(false);
            });
        return () => { cancelled = true; };
    }, [featuredOnly]);

    return { projects, loading, error };
}

