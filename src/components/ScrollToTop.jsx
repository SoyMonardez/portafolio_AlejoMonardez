import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Lleva el scroll al top cada vez que cambia la ruta.
 * React Router por defecto preserva la posición de scroll, lo cual confunde
 * al navegar entre páginas (la página nueva aparece scrolleada por el medio).
 *
 * Excepción: si la URL tiene hash (#contact, #about), respeta el anchor.
 */
export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        if (hash) {
            // Hash navigation: dejá que el browser haga el anchor
            const el = document.querySelector(hash);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                return;
            }
        }
        // Sin hash → top
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }, [pathname, hash]);

    return null;
}
