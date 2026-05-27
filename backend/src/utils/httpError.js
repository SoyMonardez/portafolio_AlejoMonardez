/**
 * Error tipado para fallar desde un service/route con código HTTP intencional.
 * El errorHandler middleware lo serializa a la respuesta.
 */
export class HttpError extends Error {
    constructor(status, message, detail = null) {
        super(message);
        this.status = status;
        this.detail = detail;
    }
}

export const badRequest   = (msg, detail) => new HttpError(400, msg, detail);
export const unauthorized = (msg = 'No autorizado') => new HttpError(401, msg);
export const forbidden    = (msg = 'Prohibido') => new HttpError(403, msg);
export const notFound     = (msg = 'No encontrado') => new HttpError(404, msg);
