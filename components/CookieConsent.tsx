'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'

export function CookieConsent() {
    const [showConsent, setShowConsent] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent')
        if (!consent) {
            setShowConsent(true)
        }
    }, [])

    const acceptCookies = () => {
        localStorage.setItem('cookie-consent', 'accepted')
        setShowConsent(false)
    }

    if (!showConsent) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto bg-surface border border-border rounded-lg shadow-lg p-6 md:flex md:items-center md:justify-between gap-4">
                <div className="mb-4 md:mb-0 flex-1">
                    <p className="text-sm md:text-base text-text">
                        We use cookies to enhance your experience and analyze site traffic.
                        By continuing, you agree to our use of cookies.
                        {' '}
                        <a
                            href="/privacy"
                            className="text-primary hover:underline font-medium"
                        >
                            Learn more
                        </a>
                    </p>
                </div>
                <div className="flex gap-3 shrink-0">
                    <Button
                        onClick={acceptCookies}
                        size="sm"
                        className="whitespace-nowrap"
                    >
                        Accept
                    </Button>
                </div>
            </div>
        </div>
    )
}