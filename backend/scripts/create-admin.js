/**
 * Script CLI para crear un usuario admin nuevo.
 *
 * Uso:
 *   node scripts/create-admin.js <username> <password>
 *
 * Ejemplo:
 *   node scripts/create-admin.js alejo SuperSecret123
 *
 * Reemplaza al viejo api/install.php.
 */
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/db.js';

const [, , username, password] = process.argv;

if (!username || !password) {
    console.error('Uso: node scripts/create-admin.js <username> <password>');
    process.exit(1);
}

if (password.length < 8) {
    console.error('La contraseña debe tener al menos 8 caracteres');
    process.exit(1);
}

try {
    const hash = await bcrypt.hash(password, 10);
    await pool.execute(
        `INSERT INTO admins (username, password_hash)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
        [username, hash]
    );
    console.log(`✓ Admin '${username}' creado/actualizado`);
    process.exit(0);
} catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
}
