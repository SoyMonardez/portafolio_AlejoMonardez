import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'site_lang';

/**
 * Hook compartido para el idioma del sitio (ES / EN).
 * Persiste en localStorage para que la elección se mantenga entre páginas.
 * Sincroniza entre tabs vía `storage` event.
 */
export function useLang() {
    const [lang, setLangState] = useState(() => {
        if (typeof window === 'undefined') return 'es';
        return localStorage.getItem(STORAGE_KEY) || 'es';
    });

    const setLang = useCallback((newLang) => {
        const valid = newLang === 'en' ? 'en' : 'es';
        setLangState(valid);
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, valid);
            // Notificar a otros componentes en la misma pestaña
            window.dispatchEvent(new CustomEvent('lang-changed', { detail: valid }));
        }
    }, []);

    const toggle = useCallback(() => {
        setLang(lang === 'es' ? 'en' : 'es');
    }, [lang, setLang]);

    // Escuchar cambios desde otras pestañas (storage event) o desde otros componentes
    useEffect(() => {
        const onStorage = (e) => {
            if (e.key === STORAGE_KEY && e.newValue) setLangState(e.newValue);
        };
        const onLocal = (e) => {
            if (e.detail) setLangState(e.detail);
        };
        window.addEventListener('storage', onStorage);
        window.addEventListener('lang-changed', onLocal);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('lang-changed', onLocal);
        };
    }, []);

    return [lang, setLang, toggle];
}
