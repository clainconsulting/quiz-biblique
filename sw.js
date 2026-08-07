const CACHE_NAME = 'textes-quiz-v4';
const APP_SHELL = [
  './', './index.html', './style.css?v=4', './app.js?v=4', './config.js', './data-store.js',
  './supabase-adapter.js', './word-export.js', './adaptive-engine.js', './analytics-engine.js', './speech-reader.js?v=4',
  './jszip.min.js', './manifest.webmanifest', './app-icon.svg', './app-icon-192.png', './app-icon-512.png'
];
const DATA_PATTERN = /\/(?:bible|quran-[1-6])\.json$/;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy)); return response; }).catch(() => caches.match('./index.html')));
    return;
  }
  if (DATA_PATTERN.test(new URL(event.request.url).pathname)) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => { if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); } return response; })));
    return;
  }
  event.respondWith(fetch(event.request).then(response => { if (response.ok) { const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)); } return response; }).catch(() => caches.match(event.request)));
});
