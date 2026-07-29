import React, { useEffect, useMemo, useState } from 'react';
import { API_URL } from '../config';
import { SKILLS, SKILL_CATEGORIES, resolveSkill } from '../data/skills';
import { PROJECT_CATEGORIES, autoDemoUrl, slugify } from '../data/useProjects';

const EMPTY = {
    id: null,
    // ES (principal)
    title: '',
    category: PROJECT_CATEGORIES[0],
    categoryCustom: '',
    badge: '',
    description_short: '',
    description: '',
    situation: '',
    task: '',
    action: '',
    result: '',
    // EN (traducción opcional)
    title_en: '',
    category_en: '',
    badge_en: '',
    description_short_en: '',
    description_en: '',
    situation_en: '',
    task_en: '',
    action_en: '',
    result_en: '',
    // Comunes
    images: [],
    demo_url: '',
    demo_url_custom: false, // si el usuario tocó la URL manualmente
    tech: [],
    credentials: [], // [{ label, user, password, note }]
    status: 'production', // 'demo' | 'production' | 'wip'
    github_url: '',
    featured: false,
    sort_order: 0
};

/**
 * Panel CRUD de proyectos (versión simplificada).
 * - URL del demo se auto-genera desde el título (slug.alejomonardez.com) salvo que se personalice.
 * - Categoría: dropdown con presets + opción "Otra" para escribir libre.
 * - Imágenes: galería multi-upload (la primera es la portada).
 */
export default function ProjectEditor() {
    const [projects, setProjects] = useState([]);
    const [form, setForm] = useState(EMPTY);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [skillFilter, setSkillFilter] = useState('');
    const [formLang, setFormLang] = useState('es'); // 'es' | 'en' — qué idioma estoy editando
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null); // { title_suggestions, suggested_tech, notes }
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiFile, setAiFile] = useState(null); // { name, content }
    const [aiFileError, setAiFileError] = useState(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const isEditing = !!form.id;

    const computedSlug = useMemo(() => slugify(form.title), [form.title]);
    const computedDemoUrl = useMemo(() => autoDemoUrl(computedSlug), [computedSlug]);

    // Si la URL NO está personalizada, mantenerla sincronizada con el slug
    useEffect(() => {
        if (!form.demo_url_custom) {
            setForm(prev => ({ ...prev, demo_url: computedDemoUrl }));
        }
    }, [computedDemoUrl, form.demo_url_custom]);

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API_URL}/projects`);
            const data = await res.json();
            if (Array.isArray(data)) setProjects(data);
        } catch (_err) {
            console.error('Error fetching projects', _err);
        }
    };

    useEffect(() => { fetchProjects(); }, []);

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const toggleSkill = (key) => {
        setForm(prev => ({
            ...prev,
            tech: prev.tech.includes(key) ? prev.tech.filter(k => k !== key) : [...prev.tech, key]
        }));
    };

    // ---- Imágenes ----
    const handleAddImages = async (e) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        setUploading(true);
        setMsg(null);
        try {
            const uploaded = [];
            for (const file of files) {
                const fd = new FormData();
                fd.append('file', file);
                fd.append('name', computedSlug || 'img');
                const res = await fetch(`${API_URL}/upload`, {
                    method: 'POST',
                    headers: { 'Authorization': token },
                    body: fd
                });
                const data = await res.json();
                if (data.success) {
                    uploaded.push(data.url);
                } else {
                    setMsg({ type: 'err', text: data.error || 'Error al subir' });
                }
            }
            if (uploaded.length) {
                setForm(prev => ({ ...prev, images: [...prev.images, ...uploaded] }));
                setMsg({ type: 'ok', text: `${uploaded.length} imagen(es) subida(s)` });
            }
        } catch (_err) {
            setMsg({ type: 'err', text: 'Error de red al subir' });
        } finally {
            setUploading(false);
            e.target.value = '';
            setTimeout(() => setMsg(null), 4000);
        }
    };

    const handleRemoveImage = (idx) => {
        setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    };

    // Marca una imagen como portada — la mueve al índice 0 sin perder el orden relativo de las demás
    const setAsCover = (idx) => {
        if (idx === 0) return;
        setForm(prev => {
            const arr = [...prev.images];
            const [picked] = arr.splice(idx, 1);
            arr.unshift(picked);
            return { ...prev, images: arr };
        });
    };

    const moveImage = (idx, dir) => {
        setForm(prev => {
            const arr = [...prev.images];
            const target = idx + dir;
            if (target < 0 || target >= arr.length) return prev;
            [arr[idx], arr[target]] = [arr[target], arr[idx]];
            return { ...prev, images: arr };
        });
    };

    // ---- Credenciales de demo ----
    const handleAddCredential = () => {
        setForm(prev => ({
            ...prev,
            credentials: [...prev.credentials, { label: '', user: '', password: '', note: '' }],
        }));
    };
    const handleRemoveCredential = (idx) => {
        setForm(prev => ({
            ...prev,
            credentials: prev.credentials.filter((_, i) => i !== idx),
        }));
    };
    const handleCredentialChange = (idx, field, value) => {
        setForm(prev => ({
            ...prev,
            credentials: prev.credentials.map((c, i) => i === idx ? { ...c, [field]: value } : c),
        }));
    };

    // ---- Categoría ----
    const isCustomCategory = form.category === 'Otra';
    const finalCategory = isCustomCategory ? form.categoryCustom.trim() : form.category;

    // ---- IA helpers ----
    // Las llamadas de IA van al backend (/api/ai/*) con el JWT de admin.
    // El backend las proxea al ai-service interno; el token de Groq nunca
    // llega al browser.
    const AI_PROXY = `${API_URL}/ai`;
    const aiHeaders = () => ({ 'Content-Type': 'application/json', 'Authorization': token });

    // Abre el modal para escribir el contexto del proyecto
    const handleAiAssist = () => {
        setAiPrompt(form.description || '');
        setShowAiModal(true);
    };

    // Lector de archivo para el asistente IA. Acepta archivos de stack típicos.
    // El contenido se manda al LLM como contexto extra para inferir tecnologías.
    const ALLOWED_AI_FILE_EXTS = [
        'json', 'txt', 'md', 'lock', 'toml', 'yaml', 'yml', 'xml',
        'gradle', 'csproj', 'gemspec', 'mod', 'sum'
    ];
    const AI_FILE_MAX_BYTES = 256 * 1024; // 256 KB

    const handleAiFileChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        setAiFileError(null);
        if (!file) return;

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const nameLower = file.name.toLowerCase();
        // Aceptar por extensión o por nombre conocido sin extensión (Gemfile, Pipfile, etc.)
        const knownNames = ['gemfile', 'pipfile', 'dockerfile', 'rakefile', 'makefile', 'procfile'];
        if (!ALLOWED_AI_FILE_EXTS.includes(ext) && !knownNames.includes(nameLower)) {
            setAiFileError('Tipo no soportado. Subí un manifiesto de dependencias (package.json, requirements.txt, composer.json, go.mod, Cargo.toml, pom.xml, build.gradle, pubspec.yaml, Gemfile, etc.)');
            return;
        }
        if (file.size > AI_FILE_MAX_BYTES) {
            setAiFileError(`Archivo muy grande (${(file.size / 1024).toFixed(0)} KB). Máximo 256 KB.`);
            return;
        }
        try {
            const content = await file.text();
            setAiFile({ name: file.name, content });
        } catch (_err) {
            setAiFileError('No se pudo leer el archivo.');
        }
    };

    const handleClearAiFile = () => {
        setAiFile(null);
        setAiFileError(null);
    };

    // /assist — optimiza todo + sugiere título, categoría, orden y tech
    const handleRunAiAssist = async () => {
        setShowAiModal(false);
        setAiLoading(true);
        setMsg(null);
        try {
            const res = await fetch(`${AI_PROXY}/assist`, {
                method: 'POST',
                headers: aiHeaders(),
                body: JSON.stringify({
                    title: form.title,
                    description_short: form.description_short,
                    description: form.description,
                    category: finalCategory,
                    badge: form.badge,
                    tech: form.tech,
                    title_en: form.title_en,
                    badge_en: form.badge_en,
                    description_short_en: form.description_short_en,
                    description_en: form.description_en,
                    situation: form.situation,
                    task: form.task,
                    action: form.action,
                    result: form.result,
                    situation_en: form.situation_en,
                    task_en: form.task_en,
                    action_en: form.action_en,
                    result_en: form.result_en,
                    prompt: aiPrompt,
                    file_name:    aiFile?.name    || '',
                    file_content: aiFile?.content || '',
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setMsg({ type: 'err', text: data.error || `HTTP ${res.status}` });
                return;
            }
            
            const isPreset = PROJECT_CATEGORIES.includes(data.category);

            setForm(prev => ({
                ...prev,
                title:                data.title                || prev.title,
                title_en:             data.title_en             || prev.title_en,
                category:             data.category ? (isPreset ? data.category : 'Otra') : prev.category,
                categoryCustom:       data.category ? (isPreset ? '' : data.category) : prev.categoryCustom,
                category_en:          data.category_en          || prev.category_en,
                badge:                data.badge                || prev.badge,
                badge_en:             data.badge_en             || prev.badge_en,
                description_short:    data.description_short    || prev.description_short,
                description_short_en: data.description_short_en || prev.description_short_en,
                description:          data.description          || prev.description,
                description_en:       data.description_en       || prev.description_en,
                situation:            data.situation            || prev.situation,
                situation_en:         data.situation_en         || prev.situation_en,
                task:                 data.task                 || prev.task,
                task_en:              data.task_en              || prev.task_en,
                action:               data.action               || prev.action,
                action_en:            data.action_en            || prev.action_en,
                result:               data.result               || prev.result,
                result_en:            data.result_en            || prev.result_en,
                sort_order:           typeof data.sort_order === 'number' ? data.sort_order : prev.sort_order,
            }));
            setAiResult({
                title_suggestions: data.title_suggestions || [],
                suggested_tech:    data.suggested_tech    || [],
                notes:             data.notes             || '',
            });
            setMsg({ type: 'ok', text: 'Textos optimizados (ES + EN) y sugerencias generadas' });
        } catch (_err) {
            setMsg({ type: 'err', text: `Error de red: ${_err.message}. ¿Está corriendo el ai-service?` });
        } finally {
            setAiLoading(false);
            setTimeout(() => setMsg(null), 8000);
        }
    };

    // /suggest-title — solo nombres alternativos
    const handleSuggestTitle = async () => {
        if (!form.description.trim() && !finalCategory) {
            setMsg({ type: 'err', text: 'Escribí una descripción o categoría primero' });
            setTimeout(() => setMsg(null), 4000);
            return;
        }
        setAiLoading(true);
        try {
            const res = await fetch(`${AI_PROXY}/suggest-title`, {
                method: 'POST',
                headers: aiHeaders(),
                body: JSON.stringify({
                    description: form.description,
                    category: finalCategory,
                    tech: form.tech,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                setMsg({ type: 'err', text: data.error || `HTTP ${res.status}` });
                return;
            }
            setAiResult(prev => ({ ...(prev || {}), title_suggestions: data.suggestions || [] }));
        } catch (_err) {
            setMsg({ type: 'err', text: `Error de red: ${_err.message}` });
        } finally {
            setAiLoading(false);
            setTimeout(() => setMsg(null), 5000);
        }
    };

    const applyTitleSuggestion = (s) => {
        if (formLang === 'en') handleChange('title_en', s);
        else handleChange('title', s);
    };

    const applySuggestedTech = (key) => {
        if (!form.tech.includes(key)) {
            setForm(prev => ({ ...prev, tech: [...prev.tech, key] }));
        }
        setAiResult(prev => prev ? {
            ...prev,
            suggested_tech: (prev.suggested_tech || []).filter(k => k !== key),
        } : prev);
    };

    const applyAllSuggestedTech = () => {
        if (!aiResult?.suggested_tech?.length) return;
        const toAdd = aiResult.suggested_tech.filter(k => !form.tech.includes(k));
        setForm(prev => ({ ...prev, tech: [...prev.tech, ...toAdd] }));
        setAiResult(prev => prev ? { ...prev, suggested_tech: [] } : prev);
    };

    // ---- Guardar ----
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        try {
            const payload = {
                id: form.id || undefined,
                // ES
                title: form.title,
                category: finalCategory,
                badge: form.badge,
                description_short: form.description_short || '',
                description: form.description,
                situation: form.situation || '',
                task: form.task || '',
                action: form.action || '',
                result: form.result || '',
                // EN
                title_en: form.title_en || '',
                category_en: form.category_en || '',
                badge_en: form.badge_en || '',
                description_short_en: form.description_short_en || '',
                description_en: form.description_en || '',
                situation_en: form.situation_en || '',
                task_en: form.task_en || '',
                action_en: form.action_en || '',
                result_en: form.result_en || '',
                // Comunes
                images: form.images,
                demo_url: form.demo_url,
                status: form.status,
                github_url: form.github_url,
                tech: form.tech,
                credentials: form.credentials,
                featured: form.featured,
                sort_order: form.sort_order
            };
            const method = isEditing ? 'PUT' : 'POST';
            const url = isEditing ? `${API_URL}/projects/${form.id}` : `${API_URL}/projects`;
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', 'Authorization': token },
                body: JSON.stringify(payload)
            });
            const text = await res.text();
            let data = {};
            try { data = JSON.parse(text); } catch (_err) { /* respuesta no-JSON */ }
            if (res.ok && data.success) {
                setMsg({ type: 'ok', text: isEditing ? 'Proyecto actualizado' : 'Proyecto creado' });
                setForm(EMPTY);
                fetchProjects();
            } else {
                const full = [data.error, data.detail, data.hint, !data.error && text]
                    .filter(Boolean).join(' — ');
                setMsg({ type: 'err', text: full || `HTTP ${res.status}` });
                console.error('[Project save] response:', { status: res.status, body: text });
            }
        } catch (_err) {
            setMsg({ type: 'err', text: `Error de red: ${_err.message}` });
            console.error('[Project save] network error:', _err);
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(null), 10000);
        }
    };

    const handleEdit = (p) => {
        const isPreset = PROJECT_CATEGORIES.includes(p.category);
        const images = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
        const autoUrl = autoDemoUrl(p.slug || slugify(p.title));
        setForm({
            id: p.id,
            // ES
            title: p.title || '',
            category: isPreset ? p.category : 'Otra',
            categoryCustom: isPreset ? '' : (p.category || ''),
            badge: p.badge || '',
            description_short: p.description_short || '',
            description: p.description || '',
            situation: p.situation || '',
            task: p.task || '',
            action: p.action || '',
            result: p.result || '',
            // EN
            title_en:             p.title_en             || '',
            category_en:          p.category_en          || '',
            badge_en:             p.badge_en             || '',
            description_short_en: p.description_short_en || '',
            description_en:       p.description_en       || '',
            situation_en:         p.situation_en         || '',
            task_en:              p.task_en              || '',
            action_en:            p.action_en            || '',
            result_en:            p.result_en            || '',
            // Comunes
            images,
            demo_url: p.demo_url || '',
            demo_url_custom: (p.demo_url || '') !== autoUrl,
            tech: Array.isArray(p.tech) ? p.tech : [],
            credentials: Array.isArray(p.credentials) ? p.credentials : [],
            status: p.status || 'production',
            github_url: p.github_url || '',
            featured: !!p.featured,
            sort_order: p.sort_order || 0
        });
        setFormLang('es');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este proyecto?')) return;
        try {
            const res = await fetch(`${API_URL}/projects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': token }
            });
            // Sesión vencida: avisar y mandar al login (antes fallaba en silencio).
            if (res.status === 401) {
                localStorage.removeItem('admin_token');
                setMsg({ type: 'err', text: 'Tu sesión expiró. Redirigiendo al login…' });
                setTimeout(() => { window.location.href = '/admin'; }, 1500);
                return;
            }
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setMsg({ type: 'err', text: data.error || 'No se pudo eliminar el proyecto.' });
                return;
            }
            fetchProjects();
            if (form.id === id) setForm(EMPTY);
            setMsg({ type: 'ok', text: 'Proyecto eliminado.' });
        } catch (_err) {
            console.error(_err);
            setMsg({ type: 'err', text: 'Error de red al eliminar el proyecto.' });
        }
    };

    const handleNew = () => {
        setForm(EMPTY);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Skills filtradas
    const filteredSkills = useMemo(() => {
        if (!skillFilter) return SKILLS;
        const q = skillFilter.toLowerCase();
        return SKILLS.filter(s => s.name.toLowerCase().includes(q) || s.key.includes(q));
    }, [skillFilter]);

    const groupedSkills = useMemo(() => {
        const groups = {};
        SKILL_CATEGORIES.forEach(c => { groups[c] = []; });
        filteredSkills.forEach(s => {
            if (!groups[s.category]) groups[s.category] = [];
            groups[s.category].push(s);
        });
        return groups;
    }, [filteredSkills]);

    return (
        <div className="space-y-12">
            {/* ===================== FORMULARIO ===================== */}
            <form onSubmit={handleSubmit} className="border border-white/10 p-6 md:p-8 space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <h2 className="font-serif text-2xl uppercase tracking-widest">
                        {isEditing ? 'Editar proyecto' : 'Nuevo proyecto'}
                    </h2>
                    {isEditing && (
                        <button type="button" onClick={handleNew} className="text-xs uppercase tracking-widest text-white/40 hover:text-white">
                            + Nuevo
                        </button>
                    )}
                </div>

                {/* Bloque 1: Datos básicos */}
                <Section title="01. Datos básicos">
                    {/* Selector de idioma para los campos de texto */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                        <div className="flex border border-white/15 rounded-full overflow-hidden text-[10px] uppercase tracking-[0.25em]">
                            <button
                                type="button"
                                onClick={() => setFormLang('es')}
                                className={`px-4 py-2 transition-colors ${formLang === 'es' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                            >
                                🇪🇸 Español
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormLang('en')}
                                className={`px-4 py-2 transition-colors ${formLang === 'en' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
                            >
                                🇬🇧 English
                            </button>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={handleAiAssist}
                                disabled={aiLoading}
                                title="Optimiza título, badge y descripción en ES+EN, y sugiere tecnologías y nombres"
                                className="text-[10px] uppercase tracking-[0.25em] border border-white/30 px-4 py-2 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {aiLoading ? '✦ Procesando...' : '✦ Asistente IA'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSuggestTitle}
                                disabled={aiLoading}
                                title="Generar 5 sugerencias de título"
                                className="text-[10px] uppercase tracking-[0.25em] border border-white/15 px-3 py-2 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ✦ Ideas de título
                            </button>
                        </div>
                    </div>

                    {/* Panel de sugerencias IA */}
                    {aiResult && (aiResult.title_suggestions?.length > 0 || aiResult.suggested_tech?.length > 0 || aiResult.notes) && (
                        <div className="mb-6 border border-white/20 bg-white/5 p-4 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] uppercase tracking-[0.3em] text-white/60">✦ Sugerencias de la IA</p>
                                <button
                                    type="button"
                                    onClick={() => setAiResult(null)}
                                    className="text-[10px] text-white/40 hover:text-white"
                                >
                                    cerrar ×
                                </button>
                            </div>

                            {aiResult.notes && (
                                <p className="text-xs text-white/60 italic">{aiResult.notes}</p>
                            )}

                            {aiResult.title_suggestions?.length > 0 && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">
                                        Títulos alternativos {formLang === 'en' ? '(aplica a EN)' : '(aplica a ES)'}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {aiResult.title_suggestions.map((s, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => applyTitleSuggestion(s)}
                                                className="text-xs border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-colors"
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {aiResult.suggested_tech?.length > 0 && (() => {
                                // Separamos lo que la IA sugiere en 2 grupos:
                                //   - newTech: aún no están en el proyecto → clic para agregar
                                //   - confirmedTech: ya estaban → solo confirmación visual ✓
                                const newTech       = aiResult.suggested_tech.filter(k => !form.tech.includes(k));
                                const confirmedTech = aiResult.suggested_tech.filter(k =>  form.tech.includes(k));

                                return (
                                    <div className="space-y-3">
                                        {newTech.length > 0 && (
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                                                        Tecnologías nuevas ({newTech.length})
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={applyAllSuggestedTech}
                                                        className="text-[10px] uppercase tracking-widest text-white/60 hover:text-white"
                                                    >
                                                        agregar todas →
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {newTech.map(k => {
                                                        const s = resolveSkill(k);
                                                        return (
                                                            <button
                                                                key={k}
                                                                type="button"
                                                                onClick={() => applySuggestedTech(k)}
                                                                className="flex items-center gap-2 text-[10px] uppercase tracking-widest border border-white/30 px-3 py-1 hover:bg-white hover:text-black transition-colors"
                                                            >
                                                                {s?.icon && <span className="text-sm">{s.icon}</span>}
                                                                {s?.name || k}
                                                                <span className="opacity-60">+</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {confirmedTech.length > 0 && (
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.25em] text-green-400/70 mb-2">
                                                    ✓ Confirmadas en tu stack ({confirmedTech.length})
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {confirmedTech.map(k => {
                                                        const s = resolveSkill(k);
                                                        return (
                                                            <span
                                                                key={k}
                                                                className="flex items-center gap-2 text-[10px] uppercase tracking-widest border border-green-400/30 bg-green-400/5 text-green-200/80 px-3 py-1"
                                                            >
                                                                {s?.icon && <span className="text-sm">{s.icon}</span>}
                                                                {s?.name || k}
                                                                <span className="text-green-300">✓</span>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {newTech.length === 0 && confirmedTech.length > 0 && (
                                            <p className="text-[10px] text-white/40 italic pt-1">
                                                La IA confirmó tu stack actual — no encontró tecnologías nuevas para sumar.
                                            </p>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* TÍTULO — bilingüe */}
                        {formLang === 'es' ? (
                            <Field label="Título * (ES)">
                                <input
                                    required
                                    value={form.title}
                                    onChange={e => handleChange('title', e.target.value)}
                                    className={inputCls}
                                    placeholder="Ej: Fluxa"
                                />
                                {form.title && (
                                    <p className="text-[10px] text-white/30 mt-2 font-mono">
                                        slug: <span className="text-white/60">{computedSlug || '—'}</span>
                                    </p>
                                )}
                            </Field>
                        ) : (
                            <Field label="Title (EN)">
                                <input
                                    value={form.title_en}
                                    onChange={e => handleChange('title_en', e.target.value)}
                                    className={inputCls}
                                    placeholder={form.title || 'e.g. Fluxa'}
                                />
                                <p className="text-[10px] text-white/30 mt-2">
                                    {form.title_en ? '' : 'Empty → falls back to ES title'}
                                </p>
                            </Field>
                        )}

                        {/* CATEGORÍA — bilingüe */}
                        {formLang === 'es' ? (
                            <Field label="Categoría (ES)">
                                <select
                                    value={form.category}
                                    onChange={e => handleChange('category', e.target.value)}
                                    className={`${inputCls} appearance-none cursor-pointer`}
                                >
                                    {PROJECT_CATEGORIES.map(c => <option key={c} value={c} className="bg-neutral-900">{c}</option>)}
                                </select>
                                {isCustomCategory && (
                                    <input
                                        value={form.categoryCustom}
                                        onChange={e => handleChange('categoryCustom', e.target.value)}
                                        className={`${inputCls} mt-3`}
                                        placeholder="Escribí tu categoría personalizada"
                                    />
                                )}
                            </Field>
                        ) : (
                            <Field label="Category (EN)">
                                <input
                                    value={form.category_en}
                                    onChange={e => handleChange('category_en', e.target.value)}
                                    className={inputCls}
                                    placeholder={finalCategory || 'e.g. SaaS / SMB Management'}
                                />
                            </Field>
                        )}

                        {/* BADGE — bilingüe */}
                        {formLang === 'es' ? (
                            <Field label="Badge / Etiqueta (ES, opcional)">
                                <input
                                    value={form.badge}
                                    onChange={e => handleChange('badge', e.target.value)}
                                    className={inputCls}
                                    placeholder="Ej: Gestión Económica"
                                />
                            </Field>
                        ) : (
                            <Field label="Badge (EN, optional)">
                                <input
                                    value={form.badge_en}
                                    onChange={e => handleChange('badge_en', e.target.value)}
                                    className={inputCls}
                                    placeholder={form.badge || 'e.g. Financial Management'}
                                />
                            </Field>
                        )}

                        <Field label="Orden (menor = aparece antes)">
                            <input
                                type="number"
                                value={form.sort_order}
                                onChange={e => handleChange('sort_order', Number(e.target.value))}
                                className={inputCls}
                            />
                        </Field>
                    </div>

                    {/* DESCRIPCIÓN CORTA — bilingüe */}
                    {formLang === 'es' ? (
                        <Field label="Descripción Corta (ES - se muestra por defecto)" className="mt-6">
                            <textarea
                                rows={2}
                                value={form.description_short}
                                onChange={e => handleChange('description_short', e.target.value)}
                                className={`${inputCls} resize-none`}
                                placeholder="Resumen corto de 1 oración (para pantalla principal)"
                            />
                        </Field>
                    ) : (
                        <Field label="Short Description (EN, optional)" className="mt-6">
                            <textarea
                                rows={2}
                                value={form.description_short_en}
                                onChange={e => handleChange('description_short_en', e.target.value)}
                                className={`${inputCls} resize-none`}
                                placeholder={form.description_short || 'Short 1-sentence summary (for main list)'}
                            />
                        </Field>
                    )}

                    {/* DESCRIPCIÓN — bilingüe */}
                    {formLang === 'es' ? (
                        <Field label="Descripción Detallada * (ES - se muestra al hacer clic en Leer Más)" className="mt-6">
                            <textarea
                                required
                                rows={4}
                                value={form.description}
                                onChange={e => handleChange('description', e.target.value)}
                                className={`${inputCls} resize-none`}
                                placeholder="¿Qué hace este proyecto?"
                            />
                        </Field>
                    ) : (
                        <Field label="Detailed Description (EN, optional)" className="mt-6">
                            <textarea
                                rows={4}
                                value={form.description_en}
                                onChange={e => handleChange('description_en', e.target.value)}
                                className={`${inputCls} resize-none`}
                                placeholder={form.description || 'What does this project do?'}
                            />
                        </Field>
                    )}

                    {/* SITUACIÓN / TAREA / ACCIÓN / RESULTADO — caso de estudio, bilingüe.
                        Opcional: si se completa, el modal de detalle en la home lo muestra
                        en vez de la descripción simple. */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <p className="text-xs uppercase tracking-widest text-white/40 mb-4">
                            Caso de estudio (opcional — si lo completás, reemplaza la descripción simple en el modal de la home)
                        </p>
                        {formLang === 'es' ? (
                            <div className="space-y-4">
                                <Field label="Situación (ES)">
                                    <textarea rows={2} value={form.situation} onChange={e => handleChange('situation', e.target.value)}
                                        className={`${inputCls} resize-none`} placeholder="¿Qué problema enfrentaba el cliente?" />
                                </Field>
                                <Field label="Tarea (ES)">
                                    <textarea rows={2} value={form.task} onChange={e => handleChange('task', e.target.value)}
                                        className={`${inputCls} resize-none`} placeholder="¿Qué había que lograr?" />
                                </Field>
                                <Field label="Acción (ES)">
                                    <textarea rows={2} value={form.action} onChange={e => handleChange('action', e.target.value)}
                                        className={`${inputCls} resize-none`} placeholder="¿Qué construiste/hiciste?" />
                                </Field>
                                <Field label="Resultado (ES)">
                                    <textarea rows={2} value={form.result} onChange={e => handleChange('result', e.target.value)}
                                        className={`${inputCls} resize-none`} placeholder="¿Qué impacto tuvo?" />
                                </Field>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <Field label="Situation (EN)">
                                    <textarea rows={2} value={form.situation_en} onChange={e => handleChange('situation_en', e.target.value)}
                                        className={`${inputCls} resize-none`} placeholder={form.situation || 'What problem did the client face?'} />
                                </Field>
                                <Field label="Task (EN)">
                                    <textarea rows={2} value={form.task_en} onChange={e => handleChange('task_en', e.target.value)}
                                        className={`${inputCls} resize-none`} placeholder={form.task || 'What needed to happen?'} />
                                </Field>
                                <Field label="Action (EN)">
                                    <textarea rows={2} value={form.action_en} onChange={e => handleChange('action_en', e.target.value)}
                                        className={`${inputCls} resize-none`} placeholder={form.action || 'What did you build/do?'} />
                                </Field>
                                <Field label="Result (EN)">
                                    <textarea rows={2} value={form.result_en} onChange={e => handleChange('result_en', e.target.value)}
                                        className={`${inputCls} resize-none`} placeholder={form.result || 'What was the impact?'} />
                                </Field>
                            </div>
                        )}
                    </div>
                </Section>

                {/* Bloque 2: URL del demo + estado + GitHub */}
                <Section title="02. URL del demo & estado">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs text-white/50">
                            {form.demo_url_custom
                                ? 'URL personalizada — la podés editar libremente.'
                                : <>Auto-generada desde el título: <span className="text-white/80 font-mono">{computedDemoUrl || 'https://...alejomonardez.com'}</span></>
                            }
                        </p>
                        <button
                            type="button"
                            onClick={() => handleChange('demo_url_custom', !form.demo_url_custom)}
                            className="text-[10px] uppercase tracking-widest border border-white/20 px-3 py-1 hover:bg-white hover:text-black transition-colors"
                        >
                            {form.demo_url_custom ? 'Usar auto' : 'Personalizar'}
                        </button>
                    </div>
                    <input
                        type="url"
                        value={form.demo_url}
                        onChange={e => handleChange('demo_url', e.target.value)}
                        disabled={!form.demo_url_custom}
                        className={`${inputCls} ${!form.demo_url_custom ? 'opacity-60 cursor-not-allowed' : ''} mb-6`}
                        placeholder="https://miproyecto.alejomonardez.com"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Estado del proyecto */}
                        <Field label="Estado del proyecto">
                            <div className="flex gap-2 mt-1 flex-wrap">
                                {[
                                    { value: 'production', label: '🟢 Producción', desc: 'Sistema real en uso' },
                                    { value: 'demo',       label: '🟡 Demo',        desc: 'Versión de prueba' },
                                    { value: 'wip',        label: '🔵 En desarrollo', desc: 'Work in progress' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        title={opt.desc}
                                        onClick={() => handleChange('status', opt.value)}
                                        className={`text-[10px] uppercase tracking-widest border px-4 py-2 transition-colors ${
                                            form.status === opt.value
                                                ? 'border-white bg-white text-black'
                                                : 'border-white/20 text-white/60 hover:border-white hover:text-white'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </Field>

                        {/* GitHub URL */}
                        <Field label="Repositorio GitHub (opcional)">
                            <input
                                type="url"
                                value={form.github_url}
                                onChange={e => handleChange('github_url', e.target.value)}
                                className={inputCls}
                                placeholder="https://github.com/SoyMonardez/mi-repo"
                            />
                        </Field>
                    </div>
                </Section>

                {/* Bloque 3: Imágenes */}
                <Section title={`03. Galería de imágenes (${form.images.length})`}>
                    <p className="text-xs text-white/50 mb-4">
                        La <span className="text-white font-semibold">portada</span> es la imagen que se ve en la grilla de Proyectos. Click en <span className="text-white">★ Portada</span> sobre cualquier imagen para hacerla portada.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {form.images.map((url, idx) => (
                            <div key={idx} className={`relative group border ${idx === 0 ? 'border-white shadow-[0_0_0_2px_rgba(255,255,255,0.15)]' : 'border-white/10'} bg-neutral-900 aspect-[4/3] overflow-hidden`}>
                                <img src={url} alt={`img-${idx}`} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = '0.2'; }} />
                                {idx === 0 && (
                                    <span className="absolute top-1 left-1 text-[8px] uppercase tracking-widest bg-white text-black px-2 py-0.5 flex items-center gap-1">
                                        ★ Portada
                                    </span>
                                )}
                                <span className="absolute top-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                                    {idx + 1}
                                </span>
                                {/* Hover overlay con acciones — "Hacer portada" prominente */}
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                    {idx !== 0 && (
                                        <button
                                            type="button"
                                            onClick={() => setAsCover(idx)}
                                            className="w-full text-[10px] uppercase tracking-widest bg-white text-black py-1.5 font-bold hover:bg-gray-200 transition-colors"
                                        >
                                            ★ Hacer portada
                                        </button>
                                    )}
                                    <div className="flex w-full gap-1 text-[10px] uppercase tracking-widest">
                                        <button type="button" onClick={() => moveImage(idx, -1)} disabled={idx === 0} className="flex-1 border border-white/30 py-1 hover:bg-white/10 disabled:opacity-30">←</button>
                                        <button type="button" onClick={() => moveImage(idx, 1)} disabled={idx === form.images.length - 1} className="flex-1 border border-white/30 py-1 hover:bg-white/10 disabled:opacity-30">→</button>
                                        <button type="button" onClick={() => handleRemoveImage(idx)} className="flex-1 border border-red-500/30 text-red-300 py-1 hover:bg-red-500 hover:text-black hover:border-red-500 transition-colors">
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Botón agregar */}
                        <label className="border border-dashed border-white/20 aspect-[4/3] flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-white hover:bg-white/5 transition-all">
                            <span className="text-2xl text-white/40">+</span>
                            <span className="text-[10px] uppercase tracking-widest text-white/40">
                                {uploading ? 'Subiendo...' : 'Agregar imagen(es)'}
                            </span>
                            <input type="file" accept="image/*" multiple onChange={handleAddImages} className="hidden" disabled={uploading} />
                        </label>
                    </div>
                </Section>

                {/* Bloque 4: Credenciales de demo */}
                <Section title={`04. Credenciales de demo (${form.credentials.length})`}>
                    <p className="text-xs text-white/50 mb-4">
                        Si el proyecto tiene login, agregá las credenciales acá. Se muestran en la página de Proyectos
                        con un botón "Copiar" para que cualquiera pueda probar la demo sin pedírtelas.
                        <br/>
                        <span className="text-white/40">Ejemplo: <span className="text-white/70 font-mono">Admin / admin / demo1234</span></span>
                    </p>

                    {form.credentials.length === 0 && (
                        <div className="border border-dashed border-white/15 p-6 text-center mb-4">
                            <p className="text-xs uppercase tracking-widest text-white/30 mb-3">
                                Sin credenciales cargadas
                            </p>
                            <p className="text-[10px] text-white/40">
                                Dejá vacío si el proyecto no requiere login.
                            </p>
                        </div>
                    )}

                    <div className="space-y-3 mb-4">
                        {form.credentials.map((cred, idx) => (
                            <div key={idx} className="border border-white/15 p-4 bg-white/[0.02]">
                                <div className="flex items-start gap-3 mb-3">
                                    <input
                                        value={cred.label || ''}
                                        onChange={e => handleCredentialChange(idx, 'label', e.target.value)}
                                        placeholder="Rol (ej: Admin, Vendedor, Cliente)"
                                        className={`${inputCls} flex-1 max-w-[200px]`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCredential(idx)}
                                        className="text-[10px] uppercase tracking-widest text-red-300 hover:text-red-500 px-3 py-1 border border-red-500/30 hover:border-red-500 transition-colors whitespace-nowrap"
                                    >
                                        × Quitar
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <Field label="Usuario">
                                        <input
                                            value={cred.user || ''}
                                            onChange={e => handleCredentialChange(idx, 'user', e.target.value)}
                                            placeholder="admin"
                                            autoComplete="off"
                                            className={inputCls}
                                        />
                                    </Field>
                                    <Field label="Contraseña">
                                        <input
                                            value={cred.password || ''}
                                            onChange={e => handleCredentialChange(idx, 'password', e.target.value)}
                                            placeholder="demo1234"
                                            autoComplete="off"
                                            className={`${inputCls} font-mono`}
                                        />
                                    </Field>
                                </div>
                                <Field label="Nota (opcional)" className="mt-3">
                                    <input
                                        value={cred.note || ''}
                                        onChange={e => handleCredentialChange(idx, 'note', e.target.value)}
                                        placeholder="Ej: acceso a todas las funciones"
                                        className={inputCls}
                                    />
                                </Field>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleAddCredential}
                        className="w-full border border-dashed border-white/20 py-3 text-[10px] uppercase tracking-widest text-white/50 hover:border-white hover:text-white hover:bg-white/5 transition-all"
                    >
                        + Agregar credencial
                    </button>
                </Section>

                {/* Bloque 5: Opciones + tech */}
                <Section title="05. Opciones">
                    <label className="flex items-center gap-3 cursor-pointer select-none mb-6">
                        <input
                            type="checkbox"
                            checked={form.featured}
                            onChange={e => handleChange('featured', e.target.checked)}
                            className="w-5 h-5 accent-white"
                        />
                        <span className="text-sm uppercase tracking-widest">
                            Destacado (aparece en la home)
                        </span>
                    </label>

                    <Field label={`Tecnologías (${form.tech.length} seleccionadas)`}>
                        <input
                            placeholder="Buscar tecnología..."
                            value={skillFilter}
                            onChange={e => setSkillFilter(e.target.value)}
                            className={`${inputCls} mb-4`}
                        />

                        {form.tech.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-white/10">
                                {form.tech.map(k => {
                                    const s = resolveSkill(k);
                                    return (
                                        <button
                                            key={k}
                                            type="button"
                                            onClick={() => toggleSkill(k)}
                                            className="flex items-center gap-2 text-[10px] uppercase tracking-widest border border-white bg-white text-black px-3 py-1 rounded-full"
                                        >
                                            {s?.icon && <span className="text-sm">{s.icon}</span>}
                                            {s?.name || k}
                                            <span className="opacity-60">×</span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                            {SKILL_CATEGORIES.map(cat => {
                                const items = groupedSkills[cat] || [];
                                if (!items.length) return null;
                                return (
                                    <div key={cat}>
                                        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">{cat}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {items.map(s => {
                                                const active = form.tech.includes(s.key);
                                                return (
                                                    <button
                                                        key={s.key}
                                                        type="button"
                                                        onClick={() => toggleSkill(s.key)}
                                                        className={`flex items-center gap-2 text-[10px] uppercase tracking-widest border rounded-full px-3 py-1 transition-all ${
                                                            active
                                                                ? 'border-white bg-white text-black'
                                                                : 'border-white/15 text-white/60 hover:border-white hover:text-white'
                                                        }`}
                                                    >
                                                        <span className="text-sm">{s.icon}</span>
                                                        {s.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Field>
                </Section>

                {msg && (
                    <p className={`text-xs uppercase tracking-widest ${msg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                        {msg.text}
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    {isEditing && (
                        <button type="button" onClick={handleNew} className="text-xs uppercase tracking-widest border border-white/20 px-6 py-3 hover:bg-white/10">
                            Cancelar
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={saving}
                        className="text-xs uppercase tracking-widest bg-white text-black px-8 py-3 font-bold hover:bg-gray-200 disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear proyecto')}
                    </button>
                </div>
            </form>

            {/* ===================== LISTADO ===================== */}
            <div>
                <h3 className="font-serif text-xl uppercase tracking-widest mb-6">
                    Proyectos existentes ({projects.length})
                </h3>
                {projects.length === 0 ? (
                    <p className="text-white/30 text-center py-12 uppercase tracking-widest text-xs">
                        Aún no hay proyectos. Creá el primero arriba ↑
                    </p>
                ) : (
                    <div className="space-y-3">
                        {projects.map(p => {
                            const cover = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
                            const imgCount = Array.isArray(p.images) ? p.images.length : 0;
                            return (
                                <div key={p.id} className="group flex flex-col md:flex-row md:items-center gap-4 border border-white/10 p-4 hover:bg-white/5 transition-colors">
                                    <div className="w-full md:w-32 h-20 bg-neutral-900 overflow-hidden flex-shrink-0 relative">
                                        {cover && (
                                            <img src={cover} alt={p.title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.opacity = '0.2'; }} />
                                        )}
                                        {imgCount > 1 && (
                                            <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white/80 px-1.5 rounded">{imgCount}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h4 className="font-serif text-lg truncate">{p.title}</h4>
                                            {p.featured && (
                                                <span className="text-[9px] uppercase tracking-widest bg-white text-black px-2 py-0.5 rounded-full">DESTACADO</span>
                                            )}
                                        </div>
                                        <p className="text-xs text-white/40 uppercase tracking-widest mb-1">{p.category}</p>
                                        {p.demo_url && (
                                            <p className="text-xs text-white/50 truncate">{p.demo_url}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        <button onClick={() => handleEdit(p)} className="text-xs uppercase tracking-widest border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-colors">
                                            Editar
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="text-xs uppercase tracking-widest border border-white/20 px-4 py-2 hover:bg-red-500 hover:border-red-500 transition-colors">
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de Contexto IA */}
            {showAiModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 p-6 md:p-8 max-w-xl w-full space-y-6">
                        <div>
                            <h3 className="font-serif text-xl uppercase tracking-widest text-white">Asistente de IA Editorial</h3>
                            <p className="text-xs text-white/50 mt-1">
                                Escribí el contexto de tu proyecto (problema que resuelve, qué construiste y qué tecnologías usaste). La IA redactará textos de lujo (ES/EN) y sugerirá títulos, categoría y orden.
                            </p>
                        </div>
                        <textarea
                            rows={6}
                            value={aiPrompt}
                            onChange={e => setAiPrompt(e.target.value)}
                            className="w-full bg-transparent border border-white/20 p-3 text-sm text-white focus:outline-none focus:border-white transition-all duration-300 placeholder:text-white/30 font-sans resize-none"
                            placeholder="Ej: Es un SaaS de reservas para PyMEs de salud. Automatiza el agendamiento y los pagos de turnos. Usé React, Node, Tailwind y MySQL. Ayuda a ahorrar tiempo administrativo..."
                        />

                        {/* Upload de archivo de stack (opcional) */}
                        <div className="border border-dashed border-white/15 p-4 space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/60">
                                        ✦ Manifest de stack (opcional)
                                    </p>
                                    <p className="text-[10px] text-white/40 mt-1">
                                        Subí <code className="text-white/60">package.json</code>, <code className="text-white/60">requirements.txt</code>, <code className="text-white/60">composer.json</code>, etc. La IA infiere los iconos de tecnologías a partir de las dependencias.
                                    </p>
                                </div>
                                {aiFile ? (
                                    <button
                                        type="button"
                                        onClick={handleClearAiFile}
                                        className="text-[10px] uppercase tracking-widest text-red-300 hover:text-red-500"
                                    >
                                        Quitar ×
                                    </button>
                                ) : (
                                    <label className="text-[10px] uppercase tracking-widest border border-white/30 px-3 py-2 hover:bg-white hover:text-black cursor-pointer transition-colors whitespace-nowrap">
                                        Elegir archivo
                                        <input
                                            type="file"
                                            accept=".json,.txt,.md,.lock,.toml,.yaml,.yml,.xml,.gradle,.csproj,.gemspec,.mod,.sum,Gemfile,Pipfile,Dockerfile"
                                            onChange={handleAiFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                            {aiFile && (
                                <p className="text-xs text-green-400 font-mono truncate">
                                    📄 {aiFile.name} <span className="text-white/40">({(aiFile.content.length / 1024).toFixed(1)} KB)</span>
                                </p>
                            )}
                            {aiFileError && (
                                <p className="text-xs text-red-400">{aiFileError}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowAiModal(false)}
                                className="text-xs uppercase tracking-widest border border-white/20 px-5 py-3 hover:bg-white/10 text-white transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleRunAiAssist}
                                className="text-xs uppercase tracking-widest bg-white text-black px-6 py-3 font-bold hover:bg-gray-200 transition-all"
                            >
                                Optimizar Proyecto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ===================== Helpers UI =====================
const inputCls = "w-full bg-transparent border-b border-white/20 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors font-sans placeholder:text-white/30";

function Field({ label, children, className = '' }) {
    return (
        <label className={`block ${className}`}>
            <span className="text-[10px] uppercase tracking-[0.25em] text-white/40 block mb-2">{label}</span>
            {children}
        </label>
    );
}

function Section({ title, children }) {
    return (
        <div>
            <h3 className="text-[10px] uppercase tracking-[0.35em] text-white/30 mb-4 pb-2 border-b border-white/10">
                {title}
            </h3>
            <div>{children}</div>
        </div>
    );
}
