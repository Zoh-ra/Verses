// Service Worker pour l'application Verses
const CACHE_NAME = 'verses-cache-v1';

// Liste des fichiers à mettre en cache pour le fonctionnement offline
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/globals.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Ajoutez ici d'autres ressources à mettre en cache
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Récupération de contenu avec stratégie "network first, fallback to cache"
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la requête est réussie, on met à jour le cache
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si la requête échoue (pas de connexion), on essaie de récupérer depuis le cache
        return caches.match(event.request);
      })
  );
});

// Nettoyage des anciens caches lors de l'activation
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
