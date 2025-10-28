const CACHE_VERSION = "bildoro-v2" // Increment this when you deploy updates
const STATIC_CACHE = `${CACHE_VERSION}-static`
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`

const staticAssets = [
	"/",
	"/offline",
	"/icons/icon-192x192.png",
	"/icons/icon-512x512.png",
	"/manifest.json",
]

// Install event - cache static assets
self.addEventListener("install", (event) => {
	console.log("[SW] Installing service worker version:", CACHE_VERSION)
	
	event.waitUntil(
		caches
			.open(STATIC_CACHE)
			.then((cache) => {
				console.log("[SW] Caching static assets")
				return Promise.allSettled(
					staticAssets.map((url) =>
						fetch(url, { cache: "no-cache" })
							.then((response) => {
								if (response.ok) {
									return cache.put(url, response)
								}
							})
							.catch((err) => {
								console.warn(`[SW] Failed to cache ${url}:`, err)
							})
					)
				)
			})
			.then(() => {
				console.log("[SW] Skip waiting")
				return self.skipWaiting()
			})
			.catch((err) => {
				console.error("[SW] Install failed:", err)
			})
	)
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
	console.log("[SW] Activating service worker version:", CACHE_VERSION)
	
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						// Delete old caches
						if (
							cacheName.startsWith("bildoro-") &&
							!cacheName.startsWith(CACHE_VERSION)
						) {
							console.log("[SW] Deleting old cache:", cacheName)
							return caches.delete(cacheName)
						}
					})
				)
			})
			.then(() => {
				console.log("[SW] Claiming clients")
				return self.clients.claim()
			})
			.then(() => {
				// Notify all clients about the update
				return self.clients.matchAll().then((clients) => {
					clients.forEach((client) => {
						client.postMessage({
							type: "SW_UPDATED",
							version: CACHE_VERSION,
						})
					})
				})
			})
	)
})

// Fetch event - network first, fall back to cache
self.addEventListener("fetch", (event) => {
	const { request } = event
	const url = new URL(request.url)

	// Skip non-GET requests and external URLs
	if (request.method !== "GET" || url.origin !== self.location.origin) {
		return
	}

	// Never cache these paths
	const skipCache = [
		"/api/",
		"/_next/static/", // Don't cache Next.js build files
		"/_next/webpack",
		"/__nextjs",
		"/hot-reload",
		"/sw.js",
		"/auth",
		"/callback",
		"/signin",
		"/signup",
	]

	if (skipCache.some((path) => url.pathname.includes(path))) {
		return
	}

	// For navigation requests (page loads)
	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request)
				.then((response) => {
					// Always use fresh navigation responses
					return response
				})
				.catch(() => {
					// Only use cache if offline
					return caches.match("/offline").then((response) => {
						return (
							response ||
							new Response("Offline", {
								status: 503,
								statusText: "Service Unavailable",
								headers: { "Content-Type": "text/html" },
							})
						)
					})
				})
		)
		return
	}

	// For static assets - cache first, update in background
	if (staticAssets.includes(url.pathname)) {
		event.respondWith(
			caches.match(request).then((cachedResponse) => {
				const fetchPromise = fetch(request)
					.then((networkResponse) => {
						if (networkResponse.ok) {
							caches.open(STATIC_CACHE).then((cache) => {
								cache.put(request, networkResponse.clone())
							})
						}
						return networkResponse
					})
					.catch(() => cachedResponse)

				return cachedResponse || fetchPromise
			})
		)
		return
	}

	// For everything else - network first, cache fallback
	event.respondWith(
		fetch(request)
			.then((response) => {
				// Only cache successful responses
				if (response.ok && response.type === "basic") {
					const responseToCache = response.clone()
					caches.open(DYNAMIC_CACHE).then((cache) => {
						cache.put(request, responseToCache)
					})
				}
				return response
			})
			.catch(() => {
				// Fall back to cache if network fails
				return caches.match(request).then((response) => {
					return response || new Response("Network error", { status: 408 })
				})
			})
	)
})

// Push notification handler
self.addEventListener("push", (event) => {
	let notificationData = {
		title: "BildOro",
		body: "Your AI image is ready!",
		icon: "/icons/icon-192x192.png",
		badge: "/icons/icon-96x96.png",
		data: {},
		requireInteraction: false,
		vibrate: [200, 100, 200],
		tag: "bildoro-notification",
		silent: false,
	}

	if (event.data) {
		try {
			const payload = event.data.json()
			notificationData = {
				...notificationData,
				...payload,
				data: payload.data || {},
			}
		} catch (e) {
			notificationData.body = event.data.text()
		}
	}

	event.waitUntil(
		self.registration.showNotification(
			notificationData.title,
			notificationData
		)
	)
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
	event.notification.close()

	const data = event.notification.data || {}
	let urlToOpen = "/dashboard"

	if (data.imageId) {
		urlToOpen = `/dashboard/images/${data.imageId}`
	} else if (data.url) {
		urlToOpen = data.url
	}

	event.waitUntil(
		clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then((clientList) => {
				for (const client of clientList) {
					if (client.url.includes(urlToOpen) && "focus" in client) {
						return client.focus()
					}
				}
				if (clients.openWindow) {
					return clients.openWindow(urlToOpen)
				}
			})
	)
})

// Message handler
self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		console.log("[SW] Received SKIP_WAITING message")
		self.skipWaiting()
	}
})