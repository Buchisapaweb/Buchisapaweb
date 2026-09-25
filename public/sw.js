// Buchisapa Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'BuchiSapa - Tu Pedido';
  const options = {
    body: data.message || 'Actualización de tu pedido en Buchisapa',
    icon: '/imagenes/logo/logo-buchisapa.png',
    badge: '/imagenes/logo/logo-buchisapa.png',
    data: data
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/order-status.html')
  );
});
