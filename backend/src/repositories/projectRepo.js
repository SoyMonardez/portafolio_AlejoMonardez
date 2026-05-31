import { pool } from '../config/db.js';

const SELECT_FIELDS = `
    id, slug,
    title, title_en,
    category, category_en,
    badge, badge_en,
    description_short, description_short_en,
    description, description_en,
    images, demo_url, status, github_url, tech, credentials, featured, sort_order
`;

/**
 * Mapea una fila cruda de MySQL al objeto que consume el frontend.
 * Parsea JSON columns y normaliza nullables.
 */
function hydrate(row) {
    if (!row) return null;
    return {
        ...row,
        tech:        safeJson(row.tech, []),
        images:      safeJson(row.images, []),
        credentials: safeJson(row.credentials, []),
        featured:    Number(row.featured) === 1,
        status:      row.status || 'production',
        github_url:  row.github_url || '',
        title_en:             row.title_en             ?? '',
        category_en:          row.category_en          ?? '',
        badge_en:             row.badge_en             ?? '',
        description_short:    row.description_short    ?? '',
        description_short_en: row.description_short_en ?? '',
        description:          row.description          ?? '',
        description_en:       row.description_en       ?? '',
    };
}

function safeJson(value, fallback) {
    if (Array.isArray(value) || (value && typeof value === 'object')) return value;
    try { return JSON.parse(value) || fallback; }
    catch { return fallback; }
}

export const projectRepo = {
    async findAll({ featuredOnly = false } = {}) {
        const where = featuredOnly ? 'WHERE featured = 1' : '';
        const [rows] = await pool.query(
            `SELECT ${SELECT_FIELDS} FROM projects ${where} ORDER BY sort_order ASC, id ASC`
        );
        return rows.map(hydrate);
    },

    async findById(id) {
        const [rows] = await pool.query(
            `SELECT ${SELECT_FIELDS} FROM projects WHERE id = ? LIMIT 1`,
            [id]
        );
        return hydrate(rows[0]);
    },

    async slugExists(slug) {
        const [rows] = await pool.query(
            'SELECT 1 FROM projects WHERE slug = ? LIMIT 1', [slug]
        );
        return rows.length > 0;
    },

    async create(data) {
        const [result] = await pool.execute(
            `INSERT INTO projects
                (slug, title, title_en, category, category_en, badge, badge_en,
                 description_short, description_short_en,
                 description, description_en, images, demo_url, status, github_url, tech, credentials, featured, sort_order)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
                data.slug, data.title, data.title_en, data.category, data.category_en,
                data.badge, data.badge_en,
                data.description_short || '', data.description_short_en || '',
                data.description || '', data.description_en || '',
                JSON.stringify(data.images || []),
                data.demo_url || '',
                data.status || 'production',
                data.github_url || '',
                JSON.stringify(data.tech || []),
                JSON.stringify(data.credentials || []),
                data.featured ? 1 : 0,
                data.sort_order || 0,
            ]
        );
        return result.insertId;
    },

    async update(id, fields) {
        const keys = Object.keys(fields);
        if (!keys.length) return 0;

        const JSON_COLS = new Set(['images', 'tech', 'credentials']);
        const sets = [];
        const params = [];
        for (const k of keys) {
            sets.push(`${k} = ?`);
            const v = fields[k];
            // Las columnas JSON deben serializarse
            params.push(JSON_COLS.has(k) ? JSON.stringify(v) : v);
        }
        params.push(id);

        const [result] = await pool.execute(
            `UPDATE projects SET ${sets.join(', ')} WHERE id = ?`,
            params
        );
        return result.affectedRows;
    },

    async delete(id) {
        const [result] = await pool.execute('DELETE FROM projects WHERE id = ?', [id]);
        return result.affectedRows;
    },
};
