const cacheName = 'safroot-menu-v2';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './safrot.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
