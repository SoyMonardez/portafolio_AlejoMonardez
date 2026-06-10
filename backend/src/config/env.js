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

// El JWT_SECRET es lo único que separa a un atacante de firmar sus propios
// tokens de admin. Si quedó el placeholder del .env.example o es demasiado
// corto, no levantamos en producción — fail fast antes de exponer el panel.
{
    const secret = process.env.JWT_SECRET;
    const isWeak = secret.length < 32 || /cambiar|change|secret|placeholder|example/i.test(secret);
    if (isWeak) {
        const msg = '[env] JWT_SECRET es débil o es el placeholder. Generá uno con: '
            + 'node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"';
        if (process.env.NODE_ENV === 'production') {
            console.error(msg);
            process.exit(1);
        }
        console.warn(msg + ' (permitido solo en desarrollo)');
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

    // En dev, si no se configuran orígenes, se permite cualquiera (cómodo para
    // localhost). En producción NO caemos a wildcard: un CORS_ORIGINS vacío deja
    // la lista vacía (deniega cross-origin). La SPA igual funciona porque habla
    // con el backend mismo-origen vía el proxy de Nginx (/api), donde CORS no aplica.
    corsOrigins: (process.env.CORS_ORIGINS
        || (process.env.NODE_ENV === 'production' ? '' : '*'))
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

    instagram: {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
        businessId:  process.env.INSTAGRAM_BUSINESS_ID  || '',
    },

    groq: {
        apiKey: process.env.GROQ_API_KEY || '',
        model:  process.env.GROQ_MODEL   || 'llama-3.3-70b-versatile',
    },

    // Microservicio de IA. El backend lo proxea (con auth de admin) para que el
    // ai-service no quede expuesto público y el token compartido viva solo acá.
    aiService: {
        url:   process.env.AI_SERVICE_URL || 'http://localhost:3001',
        token: process.env.AI_SHARED_TOKEN || '',
    },

    sitePublicUrl: process.env.SITE_PUBLIC_URL || 'https://alejomonardez.com',
});
