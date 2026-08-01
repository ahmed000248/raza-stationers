/* Raza Admin service worker: installability and update lifecycle only.
 * Private/API/business data is deliberately never persisted or cached. */
self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))).then(() => self.clients.claim())))
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return
  event.respondWith(fetch(event.request, { cache: "no-store" }))
})
