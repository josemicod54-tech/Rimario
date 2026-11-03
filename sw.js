/* Rimario: funciona sin internet. Subí el número de VERSION cada vez que cambies archivos. */
const VERSION = 'rimario-beta-1.0.0';
const NUCLEO = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png'];
const FUENTES = ['fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(NUCLEO)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fuentes de Google: se guardan la primera vez que hay internet y después andan offline.
  if (FUENTES.includes(url.hostname)) {
    e.respondWith(
      caches.open(VERSION).then(c => c.match(req).then(hit => hit || fetch(req).then(r => { c.put(req, r.clone()); return r; }).catch(() => hit)))
    );
    return;
  }

  // Archivos de la app: primero lo guardado, y se actualiza en segundo plano.
  if (url.origin === location.origin) {
    e.respondWith(
      caches.open(VERSION).then(c => c.match(req, { ignoreSearch: true }).then(hit => {
        const red = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
        return hit || red;
      }))
    );
  }
});
