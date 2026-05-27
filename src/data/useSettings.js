import { useEffect, useState, useCallback } from 'react';
import { API_URL } from '../config';

/**
 * Valores por defecto si la API está caída.
 * Nota: NO incluimos email en plano — anti-bot. Si el backend tampoco devuelve
 * `social_email_b64`, el botón email simplemente no se renderiza.
 */
export const DEFAULT_SETTINGS = {
    social_github:    'https://github.com/SoyMonardez',
    social_whatsapp:  'https://wa.me/2646296764',
    social_email:     '',
    social_email_b64: '',
    social_linkedin:  '',
    social_instagram: '',
};

/**
 * Decodifica el email ofuscado por el backend (base64 + reversed string).
 * Se llama SOLO cuando el usuario hace click — los bots scrapers no ejecutan JS.
 */
export function decodeObfuscatedEmail(b64) {
    if (!b64) return '';
    try {
        return atob(b64).split('').reverse().join('');
    } catch {
        return '';
    }
}

/**
 * Hook: carga las settings públicas desde el backend.
 * Devuelve { settings, loading, error, refresh, save }.
 *
 * `save(obj)` upserta múltiples settings de una vez (requiere token).
 */
export function useSettings() {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading]   = useState(true);
    const [error, setError]       = useState(null);

    const refresh = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/settings`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data && typeof data === 'object' && !data.error) {
                setSettings({ ...DEFAULT_SETTINGS, ...data });
            }
            setLoading(false);
        } catch (err) {
            console.warn('[useSettings] falling back to defaults:', err);
            setError(err);
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    /**
     * Para el panel admin: trae las settings sin ofuscar.
     */
    const fetchRaw = useCallback(async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
        const res = await fetch(`${API_URL}/settings/raw`, {
            headers: { 'Authorization': token || '' }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    }, []);

    const save = useCallback(async (partial) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
        const res = await fetch(`${API_URL}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': token || '' },
            body: JSON.stringify(partial)
        });
        const text = await res.text();
        let data = {};
        try { data = JSON.parse(text); } catch { /* */ }
        if (!res.ok || !data.success) {
            const msg = [data.error, data.detail, data.hint, !data.error && text].filter(Boolean).join(' — ');
            throw new Error(msg || `HTTP ${res.status}`);
        }
        // Optimistic update
        setSettings(prev => ({ ...prev, ...partial }));
        return data;
    }, []);

    return { settings, loading, error, refresh, save, fetchRaw };
}
