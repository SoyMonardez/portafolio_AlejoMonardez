import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const RANGES = [
    { label: '7 días', days: 7 },
    { label: '30 días', days: 30 },
    { label: '90 días', days: 90 },
];

const REF_LABELS = {
    directo: 'Directo / guardado',
    google: 'Google', instagram: 'Instagram', linkedin: 'LinkedIn',
    facebook: 'Facebook', 'twitter/x': 'Twitter / X', bing: 'Bing',
    duckduckgo: 'DuckDuckGo', whatsapp: 'WhatsApp', youtube: 'YouTube',
    github: 'GitHub', otros: 'Otros',
};

const DEVICE_LABELS = { mobile: 'Celular', desktop: 'Computadora', tablet: 'Tablet' };

export default function AnalyticsPanel() {
    const [days, setDays] = useState(30);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('admin_token');
            try {
                const res = await fetch(`${API_URL}/analytics/summary?days=${days}`, {
                    headers: { 'Authorization': token },
                });
                if (res.status === 401) {
                    localStorage.removeItem('admin_token');
                    navigate('/admin');
                    return;
                }
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                if (!cancelled) setData(json);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [days, navigate]);

    const totals = data?.totals || { visits: 0, uniques: 0, last24h: 0 };
    const hasData = (data?.totals?.visits || 0) > 0;

    return (
        <div className="space-y-10">
            {/* Header + rango */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <h2 className="font-serif text-2xl uppercase tracking-widest">Analíticas</h2>
                    <p className="text-white/40 text-xs mt-1">Tráfico de tu sitio · datos propios y anónimos</p>
                </div>
                <div className="flex gap-2">
                    {RANGES.map(r => (
                        <button
                            key={r.days}
                            onClick={() => setDays(r.days)}
                            className={`text-[10px] uppercase tracking-[0.2em] border px-4 py-2 transition-all ${
                                days === r.days
                                    ? 'bg-white text-black border-white'
                                    : 'border-white/20 text-white/50 hover:border-white hover:text-white'
                            }`}
                        >
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && <p className="text-center text-white/30 uppercase tracking-widest text-xs py-24">Cargando…</p>}
            {error && !loading && (
                <p className="text-center text-red-400/80 text-xs py-24">Error al cargar: {error}</p>
            )}

            {!loading && !error && (
                <>
                    {/* Tarjetas de totales */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <StatTile label="Visitas" value={totals.visits} hint={`en ${days} días`} />
                        <StatTile label="Visitantes únicos" value={totals.uniques} hint="aprox. (anónimo)" />
                        <StatTile label="Últimas 24h" value={totals.last24h} hint="visitas" />
                    </div>

                    {!hasData ? (
                        <div className="border border-white/10 bg-neutral-900/30 p-10 text-center">
                            <p className="font-serif text-xl text-white mb-2">Todavía no hay visitas registradas</p>
                            <p className="text-white/50 text-sm max-w-md mx-auto leading-relaxed">
                                El tracking empieza a contar desde ahora. Compartí tu link (Instagram, LinkedIn, WhatsApp)
                                y en unas horas vas a ver acá de dónde llega la gente y qué páginas miran.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Gráfico de visitas por día */}
                            <div className="border border-white/10 bg-neutral-900/30 p-5 md:p-8">
                                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-6">Visitas por día</p>
                                <LineChart byDay={data.byDay} />
                            </div>

                            {/* Grids de barras */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <BarList
                                    title="De dónde vienen"
                                    items={data.referrers}
                                    labelMap={REF_LABELS}
                                />
                                <BarList
                                    title="Páginas más vistas"
                                    items={data.topPaths.map(p => ({ name: p.path, visits: p.visits }))}
                                />
                                <BarList
                                    title="Dispositivos"
                                    items={data.devices}
                                    labelMap={DEVICE_LABELS}
                                />
                                <div className="border border-white/10 bg-neutral-900/30 p-5 md:p-8 flex flex-col justify-center">
                                    <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-3">Qué mirar</p>
                                    <p className="text-white/60 text-sm leading-relaxed">
                                        Si ves visitas llegando desde <strong className="text-white">Google</strong> o
                                        creciendo día a día, es buena señal de que te están encontrando. Fijate que la
                                        gente llegue a <strong className="text-white">/servicios</strong> y
                                        <strong className="text-white"> /proyectos</strong> — ahí es donde se decide
                                        si te contactan.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}

function StatTile({ label, value, hint }) {
    return (
        <div className="border border-white/10 bg-neutral-900/30 p-5 md:p-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-2">{label}</p>
            <p className="font-serif text-4xl md:text-5xl text-white leading-none">{value.toLocaleString('es-AR')}</p>
            {hint && <p className="text-white/30 text-[10px] mt-2">{hint}</p>}
        </div>
    );
}

/** Barras horizontales para rankings simples. */
function BarList({ title, items, labelMap }) {
    const list = (items || []).filter(i => i.visits > 0);
    const max = Math.max(1, ...list.map(i => i.visits));
    return (
        <div className="border border-white/10 bg-neutral-900/30 p-5 md:p-8">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-6">{title}</p>
            {list.length === 0 ? (
                <p className="text-white/30 text-xs">Sin datos aún.</p>
            ) : (
                <div className="space-y-3">
                    {list.map((it, i) => {
                        const name = labelMap?.[it.name] || it.name;
                        return (
                            <div key={i}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-white/70 truncate pr-2">{name}</span>
                                    <span className="text-white/40 shrink-0">{it.visits.toLocaleString('es-AR')}</span>
                                </div>
                                <div className="h-1.5 bg-white/5 overflow-hidden">
                                    <div
                                        className="h-full bg-white/60"
                                        style={{ width: `${(it.visits / max) * 100}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/** Gráfico de línea/área en SVG puro (sin dependencias). */
function LineChart({ byDay }) {
    const data = byDay || [];
    if (data.length === 0) return <p className="text-white/30 text-xs">Sin datos aún.</p>;

    const W = 720, H = 220, PAD = 28;
    const max = Math.max(1, ...data.map(d => d.visits));
    const n = data.length;
    const x = (i) => PAD + (n === 1 ? (W - 2 * PAD) / 2 : (i * (W - 2 * PAD)) / (n - 1));
    const y = (v) => H - PAD - (v / max) * (H - 2 * PAD);

    const pts = data.map((d, i) => `${x(i)},${y(d.visits)}`).join(' ');
    const area = `${PAD},${H - PAD} ${pts} ${x(n - 1)},${H - PAD}`;

    // Etiquetas: primer, medio y último día.
    const idxs = n === 1 ? [0] : [0, Math.floor((n - 1) / 2), n - 1];
    const fmt = (day) => {
        const dt = new Date(day + 'T00:00:00');
        return dt.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[420px]" preserveAspectRatio="xMidYMid meet">
                {/* gridlines horizontales */}
                {[0, 0.5, 1].map((f, i) => (
                    <line key={i} x1={PAD} x2={W - PAD} y1={y(max * f)} y2={y(max * f)}
                          stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                ))}
                {/* área */}
                <polygon points={area} fill="rgba(255,255,255,0.06)" />
                {/* línea */}
                <polyline points={pts} fill="none" stroke="#ffffff" strokeWidth="2"
                          strokeLinejoin="round" strokeLinecap="round" />
                {/* puntos */}
                {data.map((d, i) => (
                    <circle key={i} cx={x(i)} cy={y(d.visits)} r="2.5" fill="#fff" />
                ))}
                {/* max label */}
                <text x={PAD} y={y(max) - 6} fill="rgba(255,255,255,0.4)" fontSize="11">{max}</text>
                {/* etiquetas de fecha */}
                {idxs.map((i) => (
                    <text key={i} x={x(i)} y={H - 8} fill="rgba(255,255,255,0.4)" fontSize="11"
                          textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>
                        {fmt(data[i].day)}
                    </text>
                ))}
            </svg>
        </div>
    );
}
