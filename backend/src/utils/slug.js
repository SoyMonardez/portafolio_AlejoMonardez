/**
 * Convierte cualquier string a un slug url-safe.
 * Equivalente al slugify() del PHP viejo.
 */
export function slugify(text) {
    if (!text) return `project-${Date.now()}`;
    return String(text)
        .normalize('NFD')                    // separa acentos
        .replace(/[̀-ͯ]/g, '')     // quita acentos
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')         // todo lo no-alfanumérico → guión
        .replace(/^-+|-+$/g, '')             // trim guiones de los bordes
        .replace(/-{2,}/g, '-')              // colapsa guiones repetidos
        || `project-${Date.now()}`;
}
