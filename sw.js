// Hors connexion : l'appli reste utilisable sans internet (dans la voiture, en avion…).
// Fichiers de l'appli : d'abord le réseau (toujours la dernière version), sinon la copie gardée.
// Voix (/api/voix) : une phrase déjà entendue est gardée et resservie, même sans internet.
const CACHE = "tracto-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  const garde = (rep) => { if (rep && (rep.ok || rep.type === "opaque")) { const copie = rep.clone(); caches.open(CACHE).then((c) => c.put(req, copie)); } return rep; };
  if (url.origin === location.origin && url.pathname.startsWith("/api/voix")) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then(garde)));
  } else if (url.origin === location.origin || /(^|\.)(gstatic|googleapis)\.com$/.test(url.hostname)) {
    e.respondWith(fetch(req).then(garde).catch(() => caches.match(req, { ignoreSearch: url.origin === location.origin && !url.pathname.startsWith("/api/") })));
  }
});
