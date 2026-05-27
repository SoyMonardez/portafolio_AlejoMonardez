import mysql from 'mysql2/promise';
import { env } from './env.js';

/**
 * Pool de conexiones a MySQL — único en toda la app.
 * Las queries pasan por aquí vía los repositories (no acceder directo desde routes/services).
 */
export const pool = mysql.createPool({
    host:            env.db.host,
    port:            env.db.port,
    user:            env.db.user,
    password:        env.db.pass,
    database:        env.db.name,
    charset:         'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit:      0,
});

export async function pingDb() {
    const conn = await pool.getConnection();
    try {
        await conn.ping();
    } finally {
        conn.release();
    }
}
