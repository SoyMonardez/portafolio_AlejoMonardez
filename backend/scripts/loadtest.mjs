/**
 * Load test controlado contra producción.
 *
 * No busca tumbar el sitio (hay rate-limit y es prod real), sino medir:
 *   - latencia p50/p90/p99 bajo concurrencia
 *   - throughput (req/s)
 *   - tasa de error por endpoint
 *   - efectividad del cache (comparar 1er hit vs siguientes)
 *
 * Uso:
 *   node loadtest.mjs [BASE_URL] [CONCURRENCY] [DURATION_SEG]
 *   node loadtest.mjs https://alejomonardez.com/api 20 15
 */

const BASE = process.argv[2] || 'https://alejomonardez.com/api';
const CONCURRENCY = Number(process.argv[3] || 20);
const DURATION_MS = Number(process.argv[4] || 15) * 1000;

// Endpoints públicos GET (los que un visitante real golpea). Pesos = frecuencia.
const SCENARIOS = [
    { name: 'GET /projects',          weight: 5, fn: () => get('/projects') },
    { name: 'GET /projects?featured', weight: 3, fn: () => get('/projects?featured=1') },
    { name: 'GET /settings',          weight: 4, fn: () => get('/settings') },
    { name: 'GET /health',            weight: 1, fn: () => get('/health') },
];

const totalWeight = SCENARIOS.reduce((s, x) => s + x.weight, 0);
const stats = {}; // name -> { count, errors, latencies[] }
for (const s of SCENARIOS) stats[s.name] = { count: 0, errors: 0, latencies: [], statuses: {} };

async function get(path) {
    const t0 = performance.now();
    const res = await fetch(BASE + path, { headers: { 'Accept': 'application/json' } });
    await res.text(); // drenar el body para medir tiempo real de transferencia
    return { ms: performance.now() - t0, status: res.status };
}

function pickScenario() {
    let r = Math.random() * totalWeight;
    for (const s of SCENARIOS) { if ((r -= s.weight) <= 0) return s; }
    return SCENARIOS[0];
}

async function worker(deadline) {
    while (performance.now() < deadline) {
        const sc = pickScenario();
        const st = stats[sc.name];
        try {
            const { ms, status } = await sc.fn();
            st.count++;
            st.latencies.push(ms);
            st.statuses[status] = (st.statuses[status] || 0) + 1;
            if (status >= 400) st.errors++;
        } catch (err) {
            st.count++;
            st.errors++;
            st.statuses['NETERR'] = (st.statuses['NETERR'] || 0) + 1;
        }
    }
}

function pct(arr, p) {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

(async () => {
    console.log(`\n🔥 Load test → ${BASE}`);
    console.log(`   concurrencia=${CONCURRENCY} · duración=${DURATION_MS / 1000}s\n`);

    const t0 = performance.now();
    const deadline = t0 + DURATION_MS;
    await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(deadline)));
    const elapsed = (performance.now() - t0) / 1000;

    let totalReq = 0, totalErr = 0, allLat = [];
    console.log('─'.repeat(78));
    console.log('Endpoint'.padEnd(26) + 'req'.padStart(7) + 'err'.padStart(6) +
                'p50'.padStart(8) + 'p90'.padStart(8) + 'p99'.padStart(8) + 'max'.padStart(9));
    console.log('─'.repeat(78));
    for (const s of SCENARIOS) {
        const st = stats[s.name];
        totalReq += st.count; totalErr += st.errors; allLat.push(...st.latencies);
        console.log(
            s.name.padEnd(26) +
            String(st.count).padStart(7) +
            String(st.errors).padStart(6) +
            (pct(st.latencies, 50).toFixed(0) + 'ms').padStart(8) +
            (pct(st.latencies, 90).toFixed(0) + 'ms').padStart(8) +
            (pct(st.latencies, 99).toFixed(0) + 'ms').padStart(8) +
            (Math.max(0, ...st.latencies).toFixed(0) + 'ms').padStart(9)
        );
        const codes = Object.entries(st.statuses).map(([k, v]) => `${k}:${v}`).join(' ');
        console.log('   └ status: ' + codes);
    }
    console.log('─'.repeat(78));
    console.log(`TOTAL: ${totalReq} req en ${elapsed.toFixed(1)}s = ` +
                `${(totalReq / elapsed).toFixed(1)} req/s · ` +
                `errores: ${totalErr} (${((totalErr / totalReq) * 100).toFixed(2)}%)`);
    console.log(`Latencia global: p50=${pct(allLat, 50).toFixed(0)}ms ` +
                `p90=${pct(allLat, 90).toFixed(0)}ms p99=${pct(allLat, 99).toFixed(0)}ms\n`);
})();
