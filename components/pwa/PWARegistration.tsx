"use client"

import { useEffect, useState } from 'react'

export default function PWARegistration() {
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            // Check if we just reloaded for an update
            const justUpdated = sessionStorage.getItem('pwa-just-updated')
            if (justUpdated) {
                sessionStorage.removeItem('pwa-just-updated')
                console.log('[PWA] App updated successfully')
            }

            // Register service worker
            navigator.serviceWorker
                .register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none', // Always check for updates
                })
                .then((reg) => {
                    console.log('[PWA] Service Worker registered')
                    setRegistration(reg)

                    // Check for updates immediately
                    reg.update()

                    // Listen for update found
                    reg.addEventListener('updatefound', () => {
                        console.log('[PWA] Update found')
                        const newWorker = reg.installing
                        
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                console.log('[PWA] New worker state:', newWorker.state)
                                
                                // If new worker is installed and there's an active worker, show update prompt
                                if (
                                    newWorker.state === 'installed' &&
                                    navigator.serviceWorker.controller
                                ) {
                                    console.log('[PWA] Update available')
                                    setUpdateAvailable(true)
                                }
                            })
                        }
                    })

                    // Check if there's already a waiting worker
                    if (reg.waiting) {
                        console.log('[PWA] Update waiting')
                        setUpdateAvailable(true)
                    }
                })
                .catch((error) => {
                    console.error('[PWA] Service Worker registration failed:', error)
                })

            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'SW_UPDATED') {
                    console.log('[PWA] Service worker updated to:', event.data.version)
                }
            })

            // Check for updates when page regains focus
            const handleVisibilityChange = () => {
                if (!document.hidden && registration) {
                    console.log('[PWA] Checking for updates...')
                    registration.update()
                }
            }

            document.addEventListener('visibilitychange', handleVisibilityChange)

            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange)
            }
        }
    }, [])

    const handleUpdate = () => {
        if (registration && registration.waiting) {
            console.log('[PWA] Activating update...')
            sessionStorage.setItem('pwa-just-updated', 'true')
            
            // Tell the waiting service worker to activate
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            
            // Reload the page after a short delay
            setTimeout(() => {
                window.location.reload()
            }, 100)
        }
    }

    const handleDismiss = () => {
        console.log('[PWA] Update dismissed')
        setUpdateAvailable(false)
    }

    if (!updateAvailable) {
        return null
    }

    return (
        <div className="fixed z-50 max-w-sm bottom-4 right-4 left-4 md:left-auto">
            <div className="p-4 border rounded-lg shadow-lg backdrop-blur-sm bg-surface/95 border-border">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-primary">Update Available</h4>
                    <button
                        onClick={handleDismiss}
                        className="text-muted hover:text-text transition-colors"
                        aria-label="Dismiss update notification"
                    >
                        ×
                    </button>
                </div>
                <p className="mb-3 text-xs text-muted">
                    A new version of BildOro is available. Update now for the latest features and improvements.
                </p>
                <div className="flex space-x-2">
                    <button
                        onClick={handleUpdate}
                        className="flex-1 px-3 py-2 text-sm font-medium rounded bg-primary text-white hover:opacity-90 transition-opacity"
                    >
                        Update Now
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-3 py-2 text-sm border rounded border-border text-muted hover:text-text transition-colors"
                    >
                        Later
                    </button>
                </div>
            </div>
        </div>
    )
}