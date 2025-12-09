const CACHE_NAME = "blueocean-cache-v1";
const CORE_ASSETS = ["/", "/index.html", "/manifest.webmanifest", "/vite.svg", "/assets/pwa-192x192.png", "/assets/pwa-512x512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  if (url.origin === self.location.origin) {
    const dest = request.destination;
    if (dest === "style" || dest === "script" || dest === "image" || dest === "font" || dest === "document") {
      event.respondWith(
        caches.match(request).then((cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
        )
      );
      return;
    }
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "BlueOcean";
  const options = {
    body: data.body || "",
    icon: "/assets/pwa-192x192.png",
    badge: "/assets/pwa-192x192.png",
    data: data.data,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((list) => {
        for (const client of list) {
          if (client.url === url && "focus" in client) return client.focus();
        }
        return self.clients.openWindow(url);
      })
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "blueocean-sync") {
    event.waitUntil(Promise.resolve());
  }
});

