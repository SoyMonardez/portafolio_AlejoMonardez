import { env } from './config/env.js';
import { buildApp } from './app.js';
import { pingDb } from './config/db.js';
import { isMailerEnabled } from './config/mailer.js';
import { analyticsService } from './services/analyticsService.js';

const app = buildApp();

try {
    await pingDb();
    console.log(`[backend] DB OK (${env.db.host}/${env.db.name})`);
} catch (err) {
    console.error('[backend] No se pudo conectar a MySQL:', err.message);
    process.exit(1);
}

// Crea la tabla de analytics si falta (idempotente). No bloquea el arranque si falla.
try {
    await analyticsService.ensureSchema();
    console.log('[backend] Analytics schema OK');
} catch (err) {
    console.error('[backend] No se pudo asegurar el schema de analytics:', err.message);
}

app.listen(env.port, () => {
    console.log(`[backend] escuchando en http://localhost:${env.port}  (${env.nodeEnv})`);
    console.log(`[backend] Notificaciones por email: ${isMailerEnabled() ? 'ON' : 'OFF (configurá SMTP_* en .env)'}`);
});
