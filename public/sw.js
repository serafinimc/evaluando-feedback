const CACHE = 'mis-hojas-v4'
const APP_SHELL = ['/manifest.webmanifest', '/favicon.svg', '/icon.svg', '/robots.txt', '/llms.txt']

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE)
    const page = await fetch('/')
    const html = await page.clone().text()
    const linkedFiles = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
      .map((match) => match[1])
      .filter((path) => path.startsWith('/'))
    await cache.put('/', page)
    await cache.addAll([...new Set([...APP_SHELL, ...linkedFiles])])
    await self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok && new URL(event.request.url).origin === self.location.origin) {
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(event.request, copy))
      }
      return response
    }).catch(() => event.request.mode === 'navigate' ? caches.match('/') : undefined)),
  )
})
