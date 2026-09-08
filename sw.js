const CACHE_NAME = 'radio-ciudad-liquida-v6';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Instalar y forzar el reemplazo inmediato de la caché antigua
self.addEventListener('install', event => {
  self.skipWaiting(); // <--- CRÍTICO: Obliga a activar este service worker de inmediato
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: Archivos estáticos cacheados con éxito');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activar y limpiar cachés antiguas y reclamar clientes inmediatamente
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // <--- CRÍTICO: Controla la página de inmediato sin recargas manuales
      caches.keys().then(keys => {
        return Promise.all(
          keys.map(key => {
            if (key !== CACHE_NAME) {
              console.log('SW: Eliminando caché antigua:', key);
              return caches.delete(key);
            }
          })
        );
      })
    ])
  );
});

// Controlar peticiones de red
self.addEventListener('fetch', event => {
  if (event.request.url.includes('listen.php') || event.request.url.includes('212.84.160.3')) {
    return; // Dejar pasar libremente la transmisión de audio
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});
