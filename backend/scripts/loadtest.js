/**
 * Load test — tráfico concurrente simulado contra la API.
 *
 * Sin dependencias: usa el fetch global de Node 18+ y un pool de "workers"
 * (promesas en loop) que martillan los endpoints hasta que se acaba el tiempo.
 *
 * Qué valida:
 *   - Que el CACHE funciona: el hit rate de /health debe subir bajo carga
 *     (si cada request recalculara todo, el hit rate quedaría en ~0).
 *   - Que la COLA absorbe los writes sin bloquear: /contact responde rápido
 *     y los jobs quedan encolados/procesándose en 2do plano.
 *   - Que el RATE LIMIT del contacto corta a tiempo (429 esperado, no es error).
 *   - Latencias (p50/p90/p99), throughput y errores reales (5xx / conexión).
 *
 * Uso:
 *   node scripts/loadtest.js
 *   node scripts/loadtest.js --url http://localhost:3000 --duration 20 --concurrency 80
 *   node scripts/loadtest.js --write          # incluye POST /contact (honeypot, no ensucia la DB)
 *
 * Env equivalentes: BASE_URL, DURATION, CONCURRENCY.
 */

// ───────────────────── Config / args ─────────────────────
function arg(name, def) {
    const i = process.argv.indexOf(`--${name}`);
    return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : def;
}
const hasFlag = (name) => process.argv.includes(`--${name}`);

const BASE_URL    = arg('url', process.env.BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const DURATION    = Number(arg('duration', process.env.DURATION || 15));      // segundos
const CONCURRENCY = Number(arg('concurrency', process.env.CONCURRENCY || 50)); // requests en paralelo
const INCLUDE_WRITE = hasFlag('write');

// ───────────────────── Escenarios ─────────────────────
// Mezcla realista read-heavy: un portafolio recibe muchísimas más lecturas
// (ver proyectos / settings) que escrituras (mandar mensaje).
const scenarios = [
    { name: 'GET /projects',            weight: 40, method: 'GET', path: '/projects' },
    { name: 'GET /projects?featured=1', weight: 25, method: 'GET', path: '/projects?featured=1' },
    { name: 'GET /settings',            weight: 20, method: 'GET', path: '/settings' },
    { name: 'GET /health',              weight: 10, method: 'GET', path: '/health' },
];

if (INCLUDE_WRITE) {
    // Honeypot lleno → el service corta antes de tocar la DB / encolar email.
    // Ejercita routing + rate-limit + validación SIN ensuciar la bandeja ni
    // disparar SMTP. Los primeros 3 dan 200, el resto 429 (rate-limit OK).
    scenarios.push({
        name: 'POST /contact (honeypot)',
        weight: 5,
        method: 'POST',
        path: '/contact',
        body: { name: 'LoadTest', email: 'load@test.dev', message: 'ping de carga', website: 'bot-trap' },
        // 429 es resultado ESPERADO del rate limiter, no un fallo.
        okStatuses: [200, 429],
    });
}

// Tabla acumulada de pesos para sortear escenario en O(1) amortizado.
const totalWeight = scenarios.reduce((s, x) => s + x.weight, 0);
function pickScenario() {
    let r = Math.random() * totalWeight;
    for (const s of scenarios) { if ((r -= s.weight) < 0) return s; }
    return scenarios[0];
}

// ───────────────────── Métricas ─────────────────────
const stats = new Map(); // name -> { count, latencies[], statuses{}, errors }
function record(name, ms, status, errMsg) {
    let s = stats.get(name);
    if (!s) { s = { count: 0, latencies: [], statuses: {}, errors: 0 }; stats.set(name, s); }
    s.count++;
    if (ms != null) s.latencies.push(ms);
    if (status != null) s.statuses[status] = (s.statuses[status] || 0) + 1;
    if (errMsg) { s.errors++; globalErrors.push(`${name}: ${errMsg}`); }
}
const globalErrors = [];

function pctl(sorted, p) {
    if (!sorted.length) return 0;
    const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
    return sorted[idx];
}

// ───────────────────── Un request ─────────────────────
async function fireOne(s) {
    const okStatuses = s.okStatuses || [200];
    const t0 = performance.now();
    try {
        const res = await fetch(BASE_URL + s.path, {
            method: s.method,
            headers: s.body ? { 'Content-Type': 'application/json' } : undefined,
            body: s.body ? JSON.stringify(s.body) : undefined,
        });
        const ms = performance.now() - t0;
        // Drenar el body para liberar el socket (si no, el pool se traba).
        await res.text();
        const isError = !okStatuses.includes(res.status);
        record(s.name, ms, res.status, isError ? `status ${res.status}` : null);
    } catch (err) {
        const ms = performance.now() - t0;
        record(s.name, ms, null, err.cause?.code || err.message);
    }
}

// ───────────────────── Worker pool ─────────────────────
async function worker(deadline) {
    while (performance.now() < deadline) {
        await fireOne(pickScenario());
    }
}

// ───────────────────── /health snapshot ─────────────────────
async function health() {
    try {
        const res = await fetch(BASE_URL + '/health');
        if (!res.ok) return null;
        return await res.json();
    } catch { return null; }
}

// ───────────────────── Main ─────────────────────
async function main() {
    console.log('\n════════════════════════════════════════════════');
    console.log('  LOAD TEST — alejomonardez.com API');
    console.log('════════════════════════════════════════════════');
    console.log(`  Target:      ${BASE_URL}`);
    console.log(`  Duración:    ${DURATION}s`);
    console.log(`  Concurrencia:${CONCURRENCY}`);
    console.log(`  Escrituras:  ${INCLUDE_WRITE ? 'sí (--write)' : 'no'}`);
    console.log('────────────────────────────────────────────────');

    // Sanity check + snapshot inicial de cache/cola.
    const before = await health();
    if (!before) {
        console.error(`\n✗ No pude conectar a ${BASE_URL}/health`);
        console.error('  ¿Está corriendo el backend? (cd backend && npm start)\n');
        process.exit(2);
    }
    console.log(`  Backend OK · env=${before.env}`);
    console.log(`  Cache inicial: ${JSON.stringify(before.cache && { hitRate: before.cache.hitRate, size: before.cache.size })}`);

    const start = performance.now();
    const deadline = start + DURATION * 1000;
    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(deadline)));
    const elapsed = (performance.now() - start) / 1000;

    // Snapshot final.
    const after = await health();

    // ───────────────────── Reporte ─────────────────────
    let totalReq = 0, totalErr = 0;
    const allLat = [];
    console.log('\n──────────────── Por endpoint ────────────────');
    for (const [name, s] of stats) {
        totalReq += s.count;
        totalErr += s.errors;
        const sorted = s.latencies.slice().sort((a, b) => a - b);
        for (const l of sorted) allLat.push(l);
        const statusStr = Object.entries(s.statuses).map(([k, v]) => `${k}:${v}`).join(' ') || '—';
        console.log(`\n  ${name}`);
        console.log(`    reqs=${s.count}  errores=${s.errors}  status[${statusStr}]`);
        console.log(`    p50=${pctl(sorted, 50).toFixed(1)}ms  p90=${pctl(sorted, 90).toFixed(1)}ms  ` +
                    `p99=${pctl(sorted, 99).toFixed(1)}ms  max=${(sorted.at(-1) || 0).toFixed(1)}ms`);
    }

    allLat.sort((a, b) => a - b);
    const rps = totalReq / elapsed;
    const errRate = totalReq ? (totalErr / totalReq) * 100 : 0;

    console.log('\n──────────────── Global ────────────────');
    console.log(`  Requests:    ${totalReq}  en ${elapsed.toFixed(1)}s`);
    console.log(`  Throughput:  ${rps.toFixed(0)} req/s`);
    console.log(`  Latencia:    p50=${pctl(allLat, 50).toFixed(1)}ms  p90=${pctl(allLat, 90).toFixed(1)}ms  p99=${pctl(allLat, 99).toFixed(1)}ms`);
    console.log(`  Errores:     ${totalErr} (${errRate.toFixed(2)}%)`);

    if (after?.cache) {
        console.log('\n──────────────── Cache (efectividad) ────────────────');
        console.log(`  hits=${after.cache.hits}  misses=${after.cache.misses}  hitRate=${after.cache.hitRate}`);
        const goodCache = after.cache.hitRate >= 0.8;
        console.log(`  ${goodCache ? '✓' : '⚠'} ${goodCache
            ? 'El cache absorbe la carga: casi todo se sirve desde memoria.'
            : 'Hit rate bajo — revisar TTL o invalidaciones demasiado agresivas.'}`);
    }
    if (after?.queue) {
        console.log('\n──────────────── Cola (async) ────────────────');
        const q = after.queue;
        console.log(`  encolados=${q.enqueued}  completados=${q.completed}  ` +
                    `fallidos=${q.failed}  reintentos=${q.retried}  pendientes=${q.pending}`);
    }

    // ───────────────────── Veredicto ─────────────────────
    console.log('\n════════════════════════════════════════════════');
    if (globalErrors.length) {
        console.log(`  ✗ ${globalErrors.length} request(s) con error. Muestras:`);
        for (const e of [...new Set(globalErrors)].slice(0, 8)) console.log(`     · ${e}`);
    }
    const FAIL_THRESHOLD = 1; // % de error tolerable
    const failed = errRate > FAIL_THRESHOLD;
    console.log(`  ${failed ? '✗ FALLÓ' : '✓ PASÓ'} — error rate ${errRate.toFixed(2)}% (umbral ${FAIL_THRESHOLD}%)`);
    console.log('════════════════════════════════════════════════\n');

    process.exit(failed ? 1 : 0);
}

main().catch((err) => {
    console.error('\n✗ Load test crasheó:', err);
    process.exit(2);
});
