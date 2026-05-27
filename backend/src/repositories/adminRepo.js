import { pool } from '../config/db.js';

/**
 * Acceso a la tabla `admins`. Solo SQL, sin lógica.
 */
export const adminRepo = {
    async findByUsername(username) {
        const [rows] = await pool.query(
            'SELECT id, username, password_hash FROM admins WHERE username = ? LIMIT 1',
            [username]
        );
        return rows[0] || null;
    },
};
