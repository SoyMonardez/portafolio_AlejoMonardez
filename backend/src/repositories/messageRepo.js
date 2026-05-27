import { pool } from '../config/db.js';

export const messageRepo = {
    async findAll() {
        const [rows] = await pool.query(
            `SELECT id, name, email, phone, message, is_read, created_at
               FROM messages
              ORDER BY created_at DESC`
        );
        return rows;
    },

    async create({ name, email, phone, message }) {
        const [result] = await pool.execute(
            'INSERT INTO messages (name, email, phone, message) VALUES (?, ?, ?, ?)',
            [name, email, phone || '', message]
        );
        return result.insertId;
    },

    async delete(id) {
        const [result] = await pool.execute('DELETE FROM messages WHERE id = ?', [id]);
        return result.affectedRows;
    },

    async markRead(id) {
        const [result] = await pool.execute('UPDATE messages SET is_read = 1 WHERE id = ?', [id]);
        return result.affectedRows;
    },
};
