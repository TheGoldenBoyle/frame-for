"use client"

import { useEffect, useState } from 'react'

export default function PWARegistration() {
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
    const [hasReloaded, setHasReloaded] = useState(false)

    useEffect(() => {
        const justReloaded = sessionStorage.getItem('sw-just-reloaded')
        if (justReloaded) {
            sessionStorage.removeItem('sw-just-reloaded')
            setHasReloaded(true)
        }

        if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js', {
                    scope: '/',
                    updateViaCache: 'none'
                })
                .then((reg) => {
                    setRegistration(reg)

                    reg.addEventListener('updatefound', () => {
                        const newWorker = reg.installing
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    setUpdateAvailable(true)
                                }
                            })
                        }
                    })

                    if (reg.waiting) {
                        setUpdateAvailable(true)
                    }
                })
                .catch((error) => {
                    console.error('Service Worker registration failed:', error)
                })

            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'SKIP_WAITING') {
                    setUpdateAvailable(true)
                }
            })

            const checkForUpdates = () => {
                if (registration && !hasReloaded) {
                    registration.update()
                }
            }

            const timer = setTimeout(() => {
                window.addEventListener('focus', checkForUpdates)
            }, 5000)

            return () => {
                clearTimeout(timer)
                window.removeEventListener('focus', checkForUpdates)
            }
        }
    }, [registration, hasReloaded])

    const handleUpdate = () => {
        if (registration && registration.waiting) {
            sessionStorage.setItem('sw-just-reloaded', 'true')
            registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            setUpdateAvailable(false)
            setTimeout(() => {
                window.location.reload()
            }, 100)
        }
    }

    if (updateAvailable && !hasReloaded) {
        return (
            <div className="fixed !z-50 max-w-sm bottom-4 right-4">
                <div className="p-4 border rounded-lg shadow-lg backdrop-blur-sm bg-background/95 border-border">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-primary">Update Available</h4>
                        <button
                            onClick={() => setUpdateAvailable(false)}
                            className="text-muted hover:text-foreground"
                        >
                            ×
                        </button>
                    </div>
                    <p className="mb-3 text-xs text-muted">
                        A new version of BildOro is available.
                    </p>
                    <div className="flex space-x-2">
                        <button
                            onClick={handleUpdate}
                            className="px-3 py-1.5 text-xs font-medium rounded bg-primary text-primary-foreground hover:opacity-90"
                        >
                            Update Now
                        </button>
                        <button
                            onClick={() => setUpdateAvailable(false)}
                            className="px-3 py-1.5 text-xs border rounded border-border text-muted hover:text-foreground"
                        >
                            Later
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return null
}