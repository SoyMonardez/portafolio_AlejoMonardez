import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { SKILL_KEYS } from './skills-catalog.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT             = process.env.PORT || 3001;
const GROQ_API_KEY     = process.env.GROQ_API_KEY;
const GROQ_MODEL       = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const AI_SHARED_TOKEN  = process.env.AI_SHARED_TOKEN || '';

if (!GROQ_API_KEY) {
    console.error('[ai-service] Falta GROQ_API_KEY en .env');
    process.exit(1);
}

// Sin token, cualquiera que alcance la URL puede gastar tu API key de Groq.
// En producción eso es una puerta abierta: abortamos el arranque.
if (!AI_SHARED_TOKEN) {
    const msg = '[ai-service] AI_SHARED_TOKEN vacío: el endpoint queda sin autenticación.';
    if (process.env.NODE_ENV === 'production') {
        console.error(msg + ' Definí AI_SHARED_TOKEN antes de levantar en producción.');
        process.exit(1);
    }
    console.warn(msg + ' Permitido solo en desarrollo.');
}

// Comparación en tiempo constante para no filtrar el token vía timing.
function tokenMatches(got) {
    if (!got) return false;
    const candidate = got.startsWith('Bearer ') ? got.slice(7) : got;
    const a = Buffer.from(candidate);
    const b = Buffer.from(AI_SHARED_TOKEN);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---------- Auth (token compartido) ----------
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') return next();
    if (req.path === '/health') return next();
    if (!AI_SHARED_TOKEN) return next();
    const got = req.headers['authorization'] || req.headers['x-ai-token'];
    if (!tokenMatches(got)) {
        return res.status(401).json({ error: 'No autorizado' });
    }
    next();
});

app.get('/health', (_req, res) => res.json({ ok: true, model: GROQ_MODEL }));

// ---------- Llamada a Groq ----------
async function callGroq(messages, { temperature = 0.5, maxTokens = 800 } = {}) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
            model: GROQ_MODEL,
            messages,
            temperature,
            max_tokens: maxTokens,
            response_format: { type: 'json_object' },
        }),
    });

    if (!res.ok) {
        const detail = await res.text();
        throw new Error(`Groq ${res.status}: ${detail.slice(0, 400)}`);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('Respuesta vacía de Groq');
    try {
        return JSON.parse(content);
    } catch {
        throw new Error('La IA no devolvió JSON válido');
    }
}

// =====================================================================
// POST /assist
// Endpoint principal — toma TODO lo que el usuario tenga cargado y devuelve:
//   - title / badge / description en ES y EN (siempre los 6 campos)
//   - title_suggestions: 3 títulos alternativos (útil si no hay nombre)
//   - suggested_tech: array de keys del catálogo (extra a las ya seleccionadas)
//   - notes: comentarios cortos del editor (opcional)
// =====================================================================
app.post('/assist', async (req, res) => {
    try {
        const {
            title = '',
            description_short = '',
            description = '',
            category = '',
            badge = '',
            tech = [],
            title_en = '',
            badge_en = '',
            description_short_en = '',
            description_en = '',
            prompt = '',
            file_name = '',
            file_content = '',
        } = req.body || {};

        if (!title.trim() && !description.trim() && !badge.trim() && !prompt.trim() && !file_content.trim()) {
            return res.status(400).json({
                error: 'Necesito al menos un título, descripción, badge, contexto o archivo para trabajar',
            });
        }

        // Truncamos el contenido del archivo para no romper el límite de tokens del LLM.
        // 12 KB ≈ 3000 tokens, suficiente para un package.json grande o un requirements.txt.
        const fileTruncated = file_content.length > 12000
            ? file_content.slice(0, 12000) + '\n\n[... archivo truncado, mostrando primeros 12 KB ...]'
            : file_content;

        const system = `Sos un copywriter senior y arquitecto de software de IA. Trabajás en un portfolio editorial (estética minimalista de lujo, tipo revista).

Tu tarea: tomar info parcial de un proyecto, junto con el contexto/indicaciones adicionales provistas por el usuario, y devolver una versión pulida, bilingüe, lista para publicar con dos niveles de descripción.

REGLAS:
- Tono: profesional, directo, orientado a resultados y producto. Editorial premium. Sin lenguaje de estudiante. Sin emojis. Sin frases vacías ("solución innovadora", "experiencia única").
- Título: 1-4 palabras. Si el usuario no especificó uno, sugerí el mejor título evocador y creativo. El título en inglés ('title_en') debe ser EXACTAMENTE el mismo que en español ('title'), ya que son marcas comerciales y NO deben traducirse ni adaptarse.
- Categoría: Elegir estrictamente entre 'Full Stack Solutions' o 'IA & Data'. Para inglés (category_en), 'Full Stack Solutions' o 'AI & Data'.
- Badge: 2-4 palabras que resuman el propósito (ej: "Gobernanza de Datos", "Predictive Modeling").

- Descripción Corta ('description_short' y 'description_short_en'):
  * Un resumen de 2 oraciones completas. OBLIGATORIO: Mínimo 200 caracteres, Máximo 300 caracteres. NO te quedes por debajo de 200.
  * Debe explicar qué es el producto, qué problemas resuelve y su principal valor de forma sintetizada (ej: "Plataforma SaaS de administración comercial para carnicerías que automatiza el cálculo del desposte, costo real por kilo limpio y márgenes netos en tiempo real. Permite registrar ventas diarias, gestionar stock y visualizar métricas de rendimiento.").

- Descripción Extendida Detallada ('description' y 'description_en'):
  * Largo objetivo: 4 a 6 oraciones, entre 450 y 800 caracteres. NO menos de 400.
  * Estructura sugerida (en este orden, fluyendo natural, sin titulos ni bullets):
      1. Qué es el producto y para quién (1 oración).
      2. Flujo de uso del usuario final, listando 3-5 features concretas que aparecen en el prompt.
      3. Automatizaciones / inteligencia del sistema (notificaciones, recordatorios, lógica de retención, IA si aplica).
      4. Cierre con beneficio comercial concreto (reducción de no-shows, fidelización, eficiencia operativa, etc.).
  * REGLA DE ORO: si el usuario mencionó X features específicas en su prompt, todas tienen que aparecer mencionadas en la descripción. No las fusiones, no las omitas.

- sort_order: Sugerir un número entero (ej. del 1 al 10) representando la jerarquía de prioridad del proyecto (proyectos más complejos/relevantes van con orden menor).
- title_suggestions: SIEMPRE devolver 3 títulos alternativos creativos y memorables.
- suggested_tech: elegir SOLO de esta lista exacta de keys: ${JSON.stringify(SKILL_KEYS)}.
  Inferir tech a partir de la descripción, categoría, contexto Y archivo adjunto (si el usuario subió uno).
  Si te pasaron un archivo (package.json, requirements.txt, composer.json, go.mod, Cargo.toml, pom.xml, build.gradle, pubspec.yaml, Gemfile, etc.):
    1. PARSEÁ las dependencias del archivo.
    2. MAPEÁ cada paquete a la key correspondiente del catálogo cuando exista (ej: "react" → react, "@nestjs/core" → nestjs, "tailwindcss" → tailwind, "express" → express, "mysql2" → mysql, "mongoose" → mongodb, "django" → django, "flask" → flask, "next" → nextjs, "vue" → vue, "typescript" → typescript, etc.).
    3. Priorizá esas keys del archivo sobre las inferidas del texto — son evidencia directa.
  IMPORTANTE: devolvé TODAS las keys relevantes (hasta 10), incluyendo las que el usuario YA tiene seleccionadas. El frontend se encarga de marcar cuáles son nuevas y cuáles confirman el stack existente. NO filtres por ya seleccionadas.
- Mantené el sentido original y no inventes features imposibles, pero presentá el software como un producto o consultoría premium.
- EN debe ser inglés profesional y fluido, NO traducción literal — adaptá el idioma. Mismo largo que el ES.

Formato EXACTO de respuesta (JSON, sin markdown, sin \`\`\`):
{
  "title": "string",
  "title_en": "string",
  "category": "string",
  "category_en": "string",
  "badge": "string",
  "badge_en": "string",
  "description_short": "string",
  "description_short_en": "string",
  "description": "string",
  "description_en": "string",
  "sort_order": number,
  "title_suggestions": ["string", "string", "string"],
  "suggested_tech": ["key1", "key2"],
  "notes": "string corto opcional, máx 120 chars"
}`;

        const userPrompt = `Datos actuales del proyecto:

CONTEXTO/PROMPT DEL USUARIO (Indicaciones de qué hace y qué usó):
${prompt || '(No provisto)'}

ESPAÑOL:
- Título: ${title || '(VACÍO — sugerir uno)'}
- Categoría actual: ${category || '(sin categoría)'}
- Badge: ${badge || '(vacío)'}
- Descripción corta actual: ${description_short || '(vacía)'}
- Descripción extendida actual: ${description || '(vacía)'}

INGLÉS (si vacío, generar nuevo):
- Title: ${title_en || '(vacío)'}
- Badge: ${badge_en || '(vacío)'}
- Description Short: ${description_short_en || '(vacía)'}
- Description: ${description_en || '(vacía)'}

Tecnologías ya seleccionadas por el usuario: ${tech.length ? JSON.stringify(tech) : '(ninguna)'}

${fileTruncated ? `ARCHIVO ADJUNTO (${file_name || 'sin nombre'}):
\`\`\`
${fileTruncated}
\`\`\`
Usalo como FUENTE PRIMARIA para inferir el stack tecnológico (suggested_tech).` : ''}

Generá la versión optimizada completa.`;

        const result = await callGroq([
            { role: 'system', content: system },
            { role: 'user',   content: userPrompt },
        ], { temperature: 0.55, maxTokens: 1800 });

        // Filtrar: solo keys válidas del catálogo. NO excluimos las ya seleccionadas
        // — el frontend las muestra como "ya activas ✓" para confirmación visual.
        const valid = new Set(SKILL_KEYS);
        const suggested = Array.isArray(result.suggested_tech)
            ? [...new Set(result.suggested_tech.filter(k => valid.has(k)))].slice(0, 10)
            : [];

        const suggestions = Array.isArray(result.title_suggestions)
            ? result.title_suggestions.filter(s => typeof s === 'string').slice(0, 3)
            : [];

        res.json({
            success: true,
            title:                result.title                || '',
            title_en:             result.title_en             || '',
            category:             result.category             || '',
            category_en:          result.category_en          || '',
            badge:                result.badge                || '',
            badge_en:             result.badge_en             || '',
            description_short:    result.description_short    || '',
            description_short_en: result.description_short_en || '',
            description:          result.description          || '',
            description_en:       result.description_en       || '',
            sort_order:           typeof result.sort_order === 'number' ? result.sort_order : 0,
            title_suggestions:    suggestions,
            suggested_tech:       suggested,
            notes:                result.notes                || '',
        });
    } catch (err) {
        console.error('[/assist]', err);
        res.status(500).json({ error: err.message || 'Error interno' });
    }
});

// =====================================================================
// POST /suggest-title
// Solo títulos — útil cuando el usuario pide más ideas
// =====================================================================
app.post('/suggest-title', async (req, res) => {
    try {
        const { description = '', category = '', tech = [] } = req.body || {};
        if (!description.trim() && !category.trim()) {
            return res.status(400).json({ error: 'Necesito descripción o categoría' });
        }

        const result = await callGroq([
            {
                role: 'system',
                content: `Generás nombres de proyectos para un portfolio editorial.
Tono: corto, evocador, memorable. 1-3 palabras. Estilo: "Fluxa", "Helix", "Aether", "Nimbus", "Vora".
Evitá nombres genéricos ("MyApp", "ProjectX") y palabras descriptivas planas.
Devolvé JSON: { "suggestions": ["nombre1", "nombre2", "nombre3", "nombre4", "nombre5"] }`,
            },
            {
                role: 'user',
                content: `Proyecto:\n- Categoría: ${category}\n- Tech: ${tech.join(', ') || '—'}\n- Descripción: ${description}\n\nDame 5 nombres.`,
            },
        ], { temperature: 0.9, maxTokens: 200 });

        res.json({
            success: true,
            suggestions: Array.isArray(result.suggestions) ? result.suggestions.slice(0, 5) : [],
        });
    } catch (err) {
        console.error('[/suggest-title]', err);
        res.status(500).json({ error: err.message });
    }
});

// =====================================================================
// POST /suggest-tech
// Sugiere keys del catálogo a partir de un texto libre
// =====================================================================
app.post('/suggest-tech', async (req, res) => {
    try {
        const { description = '', title = '', category = '', exclude = [] } = req.body || {};
        if (!description.trim() && !title.trim()) {
            return res.status(400).json({ error: 'Necesito título o descripción' });
        }

        const result = await callGroq([
            {
                role: 'system',
                content: `Inferís el stack tecnológico de un proyecto a partir de su descripción.
Elegí keys EXACTAS de esta lista: ${JSON.stringify(SKILL_KEYS)}.
Devolvé JSON: { "tech": ["key1", "key2", ...] }. Máximo 10 keys. Solo las más probables.`,
            },
            {
                role: 'user',
                content: `Título: ${title}\nCategoría: ${category}\nDescripción: ${description}\n\n¿Qué tecnologías usa probablemente?`,
            },
        ], { temperature: 0.2, maxTokens: 200 });

        const valid = new Set(SKILL_KEYS);
        const excludeSet = new Set(exclude);
        const tech = Array.isArray(result.tech)
            ? result.tech.filter(k => valid.has(k) && !excludeSet.has(k)).slice(0, 10)
            : [];

        res.json({ success: true, tech });
    } catch (err) {
        console.error('[/suggest-tech]', err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`[ai-service] escuchando en http://localhost:${PORT}  (modelo: ${GROQ_MODEL})`);
});
