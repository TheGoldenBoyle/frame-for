"use client"

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[]
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed'
        platform: string
    }>
    prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showInstallPrompt, setShowInstallPrompt] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            const installEvent = e as BeforeInstallPromptEvent
            setDeferredPrompt(installEvent)

            // Check if user dismissed recently (within 24 hours)
            const dismissed = localStorage.getItem('pwa-install-dismissed')
            if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
                return
            }

            setShowInstallPrompt(true)
        }

        const handleAppInstalled = () => {
            console.log('PWA was installed')
            setIsInstalled(true)
            setShowInstallPrompt(false)
            setDeferredPrompt(null)
            localStorage.removeItem('pwa-install-dismissed')
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        try {
            await deferredPrompt.prompt()
            const choiceResult = await deferredPrompt.userChoice

            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt')
            } else {
                console.log('User dismissed the install prompt')
            }
        } catch (error) {
            console.error('Error showing install prompt:', error)
        }

        setDeferredPrompt(null)
        setShowInstallPrompt(false)
    }

    const handleDismiss = () => {
        setShowInstallPrompt(false)
        localStorage.setItem('pwa-install-dismissed', Date.now().toString())
    }

    if (isInstalled || !showInstallPrompt) return null

    return (
        <div className="fixed !z-50 bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm animate-slide-up">
            <div className="p-4 border rounded-lg shadow-lg backdrop-blur-sm bg-background/95 border-border">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
                            <Download className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold">Install BildOro</h3>
                            <p className="text-xs text-muted">Access AI image generation faster</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-1 text-muted hover:text-foreground transition-colors"
                        aria-label="Dismiss install prompt"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="flex space-x-2">
                    <button
                        onClick={handleInstallClick}
                        className="flex-1 flex items-center justify-center px-4 py-2 text-sm font-medium rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Install App
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-4 py-2 text-sm font-medium rounded border border-border text-muted hover:text-foreground transition-colors"
                    >
                        Later
                    </button>
                </div>
            </div>
        </div>
    )
}