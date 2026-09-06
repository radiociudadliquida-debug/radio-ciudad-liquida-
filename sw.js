const CACHE_NAME = 'radio-ciudad-liquida-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json'
];

// Instalar y guardar en caché local los archivos estructurales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW: Archivos estáticos cacheados con éxito');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activar y limpiar cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
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
  );
});

// Controlar peticiones de red
self.addEventListener('fetch', event => {
  // REGLA CRÍTICA: NO intentar guardar en caché la música en vivo (streaming)
  // de lo contrario, el navegador intentará almacenar un audio infinito y colapsará el teléfono.
  if (event.request.url.includes('listen.php') || event.request.url.includes('212.84.160.3')) {
    return; // Dejar pasar libremente la transmisión de audio
  }

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      return cachedResponse || fetch(event.request);
    })
  );
});
