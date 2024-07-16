// service-worker.js
const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/storage/',
  '/storage/index.html',
  '/storage/styles.css',
  '/storage/script.js'
];

self.addEventListener('install', event => {
  console.log('Service worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('All resources cached.');
      })
  );
});

self.addEventListener('fetch', event => {
  console.log('Fetching:', event.request.url);
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Found in cache:', event.request.url);
          return response;
        }
        console.log('Not found in cache. Fetching from network:', event.request.url);
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service worker activating.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Periodically check for updates
setInterval(() => {
  console.log('Checking for updates...');
  fetch('/storage/version.txt')
    .then(response => response.text())
    .then(version => {
      console.log('Current version:', version);
      if (localStorage.getItem('version') !== version) {
        console.log('New version detected. Updating...');
        localStorage.setItem('version', version);
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
        self.clients.matchAll().then(clients => {
          clients.forEach(client => client.navigate(client.url));
        });
      } else {
        console.log('No new version detected.');
      }
    })
    .catch(error => {
      console.error('Error checking for updates:', error);
    });
}, 15000); // Check every minute