/* Star Coop — AppNest · optional offline cache.
   Put this next to index.html on GitHub Pages and the game works with no
   connection. Bump CACHE when you publish a new version. */
const CACHE = "starcoop-v1.0.0";
const ASSETS = ["./", "./index.html",
  "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.allSettled(ASSETS.map(a => c.add(a))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(res => {
      if (res && res.status === 200) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
