/**
 * Ethio Exam Hall — Service Worker
 * Strategy: Cache-first for static assets, Network-first for API calls.
 * Private data (auth, payments, exam answers) is NEVER cached.
 */

const CACHE_NAME = 'ethio-exam-hall-v2';

// Assets to pre-cache on install (app shell - offline fallback only)
const PRECACHE_ASSETS = [
  '/offline.html',
  '/images/logo.png',
];

// Paths that must NEVER be cached (private/security-sensitive)
const NEVER_CACHE = [
  '/api/auth/',
  '/api/attempts/',
  '/api/payments/',
  '/api/subscriptions/',
  '/sign-in',
  '/register',
];

// ── Install: Pre-cache shell assets ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        // Don't fail install if some precache assets are missing
        console.warn('[SW] Precache partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activate: Remove old caches ───────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Routing Strategy ───────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle same-origin requests + Google Fonts
  const isGoogleFonts = url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com');
  if (url.origin !== self.location.origin && !isGoogleFonts) return;

  // 2. Never cache private API routes
  const isPrivate = NEVER_CACHE.some((path) => url.pathname.startsWith(path));
  if (isPrivate) return; // pass through to network

  // 3. All API calls: Network-first, no caching
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return a JSON error on offline
        return new Response(
          JSON.stringify({ error: 'You appear to be offline. Please reconnect.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // 4. Static assets (JS, CSS, images, fonts): Network-first with cache fallback
  if (
    request.destination === 'image' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(js|css|woff2?|ttf|otf|ico|svg|png|jpg|webp)$/)
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Fall back to cache only when offline or network fails
          return caches.match(request);
        })
    );
    return;
  }

  // 5. Navigation requests (HTML pages): Network-first, fall back to offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/offline.html').then((offline) => offline || new Response('Offline'))
      )
    );
    return;
  }

  // 6. Default: Network-first
  event.respondWith(fetch(request));
});
