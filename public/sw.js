const CACHE = 'aproveitai-v1';
const ASSETS = [
  '/', '/index.html',
  '/cadastrocliente.html', '/areadocliente.html',
  '/logo-aproveitai.png', '/logo-prometheus.png',
  '/favicon.ico', '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return Promise.all(
        ASSETS.map(asset =>
          cache.add(asset).catch(err => console.warn("Falha cache:", asset, err))
        )
      );
    })
  );
});
