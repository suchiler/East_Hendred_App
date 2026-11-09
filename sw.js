// Offline support: the app itself is cached on first visit; map tiles are cached
// as you look at them (up to a limit), so the village maps keep working on a walk
// with poor signal.
const VERSION = "eh-v4";
const SHELL = [
  "./",
  "index.html",
  "css/app.css",
  "js/app.js",
  "js/views.js",
  "js/map.js",
  "js/art.js",
  "js/clock.js",
  "js/data.js",
  "js/config.js",
  "js/util.js",
  "js/stories.js",
  "js/painted-map.js",
  "content/stories.json",
  "content/land.json",
  "art/painted-map@2x.webp",
  "art/painted-map@3x.webp",
  "js/land.js",
  "js/land-art.js",
  "vendor/leaflet/leaflet.js",
  "vendor/leaflet/leaflet.css",
  "manifest.webmanifest",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png"
];
const TILE_CACHE = "eh-tiles";
const TILE_LIMIT = 600;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== TILE_CACHE && k !== "eh-fonts").map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const isTile = (url) => /tile\.openstreetmap\.org|api\.maptiler\.com\/tiles|environment\.data\.gov\.uk\/spatialdata|ogc\.bgs\.ac\.uk/.test(url.href);
const isFont = (url) => /fonts\.(googleapis|gstatic)\.com/.test(url.host);

async function trim(cacheName, limit) {
  const c = await caches.open(cacheName);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - limit; i++) await c.delete(keys[i]);
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  if (isTile(url)) {
    e.respondWith(caches.open(TILE_CACHE).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === "opaque") { c.put(req, res.clone()); trim(TILE_CACHE, TILE_LIMIT); }
      return res;
    }));
    return;
  }

  if (isFont(url)) {
    e.respondWith(caches.open("eh-fonts").then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === "opaque") c.put(req, res.clone());
      return res;
    }));
    return;
  }

  // Stories: fetch fresh when online, so newly published stories appear; fall back offline.
  if (url.origin === self.location.origin && url.pathname.endsWith("/content/stories.json")) {
    e.respondWith(caches.open(VERSION).then(async (c) => {
      try {
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      } catch {
        return (await c.match(req, { ignoreSearch: true })) || Response.json({ stories: [] });
      }
    }));
    return;
  }

  if (url.origin === self.location.origin) {
    // Network first, so every file comes from the same (latest) version of the app;
    // the cache is the fallback when offline. Serving cached files first could mix old
    // and new scripts after an update and break the page.
    e.respondWith(caches.open(VERSION).then(async (c) => {
      try {
        const res = await fetch(req, { cache: "no-cache" });
        if (res.ok) c.put(req, res.clone());
        return res;
      } catch {
        return (await c.match(req, { ignoreSearch: true })) || (await c.match("index.html")) || Response.error();
      }
    }));
  }
});
