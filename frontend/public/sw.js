const CACHE_NAME = "blueocean-cache-v1";
const CORE_ASSETS = ["/", "/index.html", "/manifest.webmanifest", "/vite.svg", "/assets/pwa-192x192.png", "/assets/pwa-512x512.png"];

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data) return;
  if (data.type === "enqueue") {
    enqueueRequest(data.payload);
  }
});

const DB_NAME = "blueocean-queue";
const STORE_NAME = "requests";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function enqueueRequest(payload) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add({ ...payload, createdAt: Date.now() });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllRequests() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function deleteRequest(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

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
    event.waitUntil(
      (async () => {
        try {
          const items = await getAllRequests();
          for (const item of items) {
            const { id, url, method = "POST", headers = {}, body } = item;
            try {
              const res = await fetch(url, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
              });
              if (res.ok) {
                await deleteRequest(id);
              }
            } catch (e) {
              // Keep item for next sync
            }
          }
        } catch (e) {
          // ignore
        }
      })()
    );
  }
});
