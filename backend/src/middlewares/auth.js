import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { unauthorized } from '../utils/httpError.js';

/**
 * Verifica el JWT del header `Authorization`.
 * Acepta tanto "Bearer <token>" como "<token>" (para no romper el frontend viejo).
 */
export function requireAuth(req, _res, next) {
    const raw = req.headers.authorization || '';
    const token = raw.startsWith('Bearer ') ? raw.slice(7) : raw;
    if (!token) return next(unauthorized());

    try {
        req.admin = jwt.verify(token, env.jwt.secret);
        next();
    } catch {
        next(unauthorized('Token inválido o expirado'));
    }
}
