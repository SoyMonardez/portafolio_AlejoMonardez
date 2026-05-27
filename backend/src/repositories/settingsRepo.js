import { pool } from '../config/db.js';

export const settingsRepo = {
    async findAll() {
        const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings');
        const out = {};
        for (const r of rows) out[r.setting_key] = r.setting_value;
        return out;
    },

    /** Devuelve el valor crudo de UNA setting (sin ofuscar). Solo uso interno/admin. */
    async findOne(key) {
        const [rows] = await pool.query(
            'SELECT setting_value FROM settings WHERE setting_key = ? LIMIT 1', [key]
        );
        return rows[0]?.setting_value ?? null;
    },

    async upsertMany(kv) {
        if (!kv || typeof kv !== 'object') return 0;
        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            let n = 0;
            for (const [key, value] of Object.entries(kv)) {
                if (!/^[a-zA-Z0-9_-]{1,100}$/.test(key)) continue;
                const v = typeof value === 'string' ? value : JSON.stringify(value);
                await conn.execute(
                    `INSERT INTO settings (setting_key, setting_value)
                     VALUES (?, ?)
                     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
                    [key, v]
                );
                n++;
            }
            await conn.commit();
            return n;
        } catch (e) {
            await conn.rollback();
            throw e;
        } finally {
            conn.release();
        }
    },

    async delete(key) {
        const [result] = await pool.execute('DELETE FROM settings WHERE setting_key = ?', [key]);
        return result.affectedRows;
    },
};
