import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const routes = [
  ['/proyectos', 'Proyectos de backend, SaaS y automatización | Alejo Monárdez', 'Proyectos personales y trabajos freelance: sistemas SaaS, APIs, automatización, datos e inteligencia artificial aplicada.', 'Proyectos de software', 'Casos de estudio con contexto, funciones, participación y tecnologías verificadas.'],
  ['/servicios', 'Servicios de backend, SaaS y automatización | Alejo Monárdez', 'Desarrollo de sistemas SaaS, backend y APIs con Python, automatización, integraciones e inteligencia artificial aplicada.', 'Servicios de desarrollo', 'Sistemas SaaS, backend y APIs, automatización, integraciones e inteligencia artificial aplicada.'],
  ['/sobre-mi', 'Sobre Alejo Monárdez | Desarrollo de software', 'Perfil profesional de Alejo Monárdez: backend con Python, productos SaaS, PostgreSQL, automatización e inteligencia artificial aplicada.', 'Construyo productos de software completos.', 'Desarrollo aplicaciones, sistemas SaaS y automatizaciones. Estudio la Licenciatura en Ciencia de Datos en la Universidad Siglo 21.'],
  ['/contacto', 'Contacto | Alejo Monárdez', 'Contactá a Alejo Monárdez para conversar sobre sistemas SaaS, backend, APIs, automatización e integraciones.', 'Hablemos de lo que necesitás construir.', 'Contame el contexto, el proceso que querés ordenar y el resultado que esperás.'],
  ['/proyectos/miturno', 'MiTurno | Proyecto de Alejo Monárdez', 'Plataforma SaaS multi-tenant para reservas y gestión de negocios de servicios.', 'MiTurno', 'Producto personal con FastAPI, PostgreSQL, React y Docker para centralizar reservas, clientes, servicios y disponibilidad.'],
  ['/proyectos/finbot-whatsapp', 'FinBot WhatsApp | Proyecto de Alejo Monárdez', 'Asistente por WhatsApp para registrar y consultar movimientos financieros mediante texto o audio.', 'FinBot WhatsApp', 'Proyecto personal con FastAPI, PostgreSQL, Evolution API y Whisper para transformar texto y audio en movimientos estructurados.'],
  ['/proyectos/fluxa', 'Fluxa | Proyecto de Alejo Monárdez', 'Sistema para gestionar proyectos, trabajadores, asistencias, ingresos, gastos y métricas.', 'Fluxa', 'Sistema de gestión desarrollado con React, Express, MySQL y Docker.'],
  ['/proyectos/etan-construcciones', 'Etán Construcciones | Proyecto de Alejo Monárdez', 'Sitio institucional y panel de gestión para una empresa constructora.', 'Etán Construcciones', 'Trabajo freelance con React, Node.js, PostgreSQL y Docker.'],
  ['/proyectos/cloudmenu', 'CloudMenu | Proyecto de Alejo Monárdez', 'Carta digital PWA con panel administrativo, códigos QR, estadísticas y gestión de productos.', 'CloudMenu', 'Producto personal para publicar y administrar cartas digitales.'],
  ['/proyectos/natasha', 'Natasha Models | Proyecto de Alejo Monárdez', 'Plataforma para una academia de modelaje con cursos, modelos, inscripciones y noticias.', 'Natasha Models', 'Trabajo freelance desarrollado con React, Node.js, Express y PostgreSQL.'],
  ['/proyectos/portfolio-personal', 'Portfolio personal | Proyecto de Alejo Monárdez', 'Portfolio full-stack con CMS, panel administrativo, contenido bilingüe e integración de IA.', 'Portfolio personal', 'Aplicación con React, Express, MySQL, Docker y Nginx.'],
];

function escapeHtml(value) { return value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
function setMeta(html, route, title, description) {
  const url = `https://alejomonardez.com${route}`;
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/<meta name="title" content="[^"]*"\s*\/>/, `<meta name="title" content="${escapeHtml(title)}" />`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escapeHtml(description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
}
for (const [route, title, description, heading, body] of routes) {
  let html = setMeta(template, route, title, description);
  const staticContent = `<main data-prerendered="true" style="max-width:760px;margin:0 auto;padding:48px 24px;color:#fff;background:#0a0a0a;font-family:Arial,sans-serif;line-height:1.7"><p style="text-transform:uppercase;letter-spacing:.2em;font-size:11px;opacity:.55">Alejo Monárdez · Desarrollador de software</p><h1 style="font-family:Georgia,serif;font-size:clamp(42px,8vw,80px);line-height:1">${escapeHtml(heading)}</h1><p>${escapeHtml(body)}</p><p><a href="/proyectos">Proyectos</a> · <a href="/servicios">Servicios</a> · <a href="/sobre-mi">Sobre mí</a> · <a href="/contacto">Contacto</a></p></main>`;
  html = html.replace('<div id="root">', `<div id="root">${staticContent}`);
  const target = path.join(dist, route.slice(1), 'index.html');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, html);
}
console.log(`Prerendered ${routes.length} public routes.`);
