import { useEffect, useState } from 'react';
import { API_URL } from '../config';

/**
 * Categorías predefinidas (usadas en el admin y para filtrar en /proyectos).
 */
export const PROJECT_CATEGORIES = [
    'Full Stack Solutions',
    'IA & Data',
    'Otra'
];

/**
 * Genera el demo URL automático a partir del slug:
 *   slug -> https://<slug>.alejomonardez.com
 */
export function autoDemoUrl(slug) {
    if (!slug) return '';
    return `https://${slug}.alejomonardez.com`;
}

/**
 * Slugify simple en cliente (debe coincidir con la lógica del backend).
 */
export function slugify(text) {
    if (!text) return '';
    return String(text)
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Fallback estático para el caso de que el backend esté caído.
 */
export const FALLBACK_PROJECTS = [
    {
        id: 'fluxa', slug: 'fluxa',
        title: 'Fluxa', title_en: 'Fluxa',
        category: 'Full Stack Solutions', category_en: 'Full Stack Solutions',
        badge: 'Gestión Económica', badge_en: 'Financial Management',
        description_short: 'Plataforma SaaS para gestión económica de PyMEs con dashboards integrales para ingresos, asistencia y pagos.',
        description_short_en: 'SaaS platform for SMB financial management with comprehensive dashboards for income, attendance, and payments.',
        description: 'Plataforma SaaS para gestión económica de PyMEs: control de ingresos, pagos a empleados y proveedores, liquidaciones, planilla de asistencia, almacenamiento de archivos y dashboards visuales.',
        description_en: 'SaaS platform for SMB financial management: income tracking, employee and supplier payments, settlements, attendance sheets, file storage and visual dashboards.',
        situation: 'Las PyMEs enfrentaban una severa dispersión de datos financieros, planillas manuales propensas a errores y una alarmante falta de control y transparencia en la liquidación de sueldos.',
        situation_en: 'SMEs faced a severe fragmentation of financial data, error-prone manual spreadsheets, and a lack of control and transparency in payroll calculations.',
        task: 'Desarrollar una plataforma centralizada y segura para consolidar ingresos, asistencia, nómina y almacenamiento de documentación digital en tiempo real.',
        task_en: 'Develop a centralized and secure platform to consolidate income, attendance, payroll, and digital document storage in real time.',
        action: 'Construí un SaaS de extremo a extremo utilizando React, Node.js y MySQL, implementando dashboards interactivos, almacenamiento seguro de archivos y algoritmos de cálculo automatizado de sueldos.',
        action_en: 'Built an end-to-end SaaS platform using React, Node.js, and MySQL, implementing interactive dashboards, secure document storage, and automated payroll calculation algorithms.',
        result: 'Reducción de un 40% en tiempo de gestión administrativa, 100% de precisión matemática en sueldos y carga del panel principal en menos de 1.2 segundos.',
        result_en: '40% reduction in administrative management time, 100% mathematical accuracy in payroll, and main dashboard loading time under 1.2 seconds.',
        images: [], demo_url: 'https://fluxa.alejomonardez.com',
        tech: ['react', 'node', 'tailwind', 'mysql'],
        featured: true, sort_order: 1
    },
    {
        id: 'gancho', slug: 'gancho',
        title: 'Gancho', title_en: 'Gancho',
        category: 'Full Stack Solutions', category_en: 'Full Stack Solutions',
        badge: 'Carnicería Inteligente', badge_en: 'Smart Butcher Shop',
        description_short: 'Sistema de automatización para carnicerías que optimiza costos por gancho, márgenes y ventas con métricas en tiempo real.',
        description_short_en: 'Automation system for butcher shops that optimizes hook costs, margins, and sales with real-time metrics.',
        description: 'Sistema de automatización para carnicerías: cálculo automático de precio por kilo, costo por gancho, margen de ganancia descontando merma y grasa, métodos de pago e historial de ventas con gráficos.',
        description_en: 'Automation system for butcher shops: automatic price-per-kilo calculation, cost per hook, profit margin after waste and fat deduction, payment methods and sales history with charts.',
        situation: 'Pérdida invisible de márgenes netos en comercios cárnicos debido al cálculo ineficiente de mermas, grasa sobrante y costos fluctuantes por media res.',
        situation_en: 'Invisible loss of net margins in meat retail due to inefficient calculations of shrinkage, excess fat, and fluctuating wholesale costs.',
        task: 'Automatizar la fijación de precios al público y el análisis de rentabilidad bruta en tiempo real para optimizar la toma de decisiones comerciales.',
        task_en: 'Automate public pricing and gross margin analysis in real time to optimize business decision-making.',
        action: 'Desarrollé algoritmos matemáticos específicos para el desposte en React/Tailwind, permitiendo calcular el costo real por kilo limpio y el margen neto esperado por lote.',
        action_en: 'Developed specialized yield-calculation algorithms using React/Tailwind, enabling automatic tracking of actual cost per clean kilogram and expected net margin per batch.',
        result: 'Incremento del 8% en el margen neto de ganancia y erradicación total de errores manuales en el cálculo de rentabilidad diaria.',
        result_en: '8% increase in net profit margins and complete eradication of manual errors in daily profitability calculation.',
        images: [], demo_url: 'https://gancho.alejomonardez.com',
        tech: ['react', 'node', 'tailwind', 'mysql'],
        featured: true, sort_order: 2
    },
    {
        id: 'natasha', slug: 'natasha',
        title: 'Natasha Models', title_en: 'Natasha Models',
        category: 'Full Stack Solutions', category_en: 'Full Stack Solutions',
        badge: 'Academia Virtual', badge_en: 'Virtual Academy',
        description_short: 'Escuela virtual de modelaje con cursos premium, castings interactivos y aplicación móvil optimizada.',
        description_short_en: 'Virtual modeling school featuring premium courses, interactive castings, and an optimized mobile app.',
        description: 'Escuela virtual de modelaje con cursos premium y gratuitos, casting, noticias, modelos por categoría, inscripciones a la academia (virtual o presencial), login con Google y app descargable.',
        description_en: 'Virtual modeling school with premium and free courses, casting, news, models by category, academy enrollment (virtual or in-person), Google login and downloadable app.',
        situation: 'Una academia de modelaje en crecimiento requería digitalizar su oferta educativa, gestionar castings y automatizar cobros de membresías para escalar a nivel regional.',
        situation_en: 'A growing modeling academy needed to digitalize its course catalog, manage talent castings, and automate subscription billing to scale regionally.',
        task: 'Diseñar y construir una plataforma web unificada con pasarela de pagos integrada, streaming de cursos y perfiles de modelos optimizados.',
        task_en: 'Design and build a unified web platform with integrated payment gateway, course streaming, and optimized model portfolios.',
        action: 'Creé el sistema de membresías con autenticación de Google, pasarelas de pago automatizadas y un gestor de castings digital para agilizar el reclutamiento.',
        action_en: 'Created the membership system with Google OAuth, automated payment gateways, and a digital casting manager to streamline recruitment.',
        result: 'Más de 500 alumnos activos registrados y una reducción del 60% en el tiempo de procesamiento administrativo de matrículas.',
        result_en: 'Over 500 active registered students and a 60% reduction in manual enrollment administrative processing time.',
        images: [], demo_url: 'https://natashamodel.agency',
        tech: ['react', 'node', 'tailwind'],
        featured: true, sort_order: 3
    },
    {
        id: 'epet', slug: 'epet',
        title: 'E.P.E.T. N°1 Albardón', title_en: 'E.P.E.T. N°1 Albardón',
        category: 'IA & Data', category_en: 'AI & Data',
        badge: 'Portal Educativo', badge_en: 'Educational Portal',
        description_short: 'Portal educativo institucional para escuela técnica con chatbot inteligente integrado para consultas de la comunidad.',
        description_short_en: 'Institutional educational portal for a technical school with an integrated smart chatbot for community inquiries.',
        description: 'Portal institucional de la escuela técnica con sus orientaciones (Minería, Construcción e Informática) y un chatbot integrado para responder consultas sobre la institución.',
        description_en: 'Institutional portal of the technical school with its specializations (Mining, Construction and Computer Science) and an integrated chatbot to answer questions about the institution.',
        situation: 'Saturación en los canales de atención física y telefónica de la escuela técnica, especialmente fuera de los horarios administrativos.',
        situation_en: 'Overloaded physical and phone communication channels at the technical school, especially outside administrative working hours.',
        task: 'Crear un portal institucional centralizado que incluya un chatbot conversacional inteligente capaz de resolver dudas de forma autónoma.',
        task_en: 'Create a centralized institutional portal including a smart conversational chatbot capable of answering inquiries autonomously.',
        action: 'Desarrollé el portal web institucional e integré un agente conversacional basado en procesamiento de lenguaje natural (NLP) y base de conocimiento escolar.',
        action_en: 'Developed the institutional web portal and integrated a conversational agent using Natural Language Processing (NLP) trained on the school knowledge base.',
        result: 'Reducción de un 75% en consultas telefónicas/presenciales recurrentes con un nivel de precisión del 99% en respuestas automáticas.',
        result_en: '75% reduction in recurrent physical/phone inquiries with a 99% accuracy rate on automated responses.',
        images: [], demo_url: 'https://epet.alejomonardez.com',
        tech: ['php', 'html', 'css', 'tailwind'],
        featured: true, sort_order: 4
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
function normalizeProject(p) {
    if (!p) return p;
    if (!Array.isArray(p.images)) {
        if (typeof p.image === 'string' && p.image) {
            return { ...p, images: [p.image] };
        }
        return { ...p, images: [] };
    }
    return p;
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
                    setProjects(data.map(normalizeProject));
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
