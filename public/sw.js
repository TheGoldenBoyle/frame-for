const CACHE_NAME = "bildoro-v1"
const STATIC_CACHE = "bildoro-static-v1"

const staticAssets = [
	"/",
	"/offline",
	"/icons/icon-192x192.png",
	"/icons/icon-512x512.png",
	"/manifest.json",
]

self.addEventListener("install", (event) => {
	console.log("Service Worker installing")
	event.waitUntil(
		caches
			.open(STATIC_CACHE)
			.then((cache) => {
				const cachePromises = staticAssets.map(async (url) => {
					try {
						const response = await Promise.race([
							fetch(url, {
								method: "GET",
								cache: "no-cache",
							}).then((response) => {
								if (response.ok) {
									return cache.put(url, response.clone())
								}
								return null
							}),
							new Promise((_, reject) =>
								setTimeout(
									() => reject(new Error("Timeout")),
									5000
								)
							),
						])
						return response
					} catch {
						return null
					}
				})

				return Promise.allSettled(cachePromises)
			})
			.then(() => self.skipWaiting())
			.catch(() => self.skipWaiting())
	)
})

self.addEventListener("activate", (event) => {
	console.log("Service Worker activating")
	event.waitUntil(
		caches
			.keys()
			.then((cacheNames) => {
				return Promise.all(
					cacheNames.map((cacheName) => {
						if (
							cacheName !== CACHE_NAME &&
							cacheName !== STATIC_CACHE
						) {
							return caches.delete(cacheName)
						}
					})
				)
			})
			.then(() => self.clients.claim())
	)
})

self.addEventListener("fetch", (event) => {
	const { request } = event
	const url = new URL(request.url)

	if (request.method !== "GET" || url.origin !== self.location.origin) {
		return
	}

	if (
		url.pathname.startsWith("/api/") ||
		url.pathname.startsWith("/_next/") ||
		url.pathname.startsWith("/__nextjs") ||
		url.pathname.includes("hot-reload") ||
		url.pathname.includes("webpack") ||
		url.pathname === "/sw.js" ||
		url.pathname.includes("auth") ||
		url.pathname.includes("callback") ||
		url.pathname.includes("signin") ||
		url.pathname.includes("signup")
	) {
		return
	}

	if (staticAssets.includes(url.pathname)) {
		event.respondWith(
			caches.match(request).then((response) => {
				if (response) {
					return response
				}

				return Promise.race([
					fetch(request).then((networkResponse) => {
						if (networkResponse.ok) {
							caches.open(STATIC_CACHE).then((cache) => {
								cache.put(request, networkResponse.clone())
							})
						}
						return networkResponse
					}),
					new Promise((_, reject) =>
						setTimeout(() => reject(new Error("Timeout")), 3000)
					),
				]).catch(() => {
					return new Response("Asset not available", { status: 404 })
				})
			})
		)
		return
	}

	if (request.mode === "navigate") {
		event.respondWith(
			fetch(request).catch(() => {
				return caches.match("/offline").then((response) => {
					return (
						response ||
						new Response("Offline", {
							status: 200,
							headers: { "Content-Type": "text/html" },
						})
					)
				})
			})
		)
		return
	}
})

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
				title: payload.title || notificationData.title,
				body: payload.body || notificationData.body,
				icon: payload.icon || notificationData.icon,
				badge: payload.badge || notificationData.badge,
				data: payload.data || notificationData.data,
			}
		} catch (e) {
			const textData = event.data.text()
			notificationData.body = textData
		}
	}

	event.waitUntil(
		self.registration.showNotification(
			notificationData.title,
			notificationData
		)
	)
})

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

self.addEventListener("message", (event) => {
	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting()
	}
})
