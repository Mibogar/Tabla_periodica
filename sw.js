
const CACHE = 'tabla-periodica-v2';

const FILES = [
  './',
  './index.html',
  './app.js',
  './style.css',
  './manifest.webmanifest',
  './icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin
  ) return;

  // HTML: comprobar primero si existe una versión nueva.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache =>
            cache.put(request, copy)
          );
        }
        return response;
      }).catch(() => caches.match(request))
    );
    return;
  }

  // Otros archivos: utilizar la caché para funcionar sin conexión.
  event.respondWith(
    caches.match(request).then(cached =>
      cached || fetch(request)
    )
  );
});
