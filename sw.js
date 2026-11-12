// Service worker voor Mijn dag.
// Strategie: eerst netwerk, cache als terugval. Tijdens ontwikkelen zie je zo altijd je laatste wijziging,
// en zonder internet werkt de app toch met de laatst geladen versie.
// Verhoog CACHE als je de lijst met bestanden hieronder verandert.
const CACHE = "mijn-dag-v11";
const SHELL = [
  "./",
  "index.html",
  "opmaak/fonts.css",
  "opmaak/app.css",
  "lettertypes/figtree-latin.woff2",
  "lettertypes/figtree-latin-ext.woff2",
  "iconen/icon-192.png",
  "iconen/icon-512.png",
  "onderdelen/basis/taal.js",
  "onderdelen/mijn-dag/vragen.js",
  "onderdelen/basis/helpers.js",
  "onderdelen/basis/opslag.js",
  "onderdelen/mijn-dag/dag.js",
  "onderdelen/mijn-dag/weergave.js",
  "onderdelen/mijn-dag/ochtend.js",
  "onderdelen/basis/instellingen.js",
  "onderdelen/mijn-dag/samenvatting.js",
  "onderdelen/mijn-dag/dag-word.js",
  "onderdelen/mijn-dag/dag-pdf.js",
  "onderdelen/geschiedenis/geschiedenis.js",
  "onderdelen/geschiedenis/maandoverzicht.js",
  "onderdelen/geschiedenis/patronen.js",
  "onderdelen/basis/menu.js",
  "onderdelen/herstel/noodplan.js",
  "onderdelen/herstel/jft.js",
  "onderdelen/herstel/stappenwerk.js",
  "onderdelen/herstel/een-op-een.js",
  "onderdelen/week/weekdoel.js",
  "onderdelen/week/weekterugblik.js",
  "onderdelen/basis/backup.js",
  "onderdelen/mijn-dag/planning-gisteren.js",
  "onderdelen/herstel/keytags.js",
  "onderdelen/herstel/mijlpaal.js",
  "onderdelen/herstel/meetings.js",
  "onderdelen/week/weekformulieren.js",
  "onderdelen/week/weekplanning.js",
  "onderdelen/week/wekelijkse-update.js",
  "onderdelen/week/weekendvoorbespreking.js",
  "onderdelen/week/exporteren.js",
  "onderdelen/basis/vormgeving.js",
  "onderdelen/basis/start.js",
  "onderdelen/basis/sw-register.js",
  "externe-bibliotheken/jszip.min.js",
  "externe-bibliotheken/pdf-lezer/pdf.min.js",
  "externe-bibliotheken/pdf-lezer/pdf.worker.min.js",
  "iconen/icon.svg",
  "iconen/apple-touch-icon.png",
  "manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // "no-cache": altijd bij de server navragen of er een nieuwere versie is.
  // GitHub Pages zegt max-age=600, waardoor de iPhone anders tot 10 minuten een oude versie houdt.
  e.respondWith(
    fetch(new Request(req.url, { cache: "no-cache", credentials: "same-origin" }))
      .then((res) => {
        // niet bewaren als we zijn doorgestuurd (bijv. naar de inlogpagina van Cloudflare Access)
        if ((res.ok || res.type === "opaque") && !res.redirected) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("index.html")))
  );
});
