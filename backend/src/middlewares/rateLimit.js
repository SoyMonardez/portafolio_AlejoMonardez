import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

/**
 * Rate limiter para el formulario de contacto público.
 * Limita por IP (clave por defecto de express-rate-limit).
 */
export const contactRateLimiter = rateLimit({
    windowMs: env.rateLimit.contactWindowMin * 60 * 1000,
    max:      env.rateLimit.contactMax,
    standardHeaders: true,
    legacyHeaders:   false,
    message: {
        error: 'Has alcanzado el límite de mensajes por usuario. Se actualizará en 24hs.',
    },
});

/**
 * Limiter genérico para login: previene fuerza bruta.
 */
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      10,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { error: 'Demasiados intentos de login. Esperá 15 minutos.' },
});
