import { HttpError } from '../utils/httpError.js';
import { env } from '../config/env.js';

/**
 * Middleware final que captura cualquier error lanzado por routes/services
 * y lo serializa a JSON. En producción oculta stack traces.
 */
export function errorHandler(err, _req, res, _next) {
    if (err instanceof HttpError) {
        return res.status(err.status).json({
            error:  err.message,
            detail: err.detail,
        });
    }

    console.error('[errorHandler]', err);

    res.status(500).json({
        error:  'Server error',
        detail: env.isProd ? null : (err.message || String(err)),
    });
}

export function notFoundHandler(_req, res) {
    res.status(404).json({ error: 'Not found' });
}
