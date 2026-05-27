import 'dotenv/config';

/**
 * Lee y valida las variables de entorno una sola vez al arrancar.
 * Si falta algo crítico, el server no levanta — fail fast.
 */
const required = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
for (const k of required) {
    if (!process.env[k]) {
        console.error(`[env] Falta variable obligatoria: ${k}`);
        process.exit(1);
    }
}

const num = (v, def) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
};

export const env = Object.freeze({
    port:       num(process.env.PORT, 3000),
    nodeEnv:    process.env.NODE_ENV || 'development',
    isProd:     process.env.NODE_ENV === 'production',

    corsOrigins: (process.env.CORS_ORIGINS || '*')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),

    db: {
        host: process.env.DB_HOST,
        port: num(process.env.DB_PORT, 3306),
        user: process.env.DB_USER,
        pass: process.env.DB_PASS || '',
        name: process.env.DB_NAME,
    },

    jwt: {
        secret:    process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    upload: {
        dir:        process.env.UPLOAD_DIR || '../uploads/projects',
        maxBytes:   num(process.env.UPLOAD_MAX_MB, 5) * 1024 * 1024,
        publicBase: process.env.UPLOAD_PUBLIC_BASE || '/uploads/projects',
    },

    smtp: {
        host:   process.env.SMTP_HOST,
        port:   num(process.env.SMTP_PORT, 465),
        secure: process.env.SMTP_SECURE !== 'false',
        user:   process.env.SMTP_USER,
        pass:   process.env.SMTP_PASS,
        notifyTo: process.env.NOTIFY_TO,
    },

    rateLimit: {
        contactMax:       num(process.env.CONTACT_RATE_MAX, 3),
        contactWindowMin: num(process.env.CONTACT_RATE_WINDOW_MIN, 60),
    },
});
