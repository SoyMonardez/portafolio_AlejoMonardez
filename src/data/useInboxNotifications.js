import { useEffect, useRef } from 'react';

/**
 * Hook: dispara notificaciones (Service Worker + sonido) cuando aparecen mensajes nuevos.
 *
 * - Registra el SW `/notification-sw.js` la primera vez.
 * - Pide permiso de notificación si nunca fue otorgado.
 * - Cuando `messages[0].id` cambia respecto al último visto, dispara la noti.
 *
 * El SW permite que la noti aparezca aunque el admin esté en background.
 * El sonido se reproduce SOLO si la pestaña está visible (regla del browser).
 */
export function useInboxNotifications(messages) {
    const lastIdRef = useRef(null);
    const swRef     = useRef(null);
    const initRef   = useRef(false);

    // Setup inicial: SW + permiso
    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/notification-sw.js', { scope: '/' })
                .then(reg => { swRef.current = reg; })
                .catch(err => console.warn('[notifications] SW register failed:', err));
        }

        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    // Disparar noti cuando llega un mensaje nuevo
    useEffect(() => {
        if (!messages || messages.length === 0) return;

        const latestId = messages[0].id;

        // Primer fetch: solo marcamos la línea base, sin notificar
        if (lastIdRef.current === null) {
            lastIdRef.current = latestId;
            return;
        }

        if (latestId <= lastIdRef.current) return;

        const newMsg = messages[0];
        const title = `Nuevo mensaje de ${newMsg.name}`;
        const body  = (newMsg.message || '').slice(0, 140);

        // 1) Notificación visual (SW si está, fallback al constructor directo)
        if (swRef.current?.active && Notification.permission === 'granted') {
            swRef.current.active.postMessage({
                type:  'NEW_MESSAGE',
                title, body,
                tag:   `msg-${newMsg.id}`,
            });
        } else if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico', tag: `msg-${newMsg.id}` });
        }

        // 2) Sonido sutil — solo si la pestaña está activa
        if (document.visibilityState === 'visible') {
            playPingSound();
        }

        lastIdRef.current = latestId;
    }, [messages]);
}

/**
 * Genera un beep corto con WebAudio. Evita tener que servir un .mp3.
 */
function playPingSound() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);

        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    } catch { /* sin sonido, no es bloqueante */ }
}
