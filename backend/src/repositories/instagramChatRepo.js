import { pool } from '../config/db.js';

/**
 * Acceso a datos del chatbot de Instagram.
 * Toda query a instagram_chats / instagram_messages pasa por acá.
 */
export const instagramChatRepo = {
    /** Busca un chat por el id de usuario de IG, o lo crea si no existe. */
    async findOrCreateByIgUser(igUserId, username = '') {
        await pool.execute(
            `INSERT INTO instagram_chats (ig_user_id, username)
             VALUES (?, ?)
             ON DUPLICATE KEY UPDATE
               username = IF(VALUES(username) <> '', VALUES(username), username)`,
            [igUserId, username]
        );
        const [rows] = await pool.query(
            'SELECT * FROM instagram_chats WHERE ig_user_id = ? LIMIT 1',
            [igUserId]
        );
        return rows[0];
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM instagram_chats WHERE id = ? LIMIT 1', [id]);
        return rows[0] || null;
    },

    /** Lista de chats para la bandeja del admin (más recientes primero). */
    async listChats({ status = null, limit = 100 } = {}) {
        const where = status ? 'WHERE status = ?' : '';
        const params = status ? [status, limit] : [limit];
        const [rows] = await pool.query(
            `SELECT c.*,
                    (SELECT text FROM instagram_messages m
                     WHERE m.chat_id = c.id ORDER BY m.id DESC LIMIT 1) AS last_message,
                    (SELECT COUNT(*) FROM instagram_messages m WHERE m.chat_id = c.id) AS message_count
             FROM instagram_chats c
             ${where}
             ORDER BY c.last_interaction DESC
             LIMIT ?`,
            params
        );
        return rows;
    },

    /** Historial completo de un chat. */
    async listMessages(chatId, limit = 200) {
        const [rows] = await pool.query(
            'SELECT * FROM instagram_messages WHERE chat_id = ? ORDER BY id ASC LIMIT ?',
            [chatId, limit]
        );
        return rows;
    },

    /**
     * Inserta un mensaje. Si `mid` ya existe (reentrega del webhook), no duplica
     * y devuelve null para que el caller corte el procesamiento.
     */
    async addMessage({ chatId, direction, sender, text, intent = '', mid = '' }) {
        try {
            const [res] = await pool.execute(
                `INSERT INTO instagram_messages (chat_id, direction, sender, text, intent, mid)
                 VALUES (?,?,?,?,?,?)`,
                [chatId, direction, sender, text || '', intent, mid || null]
            );
            return res.insertId;
        } catch (err) {
            if (err.code === 'ER_DUP_ENTRY') return null; // mid repetido → ya procesado
            throw err;
        }
    },

    async updateStatus(chatId, { status, lastIntent } = {}) {
        const sets = [];
        const params = [];
        if (status)     { sets.push('status = ?');      params.push(status); }
        if (lastIntent !== undefined) { sets.push('last_intent = ?'); params.push(lastIntent); }
        if (!sets.length) return 0;
        params.push(chatId);
        const [res] = await pool.execute(
            `UPDATE instagram_chats SET ${sets.join(', ')} WHERE id = ?`, params
        );
        return res.affectedRows;
    },

    /** Enciende/apaga el bot para un chat (manual override del admin). */
    async setBotEnabled(chatId, enabled) {
        const [res] = await pool.execute(
            'UPDATE instagram_chats SET bot_enabled = ?, status = ? WHERE id = ?',
            [enabled ? 1 : 0, enabled ? 'bot_active' : 'human_handled', chatId]
        );
        return res.affectedRows;
    },
};
