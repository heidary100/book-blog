const VERSION = "margins-v1";
const STATIC_CACHE = `${VERSION}-static`;
const PAGES_CACHE = `${VERSION}-pages`;
const PRECACHE = ["/offline", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PAGES_CACHE);
      await cache.addAll(PRECACHE);
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)));
      await self.clients.claim();

      // Warm the library in the background so everything is readable offline.
      try {
        const res = await fetch("/search-index.json");
        const items = await res.json();
        const urls = [
          "/",
          "/tags",
          ...new Set(items.map((i) => `/books/${i.book}`)),
          ...new Set(items.map((i) => `/books/${i.book}/${i.slug}`)),
        ];
        const cache = await caches.open(PAGES_CACHE);
        await Promise.allSettled(
          urls.map(async (u) => {
            const page = await fetch(u);
            if (page.ok) await cache.put(u, page);
          })
        );
      } catch {
        // offline warm-up is best-effort
      }
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/keystatic")) return;

  // immutable, content-hashed build output and cover images: cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/covers/")
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE);
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })()
    );
    return;
  }

  // navigations: network-first, fall back to the cached page, then /offline
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          const cache = await caches.open(PAGES_CACHE);
          cache.put(request, res.clone());
          return res;
        } catch {
          return (await caches.match(request)) || (await caches.match("/offline"));
        }
      })()
    );
    return;
  }

  // other same-origin GETs: stale-while-revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      const hit = await cache.match(request);
      const network = fetch(request)
        .then((res) => {
          if (res.ok) cache.put(request, res.clone());
          return res;
        })
        .catch(() => hit);
      return hit || network;
    })()
  );
});
