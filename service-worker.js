const CACHE_NAME = 'nyumbakwetu-v2'; // Tumeongeza v2 kuonyesha ni mpya
const urlsToCache = [
  '/',
  '/index.html',
  '/login.html',
  '/signup.html',
  '/CSS/style.css',
  '/auth.css',
  '/script.js',
  '/manifest.json'
];

// Kuzindua Service Worker na kuhifadhi files za msingi
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Inalazimisha Service Worker mpya kuanza kazi mara moja
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Kufuta cache za zamani (kama ile iliyokuwa inaleta shida)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Mbinu ya "Network First" kwa kurasa za HTML na API
self.addEventListener('fetch', (event) => {
  // Kama ni ukurasa wa kubonyeza (HTML) au API, nenda mtandaoni kwanza
  if (event.request.mode === 'navigate' || event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // Kama hakuna internet, tumia cache
        return caches.match(event.request);
      })
    );
  } else {
    // Kwa picha na CSS, tumia cache kwanza ili zifunguke haraka
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});