/* Service worker (section 9).
 * - App shell: cache-first with a background refresh, so the app opens offline
 *   and updates when back online.
 * - Static assets (hashed JS/CSS/icons): cache-first.
 * - API: network-only. Offline log data comes from localStorage in the app,
 *   so the SW never caches API responses (which would risk serving a stale
 *   log over fresher local edits).
 */
// Bump on any change to an UNHASHED asset (the icons, the manifest). Those are
// served cache-first under these names, so without a rename the old copy is
// served forever — activate() only drops caches whose name no longer matches.
// v2: the lifter icons.
const VERSION = 'v2'
const SHELL_CACHE = `shell-${VERSION}`
const ASSET_CACHE = `assets-${VERSION}`

// Hashed build assets (JS/CSS) are injected here at build time by
// scripts/inject-sw-manifest.mjs so the app is guaranteed to work offline
// after a single online visit. Empty in dev.
const PRECACHE_ASSETS = [/* INJECT_MANIFEST */]

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
]

const offline = (body) =>
  new Response(JSON.stringify(body ?? { error: 'offline' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  })

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL_CACHE)
      await shell.addAll(SHELL_ASSETS)
      if (PRECACHE_ASSETS.length) {
        const assets = await caches.open(ASSET_CACHE)
        // Individual puts so one bad URL can't fail the whole install.
        await Promise.all(
          PRECACHE_ASSETS.map((u) =>
            fetch(u).then((r) => (r && r.ok ? assets.put(u, r.clone()) : null)).catch(() => null),
          ),
        )
      }
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys.filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE).map((k) => caches.delete(k)),
      )
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return // never touch PUT/DELETE writes

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // API: network-only, benign error when offline.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).catch(() => offline()))
    return
  }

  // Navigations: serve the cached app shell, refresh it in the background.
  if (request.mode === 'navigate') {
    event.respondWith(appShell())
    return
  }

  // Everything else same-origin (hashed JS/CSS/icons): cache-first.
  event.respondWith(cacheFirst(request))
})

// Network-first for the app shell: a new deploy shows up on the next load,
// with a cache fallback so it still opens offline. (Cache-first left the app
// stale after a deploy until the service worker was manually cleared.)
// Always return a *freshly built* Response for the navigation — returning a
// raw fetch()/cache Response object to a main-frame navigation can fail with
// ERR_FAILED in some engines.
function htmlResponse(body) {
  return new Response(body, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

async function appShell() {
  const cache = await caches.open(SHELL_CACHE)
  try {
    // Fetch by URL string, never the navigate-mode Request object.
    const net = await fetch('/index.html', { cache: 'no-store' })
    if (net && net.ok) {
      const body = await net.arrayBuffer()
      cache.put('/index.html', htmlResponse(body)) // refresh the offline copy
      return htmlResponse(body)
    }
  } catch {
    /* offline — fall back to cache below */
  }
  const cached = await cache.match('/index.html')
  if (cached) return htmlResponse(await cached.arrayBuffer())
  return offline({ error: 'offline shell' })
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSET_CACHE)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const res = await fetch(request)
    if (res && res.ok) cache.put(request, res.clone())
    return res
  } catch {
    return offline()
  }
}
