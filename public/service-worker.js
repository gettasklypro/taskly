const CACHE_NAME = "taskly-cache-v2"; // change version to clear old cache

self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing new version...");
  self.skipWaiting(); // activate immediately
});

self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating and clearing all caches...");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            console.log("[Service Worker] Deleting cache:", cacheName);
            return caches.delete(cacheName);
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Minimal fetch handler: avoid caching to prevent stale data issues
self.addEventListener("fetch", (event) => {
  // Only handle same-origin GET requests; let others pass through
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Bypass Cache Storage completely for now so users always get fresh responses
  event.respondWith(fetch(event.request));
});
