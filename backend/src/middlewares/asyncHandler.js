/**
 * Wrapper para handlers async — captura promesas rechazadas y las pasa al errorHandler.
 * Evita escribir try/catch en cada route.
 *
 * Uso:  router.get('/x', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
