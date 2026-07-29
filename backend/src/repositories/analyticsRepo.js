import { pool } from '../config/db.js';

/**
 * Acceso a la tabla `analytics_events` — tracking propio, anónimo.
 * No guarda IPs ni datos personales: solo path, referrer agrupado, dispositivo
 * y un hash de visitante que rota a diario (privacidad by-design).
 */
export const analyticsRepo = {
    /** Crea la tabla si no existe. Idempotente — corre en cada arranque. */
    async ensureSchema() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS analytics_events (
                id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                path           VARCHAR(255)  NOT NULL,
                referrer_host  VARCHAR(255)  NOT NULL DEFAULT '',
                referrer_group VARCHAR(32)   NOT NULL DEFAULT 'directo',
                device         VARCHAR(16)   NOT NULL DEFAULT 'desktop',
                visitor_hash   CHAR(16)      NOT NULL DEFAULT '',
                created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY idx_created (created_at),
                KEY idx_path (path),
                KEY idx_visitor (visitor_hash, created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
    },

    async insert({ path, referrerHost, referrerGroup, device, visitorHash }) {
        await pool.execute(
            `INSERT INTO analytics_events (path, referrer_host, referrer_group, device, visitor_hash)
             VALUES (?, ?, ?, ?, ?)`,
            [path, referrerHost, referrerGroup, device, visitorHash]
        );
    },

    /** Totales del rango + últimas 24h. */
    async totals(sinceDays) {
        const [rows] = await pool.query(
            `SELECT
                COUNT(*)                                                     AS visits,
                COUNT(DISTINCT visitor_hash)                                 AS uniques,
                SUM(created_at >= (NOW() - INTERVAL 24 HOUR))                AS last24h
             FROM analytics_events
             WHERE created_at >= (NOW() - INTERVAL ? DAY)`,
            [sinceDays]
        );
        const r = rows[0] || {};
        return {
            visits:  Number(r.visits)  || 0,
            uniques: Number(r.uniques) || 0,
            last24h: Number(r.last24h) || 0,
        };
    },

    /** Visitas y únicos por día (para el gráfico de línea). */
    async byDay(sinceDays) {
        const [rows] = await pool.query(
            `SELECT DATE(created_at) AS day,
                    COUNT(*)                     AS visits,
                    COUNT(DISTINCT visitor_hash) AS uniques
             FROM analytics_events
             WHERE created_at >= (NOW() - INTERVAL ? DAY)
             GROUP BY DATE(created_at)
             ORDER BY day ASC`,
            [sinceDays]
        );
        return rows.map(r => ({
            day:     r.day instanceof Date ? r.day.toISOString().slice(0, 10) : String(r.day).slice(0, 10),
            visits:  Number(r.visits)  || 0,
            uniques: Number(r.uniques) || 0,
        }));
    },

    async topPaths(sinceDays, limit = 8) {
        const [rows] = await pool.query(
            `SELECT path, COUNT(*) AS visits
             FROM analytics_events
             WHERE created_at >= (NOW() - INTERVAL ? DAY)
             GROUP BY path
             ORDER BY visits DESC
             LIMIT ?`,
            [sinceDays, limit]
        );
        return rows.map(r => ({ path: r.path, visits: Number(r.visits) || 0 }));
    },

    async byGroup(column, sinceDays) {
        // `column` viene de una lista blanca (nunca de input del usuario).
        const [rows] = await pool.query(
            `SELECT ${column} AS name, COUNT(*) AS visits
             FROM analytics_events
             WHERE created_at >= (NOW() - INTERVAL ? DAY)
             GROUP BY ${column}
             ORDER BY visits DESC`,
            [sinceDays]
        );
        return rows.map(r => ({ name: r.name || 'otros', visits: Number(r.visits) || 0 }));
    },
};
