import React, { useEffect, useMemo, useState } from 'react';
import {
  IoAdd, IoCheckmark, IoCloudDownloadOutline, IoDocumentTextOutline,
  IoFolderOpenOutline, IoRemove, IoSaveOutline, IoSparklesOutline, IoWarningOutline,
} from 'react-icons/io5';
import { API_URL } from '../config';

const uid = () => (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);

const INITIAL_DRAFT = {
  language: 'es',
  targetRole: 'Desarrollador Python | Ingeniería de IA',
  jobDescription: '',
  personal: {
    fullName: 'Alejo Monardez', email: '', phone: '', location: 'San Juan, Argentina',
    website: 'alejomonardez.com', linkedin: 'linkedin.com/in/alejo-monardez', github: 'github.com/SoyMonardez',
  },
  summary: 'Técnico en Informática y estudiante de Licenciatura en Ciencias de Datos, especializado en Python e inteligencia artificial aplicada. Desarrollo sistemas con RAG, modelos de lenguaje, bases de datos vectoriales y automatizaciones para resolver problemas reales de pymes, municipios y usuarios.',
  experience: [{
    id: uid(), role: 'Freelancer - Desarrollo de software e IA aplicada', company: 'Pymes y municipios',
    location: 'San Juan / Remoto', start: '', end: 'Actualidad',
    bullets: [
      'Diseñé e implementé sistemas a medida para digitalizar procesos y reducir tareas manuales.',
      'Integré automatizaciones e inteligencia artificial aplicada para agilizar operaciones y mejorar el acceso a la información.',
    ],
  }],
  education: [
    { id: uid(), institution: 'Universidad Siglo 21', degree: 'Licenciatura en Ciencias de Datos - Primer año', location: 'Argentina', start: '2026', end: 'En curso' },
    { id: uid(), institution: 'EPET N.º 1 de Albardón', degree: 'Técnico en Informática', location: 'San Juan, Argentina', start: '', end: 'Graduado' },
  ],
  projects: [],
  technicalSkills: 'Python, FastAPI, RAG, LLMs, bases de datos vectoriales, SQL, Docker, React, Node.js, automatización de procesos',
  softSkills: 'Aprendizaje continuo, pensamiento analítico, autonomía, comunicación con clientes, resolución de problemas',
  languages: 'Español (nativo)',
  certifications: '',
};

const authHeaders = (json = true) => ({
  ...(json ? { 'Content-Type': 'application/json' } : {}),
  Authorization: localStorage.getItem('admin_token') || '',
});

const SECTIONS = [
  ['profile', 'Perfil'], ['experience', 'Experiencia'], ['education', 'Formación'],
  ['projects', 'Proyectos'], ['skills', 'Habilidades'], ['target', 'Oferta / IA'],
];

const splitLines = (value = '') => String(value).split('\n').map(v => v.trim()).filter(Boolean);
const joinLines = (items = []) => items.filter(Boolean).join('\n');

const cleanText = (value = '') => String(value)
  .replace(/<[^>]*>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

function compactText(value, max = 220) {
  const text = cleanText(value);
  if (text.length <= max) return text;
  const excerpt = text.slice(0, max + 1);
  const sentenceEnd = Math.max(excerpt.lastIndexOf('. '), excerpt.lastIndexOf('; '));
  const wordEnd = excerpt.lastIndexOf(' ');
  const end = sentenceEnd >= Math.floor(max * 0.55) ? sentenceEnd + 1 : wordEnd;
  return `${excerpt.slice(0, Math.max(end, 1)).replace(/[.,;:\s]+$/, '')}…`;
}

function portfolioProjectToResume(project) {
  const description = compactText(project.description_short || project.description, 220);
  const contribution = compactText(project.result || project.action, 165);
  const technologies = Array.isArray(project.tech)
    ? project.tech.map(cleanText).filter(Boolean).slice(0, 8)
    : [];
  return {
    id: uid(),
    sourceProjectId: project.id,
    name: cleanText(project.title),
    link: cleanText(project.demo_url || project.github_url || 'alejomonardez.com/#projects'),
    description,
    bullets: [
      contribution,
      technologies.length ? `Tecnologías: ${technologies.join(', ')}` : '',
    ].filter(Boolean).slice(0, 2),
  };
}

function atsAudit(draft) {
  const checks = [
    { ok: Boolean(draft.personal.fullName && draft.personal.email && draft.personal.phone), label: 'Nombre, email y teléfono completos' },
    { ok: draft.summary.trim().length >= 120, label: 'Perfil profesional específico' },
    { ok: draft.experience.length > 0 && draft.experience.every(e => e.role && e.company && e.bullets?.some(Boolean)), label: 'Experiencias con logros o aportes' },
    { ok: draft.education.length > 0 && draft.education.every(e => e.institution && e.degree), label: 'Formación identificable' },
    { ok: draft.technicalSkills.split(',').filter(Boolean).length >= 5, label: 'Palabras clave técnicas' },
    { ok: !/[★◆●■]/.test(JSON.stringify(draft)), label: 'Sin símbolos que confundan al ATS' },
    { ok: true, label: 'Una columna, sin foto ni tablas' },
  ];
  const jobWords = new Set((draft.jobDescription.toLowerCase().match(/[a-záéíóúñ0-9+#.]{4,}/g) || []));
  const resumeText = JSON.stringify(draft).toLowerCase();
  const matched = [...jobWords].filter(word => resumeText.includes(word));
  const keywordMatch = jobWords.size ? Math.round((matched.length / jobWords.size) * 100) : null;
  return { checks, score: Math.round(checks.filter(c => c.ok).length / checks.length * 100), keywordMatch };
}

export default function ResumeBuilder() {
  const [draft, setDraft] = useState(INITIAL_DRAFT);
  const [section, setSection] = useState('profile');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [portfolioProjects, setPortfolioProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [showPortfolioProjects, setShowPortfolioProjects] = useState(false);
  const audit = useMemo(() => atsAudit(draft), [draft]);

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/cv/draft`, { headers: authHeaders(false) })
      .then(async res => {
        if (res.status === 401) throw new Error('Tu sesión venció');
        if (!res.ok) throw new Error('No se pudo cargar el borrador');
        return res.json();
      })
      .then(data => {
        if (!active || !data.draft) return;
        setDraft({ ...INITIAL_DRAFT, ...data.draft, personal: { ...INITIAL_DRAFT.personal, ...(data.draft.personal || {}) } });
        if (data.cv_url) setPdfUrl(data.cv_url);
      })
      .catch(err => active && setStatus(err.message));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/projects`)
      .then(async res => {
        if (!res.ok) throw new Error('No se pudieron cargar los proyectos publicados');
        return res.json();
      })
      .then(data => active && setPortfolioProjects(Array.isArray(data) ? data : []))
      .catch(err => active && setStatus(err.message))
      .finally(() => active && setProjectsLoading(false));
    return () => { active = false; };
  }, []);

  const update = (key, value) => setDraft(prev => ({ ...prev, [key]: value }));
  const updatePersonal = (key, value) => setDraft(prev => ({ ...prev, personal: { ...prev.personal, [key]: value } }));
  const updateItem = (group, id, key, value) => setDraft(prev => ({
    ...prev,
    [group]: prev[group].map(item => item.id === id ? { ...item, [key]: value } : item),
  }));
  const removeItem = (group, id) => setDraft(prev => ({ ...prev, [group]: prev[group].filter(item => item.id !== id) }));
  const addItem = group => {
    const templates = {
      experience: { id: uid(), role: '', company: '', location: '', start: '', end: '', bullets: [''] },
      education: { id: uid(), institution: '', degree: '', location: '', start: '', end: '' },
      projects: { id: uid(), name: '', link: '', description: '', bullets: [''] },
    };
    update(group, [...draft[group], templates[group]]);
  };

  const importPortfolioProject = project => {
    const alreadyAdded = draft.projects.some(item =>
      String(item.sourceProjectId || '') === String(project.id) ||
      cleanText(item.name).toLowerCase() === cleanText(project.title).toLowerCase()
    );
    if (alreadyAdded) {
      setStatus(`${project.title} ya está incluido en el CV.`);
      return;
    }
    update('projects', [...draft.projects, portfolioProjectToResume(project)]);
    setStatus(`${project.title} se agregó con una versión breve y optimizada para ATS.`);
  };

  const saveDraft = async () => {
    setBusy('save'); setStatus('');
    try {
      const res = await fetch(`${API_URL}/cv/draft`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ draft }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
      setStatus('Borrador guardado en el servidor.');
    } catch (err) { setStatus(err.message); }
    finally { setBusy(''); }
  };

  const improveWithAI = async () => {
    setBusy('ai'); setStatus('');
    try {
      const res = await fetch(`${API_URL}/ai/resume-assist`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ draft }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'La IA no pudo redactar el CV');
      const aiDraft = data.draft || {};
      setDraft(prev => ({
        ...prev, ...aiDraft,
        personal: { ...prev.personal, ...(aiDraft.personal || {}) },
        experience: (aiDraft.experience || prev.experience).map((item, index) => ({ ...item, id: prev.experience[index]?.id || item.id || uid() })),
        education: (aiDraft.education || prev.education).map((item, index) => ({ ...item, id: prev.education[index]?.id || item.id || uid() })),
        projects: (aiDraft.projects || prev.projects).map((item, index) => ({ ...item, id: prev.projects[index]?.id || item.id || uid() })),
      }));
      setStatus(data.notes || 'Redacción optimizada. Revisá los cambios antes de generar el PDF.');
    } catch (err) { setStatus(err.message); }
    finally { setBusy(''); }
  };

  const generatePdf = async () => {
    setBusy('pdf'); setStatus('');
    try {
      const res = await fetch(`${API_URL}/cv/generate`, { method: 'POST', headers: authHeaders(), body: JSON.stringify({ draft }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo generar el PDF');
      setPdfUrl(data.url);
      setStatus('PDF generado y publicado como CV activo del portfolio.');
      window.open(data.url, '_blank', 'noopener,noreferrer');
    } catch (err) { setStatus(err.message); }
    finally { setBusy(''); }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-white/10 pb-7">
        <div>
          <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.28em] text-emerald-300/70 mb-3"><IoDocumentTextOutline /> Harvard / ATS</div>
          <h2 className="font-serif text-3xl md:text-5xl">Creador de CV</h2>
          <p className="mt-3 max-w-2xl text-sm text-white/45 leading-relaxed">Una columna, texto seleccionable y jerarquía simple. La IA edita tu información; nunca debería inventar experiencia ni resultados.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={saveDraft} disabled={busy} icon={<IoSaveOutline />} label={busy === 'save' ? 'Guardando...' : 'Guardar borrador'} />
          <ActionButton onClick={improveWithAI} disabled={busy} icon={<IoSparklesOutline />} label={busy === 'ai' ? 'Redactando...' : 'Mejorar con IA'} accent />
          <ActionButton onClick={generatePdf} disabled={busy} icon={<IoCloudDownloadOutline />} label={busy === 'pdf' ? 'Generando...' : 'Generar y publicar PDF'} solid />
        </div>
      </div>

      {status && <div role="status" className="border border-white/15 bg-white/[0.035] px-4 py-3 text-sm text-white/70">{status}</div>}

      <div className="grid xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.82fr)] gap-8 items-start">
        <div className="min-w-0">
          <div className="flex gap-1 overflow-x-auto border-b border-white/10 mb-6 scrollbar-hide">
            {SECTIONS.map(([key, label]) => <button key={key} onClick={() => setSection(key)} className={`shrink-0 px-4 py-3 text-[9px] uppercase tracking-[0.2em] border-b transition-colors ${section === key ? 'border-emerald-300 text-white' : 'border-transparent text-white/35 hover:text-white/70'}`}>{label}</button>)}
          </div>

          {section === 'profile' && <ProfileEditor draft={draft} update={update} updatePersonal={updatePersonal} />}
          {section === 'experience' && <Collection title="Experiencia" onAdd={() => addItem('experience')}>
            {draft.experience.map((item, index) => <ExperienceEditor key={item.id} item={item} index={index} update={(k,v) => updateItem('experience', item.id, k, v)} remove={() => removeItem('experience', item.id)} />)}
          </Collection>}
          {section === 'education' && <Collection title="Formación" onAdd={() => addItem('education')}>
            {draft.education.map((item, index) => <EducationEditor key={item.id} item={item} index={index} update={(k,v) => updateItem('education', item.id, k, v)} remove={() => removeItem('education', item.id)} />)}
          </Collection>}
          {section === 'projects' && <div className="space-y-5">
            <PortfolioProjectPicker
              projects={portfolioProjects}
              selected={draft.projects}
              loading={projectsLoading}
              open={showPortfolioProjects}
              onToggle={() => setShowPortfolioProjects(value => !value)}
              onImport={importPortfolioProject}
            />
            <Collection title="Proyectos incluidos en el CV" onAdd={() => addItem('projects')}>
              {draft.projects.map((item, index) => <ProjectEditor key={item.id} item={item} index={index} update={(k,v) => updateItem('projects', item.id, k, v)} remove={() => removeItem('projects', item.id)} />)}
            </Collection>
          </div>}
          {section === 'skills' && <SkillsEditor draft={draft} update={update} />}
          {section === 'target' && <TargetEditor draft={draft} update={update} audit={audit} />}
        </div>

        <div className="xl:sticky xl:top-5 space-y-4">
          <AtsPanel audit={audit} />
          <ResumePreview draft={draft} />
          {pdfUrl && <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full border border-emerald-300/35 text-emerald-200 py-3 text-[10px] uppercase tracking-[0.22em] hover:bg-emerald-300 hover:text-black transition-colors"><IoCloudDownloadOutline /> Abrir último PDF</a>}
        </div>
      </div>
    </div>
  );
}

function ActionButton({ icon, label, accent, solid, ...props }) {
  return <button {...props} className={`inline-flex items-center gap-2 px-4 py-3 border text-[9px] uppercase tracking-[0.18em] transition-colors disabled:opacity-40 ${solid ? 'bg-white text-black border-white hover:bg-emerald-200' : accent ? 'border-emerald-300/45 text-emerald-200 hover:bg-emerald-300 hover:text-black' : 'border-white/20 text-white/65 hover:border-white hover:text-white'}`}>{icon}{label}</button>;
}

const Input = ({ label, ...props }) => <label className="block"><span className="block text-[9px] uppercase tracking-[0.18em] text-white/35 mb-2">{label}</span><input {...props} className="w-full bg-transparent border-b border-white/15 py-2 text-sm text-white outline-none focus:border-emerald-300 placeholder:text-white/18" /></label>;
const Textarea = ({ label, hint, ...props }) => <label className="block"><span className="flex justify-between gap-3 text-[9px] uppercase tracking-[0.18em] text-white/35 mb-2"><span>{label}</span>{hint && <span className="normal-case tracking-normal text-white/20">{hint}</span>}</span><textarea {...props} className="w-full min-h-28 bg-white/[0.025] border border-white/12 p-3 text-sm leading-relaxed text-white outline-none focus:border-emerald-300 resize-y placeholder:text-white/18" /></label>;

function ProfileEditor({ draft, update, updatePersonal }) {
  const p = draft.personal;
  return <div className="space-y-6">
    <div className="grid md:grid-cols-2 gap-5">
      <Input label="Nombre completo *" value={p.fullName} onChange={e=>updatePersonal('fullName',e.target.value)} />
      <Input label="Rol objetivo" value={draft.targetRole} onChange={e=>update('targetRole',e.target.value)} />
      <Input label="Email *" type="email" value={p.email} onChange={e=>updatePersonal('email',e.target.value)} />
      <Input label="Teléfono *" value={p.phone} onChange={e=>updatePersonal('phone',e.target.value)} />
      <Input label="Ubicación" value={p.location} onChange={e=>updatePersonal('location',e.target.value)} />
      <Input label="Sitio web" value={p.website} onChange={e=>updatePersonal('website',e.target.value)} />
      <Input label="LinkedIn" value={p.linkedin} onChange={e=>updatePersonal('linkedin',e.target.value)} />
      <Input label="GitHub" value={p.github} onChange={e=>updatePersonal('github',e.target.value)} />
    </div>
    <Textarea label="Perfil profesional" hint={`${draft.summary.length} caracteres`} value={draft.summary} onChange={e=>update('summary',e.target.value)} />
  </div>;
}

function PortfolioProjectPicker({ projects, selected, loading, open, onToggle, onImport }) {
  const isSelected = project => selected.some(item =>
    String(item.sourceProjectId || '') === String(project.id) ||
    cleanText(item.name).toLowerCase() === cleanText(project.title).toLowerCase()
  );

  return <section className="border border-emerald-300/20 bg-emerald-300/[0.025]">
    <button type="button" onClick={onToggle} aria-expanded={open} className="w-full flex items-center justify-between gap-5 px-5 py-4 text-left hover:bg-emerald-300/[0.045] transition-colors">
      <span className="flex items-center gap-3 min-w-0">
        <IoFolderOpenOutline className="shrink-0 text-emerald-200" />
        <span>
          <span className="block text-[10px] uppercase tracking-[0.2em] text-white/75">Usar un proyecto del portafolio</span>
          <span className="block mt-1 text-xs text-white/35">Importa una versión breve; después podés editarla.</span>
        </span>
      </span>
      <span className="shrink-0 text-[9px] uppercase tracking-[0.18em] text-emerald-200">{open ? 'Cerrar' : 'Elegir'}</span>
    </button>

    {open && <div className="border-t border-emerald-300/15 p-3 md:p-4">
      {loading ? <p className="p-5 text-sm text-white/35">Cargando proyectos publicados…</p> : projects.length === 0 ?
        <p className="p-5 text-sm text-white/35">Todavía no hay proyectos publicados para importar.</p> :
        <div className="grid md:grid-cols-2 gap-3">
          {projects.map(project => {
            const added = isSelected(project);
            const preview = compactText(project.description_short || project.description, 105);
            const stack = Array.isArray(project.tech) ? project.tech.slice(0, 5).join(' · ') : '';
            return <article key={project.id} className={'flex flex-col min-w-0 border p-4 ' + (added ? 'border-emerald-300/35 bg-emerald-300/[0.045]' : 'border-white/10 bg-black/20')}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-white/85 truncate">{project.title}</p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-white/30 truncate">{project.category || project.status || 'Proyecto publicado'}</p>
                </div>
                {added && <IoCheckmark className="shrink-0 text-emerald-200" aria-label="Incluido" />}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-white/42">{preview || 'Sin descripción breve.'}</p>
              {stack && <p className="mt-3 text-[9px] leading-relaxed text-white/28">{stack}</p>}
              <button type="button" disabled={added} onClick={() => onImport(project)} className="mt-4 self-start border border-white/15 px-3 py-2 text-[9px] uppercase tracking-[0.17em] text-white/60 hover:border-emerald-300 hover:text-emerald-200 disabled:border-transparent disabled:px-0 disabled:text-emerald-200/65">
                {added ? 'Incluido en el CV' : 'Usar en el CV'}
              </button>
            </article>;
          })}
        </div>}
      <p className="mt-4 px-1 text-[10px] leading-relaxed text-white/28">La importación usa hasta 220 caracteres de descripción, dos aportes y ocho tecnologías para mantener el CV fácil de leer.</p>
    </div>}
  </section>;
}

function Collection({ title, onAdd, children }) { return <div className="space-y-5"><div className="flex items-center justify-between"><h3 className="font-serif text-2xl">{title}</h3><button onClick={onAdd} className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] text-emerald-200 border border-emerald-300/30 px-3 py-2 hover:bg-emerald-300 hover:text-black"><IoAdd /> Agregar</button></div>{children.length ? children : <p className="border border-dashed border-white/15 p-8 text-center text-sm text-white/30">Todavía no agregaste elementos.</p>}</div>; }
function EditorCard({ title, remove, children }) { return <section className="border border-white/10 p-5 md:p-6"><div className="flex justify-between gap-4 mb-5"><h4 className="text-[10px] uppercase tracking-[0.22em] text-white/55">{title}</h4><button onClick={remove} aria-label={`Eliminar ${title}`} className="text-white/25 hover:text-red-300"><IoRemove /></button></div>{children}</section>; }

function ExperienceEditor({ item, index, update, remove }) { return <EditorCard title={`Experiencia ${index+1}`} remove={remove}><div className="grid md:grid-cols-2 gap-5 mb-5"><Input label="Puesto *" value={item.role} onChange={e=>update('role',e.target.value)} /><Input label="Empresa / cliente *" value={item.company} onChange={e=>update('company',e.target.value)} /><Input label="Ubicación" value={item.location} onChange={e=>update('location',e.target.value)} /><div className="grid grid-cols-2 gap-3"><Input label="Desde" value={item.start} onChange={e=>update('start',e.target.value)} /><Input label="Hasta" value={item.end} onChange={e=>update('end',e.target.value)} /></div></div><Textarea label="Aportes y resultados" hint="Un punto por línea" value={joinLines(item.bullets)} onChange={e=>update('bullets',splitLines(e.target.value))} placeholder="Automaticé...\nDesarrollé...\nReduje..." /></EditorCard>; }
function EducationEditor({ item, index, update, remove }) { return <EditorCard title={`Formación ${index+1}`} remove={remove}><div className="grid md:grid-cols-2 gap-5"><Input label="Institución *" value={item.institution} onChange={e=>update('institution',e.target.value)} /><Input label="Título / carrera *" value={item.degree} onChange={e=>update('degree',e.target.value)} /><Input label="Ubicación" value={item.location} onChange={e=>update('location',e.target.value)} /><div className="grid grid-cols-2 gap-3"><Input label="Desde" value={item.start} onChange={e=>update('start',e.target.value)} /><Input label="Hasta / estado" value={item.end} onChange={e=>update('end',e.target.value)} /></div></div></EditorCard>; }
function ProjectEditor({ item, index, update, remove }) { return <EditorCard title={`Proyecto ${index+1}`} remove={remove}><div className="grid md:grid-cols-2 gap-5 mb-5"><Input label="Nombre *" value={item.name} onChange={e=>update('name',e.target.value)} /><Input label="Enlace" value={item.link} onChange={e=>update('link',e.target.value)} /></div><Textarea label="Descripción breve" value={item.description} onChange={e=>update('description',e.target.value)} /><div className="mt-5"><Textarea label="Aportes técnicos" hint="Un punto por línea" value={joinLines(item.bullets)} onChange={e=>update('bullets',splitLines(e.target.value))} /></div></EditorCard>; }
function SkillsEditor({ draft, update }) { return <div className="space-y-6"><Textarea label="Habilidades técnicas" hint="Separadas por comas" value={draft.technicalSkills} onChange={e=>update('technicalSkills',e.target.value)} /><Textarea label="Habilidades blandas" hint="Solo las que puedas demostrar" value={draft.softSkills} onChange={e=>update('softSkills',e.target.value)} /><Input label="Idiomas" value={draft.languages} onChange={e=>update('languages',e.target.value)} /><Textarea label="Cursos y certificaciones" hint="Una por línea" value={draft.certifications} onChange={e=>update('certifications',e.target.value)} /></div>; }
function TargetEditor({ draft, update, audit }) { return <div className="space-y-6"><div className="border border-amber-300/20 bg-amber-300/[0.035] p-5"><div className="flex gap-3"><IoWarningOutline className="text-amber-200 shrink-0 mt-0.5"/><p className="text-sm text-white/55 leading-relaxed">Pegá la oferta completa y la IA priorizará términos relevantes que ya estén respaldados por tu experiencia. No agregará tecnologías o resultados que no hayas indicado.</p></div></div><Textarea label="Descripción del puesto" hint={audit.keywordMatch == null ? 'Opcional' : `${audit.keywordMatch}% de coincidencia actual`} value={draft.jobDescription} onChange={e=>update('jobDescription',e.target.value)} placeholder="Responsabilidades, requisitos y tecnologías de la oferta..." /></div>; }

function AtsPanel({ audit }) { return <div className="border border-white/12 bg-[#0b0b0b] p-5"><div className="flex items-end justify-between gap-4 mb-4"><div><p className="text-[9px] uppercase tracking-[0.24em] text-white/35">Preparación ATS</p><p className="font-serif text-3xl mt-1">{audit.score}%</p></div>{audit.keywordMatch != null && <div className="text-right"><p className="text-[9px] uppercase tracking-[0.18em] text-white/30">Coincidencia oferta</p><p className="text-lg text-emerald-200">{audit.keywordMatch}%</p></div>}</div><div className="h-1 bg-white/8 mb-4"><div className="h-full bg-emerald-300 transition-all" style={{width:`${audit.score}%`}} /></div><div className="grid sm:grid-cols-2 xl:grid-cols-1 gap-2">{audit.checks.map(check=><div key={check.label} className={`flex items-center gap-2 text-xs ${check.ok?'text-white/55':'text-amber-200/75'}`}>{check.ok?<IoCheckmark className="text-emerald-300"/>:<IoWarningOutline/>}{check.label}</div>)}</div></div>; }

function ResumePreview({ draft }) {
  const p=draft.personal; const contact=[p.email,p.phone,p.location,p.website,p.linkedin,p.github].filter(Boolean).join(' | ');
  return <div className="bg-white text-[#161616] shadow-[0_24px_70px_rgba(0,0,0,0.45)] aspect-[210/297] min-h-[620px] overflow-hidden px-[7.5%] py-[7%] font-[Arial,Helvetica,sans-serif] text-[8px] leading-[1.38]">
    <header className="text-center border-b border-black pb-3 mb-3"><h3 className="text-[20px] leading-none font-bold tracking-[0.03em] uppercase">{p.fullName || 'Tu nombre'}</h3><p className="mt-1.5 text-[9px] font-bold">{draft.targetRole}</p><p className="mt-1 text-[6.5px] break-words">{contact}</p></header>
    {draft.summary && <PreviewSection title="Perfil profesional"><p>{draft.summary}</p></PreviewSection>}
    {draft.experience.length>0 && <PreviewSection title="Experiencia">{draft.experience.map(item=><PreviewEntry key={item.id} title={item.role} meta={[item.company,item.location,item.start&&item.end?`${item.start} - ${item.end}`:item.start||item.end].filter(Boolean).join(' | ')} bullets={item.bullets}/>)}</PreviewSection>}
    {draft.projects.length>0 && <PreviewSection title="Proyectos">{draft.projects.map(item=><PreviewEntry key={item.id} title={item.name} meta={item.link} text={item.description} bullets={item.bullets}/>)}</PreviewSection>}
    {draft.education.length>0 && <PreviewSection title="Formación">{draft.education.map(item=><PreviewEntry key={item.id} title={item.degree} meta={[item.institution,item.location,item.start&&item.end?`${item.start} - ${item.end}`:item.start||item.end].filter(Boolean).join(' | ')}/>)}</PreviewSection>}
    <PreviewSection title="Habilidades"><p><b>Técnicas:</b> {draft.technicalSkills}</p>{draft.softSkills&&<p><b>Profesionales:</b> {draft.softSkills}</p>}{draft.languages&&<p><b>Idiomas:</b> {draft.languages}</p>}</PreviewSection>
  </div>;
}
function PreviewSection({title,children}) { return <section className="mb-2.5"><h4 className="text-[8px] font-bold uppercase tracking-[0.12em] border-b border-black mb-1.5">{title}</h4>{children}</section>; }
function PreviewEntry({title,meta,text,bullets=[]}) { return <div className="mb-2"><p className="font-bold text-[8px]">{title}</p>{meta&&<p className="italic text-[7px] mb-0.5">{meta}</p>}{text&&<p>{text}</p>}{bullets?.filter(Boolean).length>0&&<ul className="pl-3 list-disc">{bullets.filter(Boolean).map((b,i)=><li key={i}>{b}</li>)}</ul>}</div>; }
