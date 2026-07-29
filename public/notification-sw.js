/**
 * Service Worker minimalista solo para notificaciones del admin.
 * Permite que la notificación aparezca aunque el navegador esté en otra pestaña.
 *
 * No cachea nada — el portfolio se sirve normal.
 */

self.addEventListener('install', (_event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

/**
 * Recibe un mensaje desde el Dashboard y dispara una Notification persistente.
 * Payload esperado: { title, body, tag }
 */
self.addEventListener('message', (event) => {
    const data = event.data || {};
    if (data.type !== 'NEW_MESSAGE') return;

    self.registration.showNotification(data.title || 'Nuevo mensaje', {
        body: data.body || '',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag:  data.tag || 'inbox',
        requireInteraction: true,
        vibrate: [200, 100, 200],
    });
});

/**
 * Click en la notificación → abre/enfoca el admin.
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            const adminUrl = '/dashboard';
            const existing = clients.find(c => c.url.includes(adminUrl));
            if (existing) return existing.focus();
            return self.clients.openWindow(adminUrl);
        })
    );
});
