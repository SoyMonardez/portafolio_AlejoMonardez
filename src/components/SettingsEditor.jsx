import React, { useEffect, useState, useMemo } from 'react';
import { useSettings } from '../data/useSettings';
import { SOCIAL_LINKS, resolveSocialHref } from '../data/socialLinks';
import { SKILLS, SKILL_CATEGORIES } from '../data/skills';
import { API_URL } from '../config';

const DEFAULT_SKILLS_KEYS = [
    'html', 'css', 'javascript', 'react', 'tailwind',
    'node', 'express', 'php', 'python', 'mysql',
    'docker', 'git', 'github'
];

/**
 * Form de configuración general (redes sociales, etc.).
 * Lee/escribe sobre la tabla `settings` vía /settings (backend Node).
 */
export default function SettingsEditor() {
    const { settings, loading, save, refresh, fetchRaw } = useSettings();
    const [draft, setDraft] = useState({});
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);
    const [cvUploading, setCvUploading] = useState(false);
    const [cvMsg, setCvMsg] = useState(null);

    // Para el admin necesitamos los emails SIN ofuscar — pedimos /settings/raw.
    useEffect(() => {
        if (loading) return;
        fetchRaw()
            .then(raw => setDraft({ ...settings, ...raw }))
            .catch(() => setDraft(settings)); // fallback si /raw falla
    }, [loading, settings, fetchRaw]);

    const selectedSkills = useMemo(() => {
        const value = draft.skills_list;
        if (!value) return DEFAULT_SKILLS_KEYS;
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : DEFAULT_SKILLS_KEYS;
        } catch (e) {
            return DEFAULT_SKILLS_KEYS;
        }
    }, [draft.skills_list]);

    const handleToggleSkill = (key) => {
        const next = selectedSkills.includes(key)
            ? selectedSkills.filter(k => k !== key)
            : [...selectedSkills, key];
        setDraft(prev => ({ ...prev, skills_list: JSON.stringify(next) }));
    };


    const dirty = Object.keys(draft).some(k => draft[k] !== settings[k]);

    const handleChange = (key, value) => {
        setDraft(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async (e) => {
        e?.preventDefault();
        setSaving(true);
        setMsg(null);
        try {
            // Sólo mando las que cambiaron
            const changed = Object.fromEntries(
                Object.entries(draft).filter(([k, v]) => v !== settings[k])
            );
            if (!Object.keys(changed).length) {
                setMsg({ type: 'ok', text: 'Sin cambios' });
                return;
            }
            await save(changed);
            setMsg({ type: 'ok', text: 'Configuración guardada' });
            refresh();
        } catch (err) {
            setMsg({ type: 'err', text: err.message || 'Error al guardar' });
        } finally {
            setSaving(false);
            setTimeout(() => setMsg(null), 6000);
        }
    };

    const handleReset = () => {
        setDraft(settings);
        setMsg(null);
    };

    // ─────────── Upload del CV ───────────
    const handleCvUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.type !== 'application/pdf') {
            setCvMsg({ type: 'err', text: 'Solo se acepta PDF' });
            setTimeout(() => setCvMsg(null), 4000);
            e.target.value = '';
            return;
        }
        setCvUploading(true);
        setCvMsg(null);
        try {
            const token = localStorage.getItem('admin_token');
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch(`${API_URL}/upload/cv`, {
                method: 'POST',
                headers: { 'Authorization': token || '' },
                body: fd,
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || `HTTP ${res.status}`);
            }
            // Refrescar settings para que la nueva cv_url aparezca en el preview
            await refresh();
            setDraft(prev => ({ ...prev, cv_url: data.url }));
            setCvMsg({ type: 'ok', text: 'CV actualizado correctamente' });
        } catch (err) {
            setCvMsg({ type: 'err', text: err.message || 'Error al subir CV' });
        } finally {
            setCvUploading(false);
            e.target.value = '';
            setTimeout(() => setCvMsg(null), 6000);
        }
    };

    const currentCv = draft.cv_url || settings.cv_url || '';

    return (
        <form onSubmit={handleSave} className="space-y-10">

            <div>
                <h2 className="font-serif text-2xl uppercase tracking-widest mb-2">Redes sociales</h2>
                <p className="text-xs text-white/40 max-w-2xl">
                    Sólo se mostrarán en el sitio las redes que tengan un valor. Dejá vacío lo que no querés exhibir.
                    Para WhatsApp podés poner sólo el número y se arma el link automático. Para email podés poner sólo la dirección.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {SOCIAL_LINKS.map(s => {
                    const value = draft[s.key] ?? '';
                    const preview = resolveSocialHref(s.type, value);
                    return (
                        <div key={s.key} className="space-y-2">
                            <label className="flex items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-white/60">
                                <span className="text-lg text-white/80">{s.icon}</span>
                                <span>{s.label}</span>
                            </label>
                            <input
                                type="text"
                                value={value}
                                onChange={e => handleChange(s.key, e.target.value)}
                                placeholder={s.placeholder}
                                className="w-full bg-transparent border-b border-white/20 py-2 text-sm text-white focus:outline-none focus:border-white transition-colors font-sans placeholder:text-white/25"
                            />
                            {preview && (
                                <p className="text-[10px] text-white/40 font-mono truncate">
                                    →&nbsp;
                                    <a href={preview} target="_blank" rel="noopener noreferrer" className="hover:text-white underline-offset-2 hover:underline">
                                        {preview}
                                    </a>
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Curriculum Vitae */}
            <div className="pt-10 border-t border-white/10 space-y-6">
                <div>
                    <h2 className="font-serif text-2xl uppercase tracking-widest mb-2">Curriculum Vitae</h2>
                    <p className="text-xs text-white/40 max-w-2xl">
                        El PDF que se descarga al tocar "Descargar CV" en el portafolio. Subí una versión nueva cuando quieras —
                        reemplaza al actual automáticamente.
                    </p>
                </div>

                <div className="border border-white/10 p-6 space-y-4">
                    {currentCv ? (
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">CV actual</p>
                                <a
                                    href={currentCv}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-white hover:underline font-mono break-all"
                                >
                                    {currentCv}
                                </a>
                            </div>
                            <a
                                href={currentCv}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] uppercase tracking-widest border border-white/20 px-4 py-2 hover:bg-white hover:text-black transition-colors"
                            >
                                Ver PDF
                            </a>
                        </div>
                    ) : (
                        <p className="text-xs text-white/30 italic">
                            Aún no se subió un CV. Mientras tanto se usa el archivo estático <code className="text-white/50">/Monardez_Alejo_2026_CV.pdf</code>.
                        </p>
                    )}

                    <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                        <label className={`text-[10px] uppercase tracking-widest border border-white/30 px-4 py-2 cursor-pointer transition-colors ${cvUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white hover:text-black'}`}>
                            {cvUploading ? 'Subiendo...' : (currentCv ? 'Reemplazar CV' : 'Subir CV')}
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleCvUpload}
                                disabled={cvUploading}
                                className="hidden"
                            />
                        </label>
                        <span className="text-[10px] text-white/30">Solo PDF, máx 10 MB</span>
                    </div>

                    {cvMsg && (
                        <p className={`text-xs uppercase tracking-widest ${cvMsg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                            {cvMsg.text}
                        </p>
                    )}
                </div>
            </div>

            {/* Habilidades (Skills) */}
            <div className="pt-10 border-t border-white/10 space-y-6">
                <div>
                    <h2 className="font-serif text-2xl uppercase tracking-widest mb-2">Habilidades (Skills)</h2>
                    <p className="text-xs text-white/40 max-w-2xl">
                        Seleccioná las tecnologías y herramientas que dominás para mostrarlas en la sección principal del portafolio.
                    </p>
                </div>

                <div className="space-y-8">
                    {SKILL_CATEGORIES.map(cat => {
                        const catSkills = SKILLS.filter(s => s.category === cat);
                        if (!catSkills.length) return null;
                        return (
                            <div key={cat} className="space-y-3">
                                <h3 className="text-[10px] uppercase tracking-[0.2em] text-white/40">{cat}</h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {catSkills.map(s => {
                                        const isSelected = selectedSkills.includes(s.key);
                                        return (
                                            <button
                                                key={s.key}
                                                type="button"
                                                onClick={() => handleToggleSkill(s.key)}
                                                className={`flex items-center gap-2 text-xs uppercase tracking-wider px-4 py-2 border rounded-full transition-all duration-300 ${
                                                    isSelected
                                                        ? 'border-white bg-white text-black font-bold'
                                                        : 'border-white/10 text-white/60 hover:border-white/45 hover:text-white'
                                                }`}
                                            >
                                                {s.icon && <span className="text-sm">{s.icon}</span>}
                                                <span>{s.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {msg && (
                <p className={`text-xs uppercase tracking-widest ${msg.type === 'ok' ? 'text-green-400' : 'text-red-400'}`}>
                    {msg.text}
                </p>
            )}

            <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                {dirty && (
                    <button type="button" onClick={handleReset} className="text-xs uppercase tracking-widest border border-white/20 px-6 py-3 hover:bg-white/10">
                        Descartar cambios
                    </button>
                )}
                <button
                    type="submit"
                    disabled={saving || !dirty}
                    className="text-xs uppercase tracking-widest bg-white text-black px-8 py-3 font-bold hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
            </div>
        </form>
    );
}
