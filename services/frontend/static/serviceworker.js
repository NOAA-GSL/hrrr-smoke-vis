const version = "v0.01";
const staticCacheName = `staticfiles${version}`;
const precacheFiles = [
  "/js/main.js",
  "/css/style.css",
  "/css/app.css",
  "/favicon.ico",
  "/manifest.json",
];

addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => cache.addAll(precacheFiles))
  );
});

addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map(function (name) {
            if (name !== staticCacheName) return caches.delete(name);
          })
        )
      )
      .then(() => clients.claim())
  );
});

addEventListener("fetch", function (event) {
  event.waitUntil(
    caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request);
    })
  );
});
