import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../config';

// Rutas privadas que NO se trackean (panel de admin).
const PRIVATE = [/^\/admin/, /^\/dashboard/];

/**
 * Registra una visita anónima en cada cambio de ruta pública.
 * No bloquea el render (fetch con keepalive) y falla en silencio si el
 * backend no responde. No trackea el panel de admin.
 */
export default function PageTracker() {
    const { pathname } = useLocation();
    const last = useRef(null);

    useEffect(() => {
        if (PRIVATE.some(re => re.test(pathname))) return;
        // Evita duplicar el mismo path seguido (ej. re-render).
        if (last.current === pathname) return;
        last.current = pathname;

        try {
            fetch(`${API_URL}/analytics/track`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: pathname, referrer: document.referrer || '' }),
                keepalive: true,
            }).catch(() => {});
        } catch { /* nunca romper la navegación por el tracking */ }
    }, [pathname]);

    return null;
}
