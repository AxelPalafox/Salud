const CACHE_NAME = 'vitalcheck-v3';
const urlsToCache = ['./index.html', './manifest.json'];

// Instalar y forzar la nueva versión inmediatamente
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

// Borrar las versiones antiguas (la v1 y v2 que se quedaron trabadas)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) return caches.delete(cacheName);
        })
      );
    })
  );
});

// Estrategia "Network First" (Primero internet, luego caché)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si hay internet, guarda la nueva versión en caché y muéstrala
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => caches.match(event.request)) // Si no hay internet, usa el caché
  );
});
