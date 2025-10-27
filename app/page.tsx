'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/ui/Button'
import { Footer } from '@/components/partials/Footer'
import { useAuth } from '@/hooks/useAuth'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'

export default function LandingPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { t } = useI18n()
    const [isWaitlistMode, setIsWaitlistMode] = useState(false)
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        checkCapacity()
    }, [])

    async function checkCapacity() {
        try {
            const response = await fetch('/api/revenue')
            if (response.ok) {
                const data = await response.json()
                setIsWaitlistMode(!data.canSignup)
            }
        } catch (error) {
            console.error('Failed to check capacity')
        }
    }

    async function handleWaitlistSignup(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            const response = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await response.json()

            if (response.ok) {
                setMessage(`✓ You're on the list! Position #${data.position}`)
                setEmail('')
            } else {
                setMessage(data.error || 'Something went wrong')
            }
        } catch (error) {
            setMessage('Failed to join waitlist')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="min-h-screen flex flex-col relative overflow-hidden">

                <AnimatedBackground intensity="low" />

                <div
                    className="absolute inset-0 pointer-events-none z-[1]"
                    style={{
                        background: 'var(--color-background)',
                        opacity: 0.65,
                        backdropFilter: 'blur(80px)',
                        WebkitBackdropFilter: 'blur(80px)'
                    }}
                />

                <main className="flex-grow flex items-center justify-center px-8 text-center relative z-10">
                    <div className="max-w-4xl">
                        <div className="mb-8 space-y-3">
                            <h2 className="text-5xl md:text-7xl font-old leading-tight">
                                {t.landing.headline1}
                            </h2>
                        </div>

                        {!isWaitlistMode ? (
                            <>
                                <div className="text-xl text-muted max-w-2xl mx-auto mb-12 space-y-2">
                                    <p className="font-medium">
                                        {t.landing.subheadline1}
                                    </p>
                                    <p>
                                        {t.landing.subheadline2}
                                    </p>
                                    <p className="text-lg mt-4">
                                        {t.landing.subheadline3}
                                    </p>
                                </div>
                                <div className="flex justify-center gap-4">
                                    <Button
                                        size="lg"
                                        onClick={() => router.push(user ? '/dashboard' : '/signup')}
                                    >
                                        {t.landing.cta}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => router.push(user ? '/dashboard/playground' : '/signup')}
                                    >
                                        {t.playground.title}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-xl text-muted max-w-2xl mx-auto mb-8 space-y-2">
                                    <p className="font-medium text-primary">
                                        🎯 We've reached our initial capacity!
                                    </p>
                                    <p>
                                        Join the waitlist to get early access when spots open up.
                                    </p>
                                    <p className="text-base mt-4">
                                        We're testing with a small group first to ensure the best experience.
                                    </p>
                                </div>
                                <form onSubmit={handleWaitlistSignup} className="max-w-md mx-auto mb-6">
                                    <div className="flex gap-2">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="Enter your email"
                                            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:outline-none"
                                            required
                                            disabled={loading}
                                        />
                                        <Button
                                            type="submit"
                                            size="lg"
                                            disabled={loading}
                                        >
                                            {loading ? 'Joining...' : 'Join Waitlist'}
                                        </Button>
                                    </div>
                                    {message && (
                                        <p className={`mt-3 text-sm ${message.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                                            {message}
                                        </p>
                                    )}
                                </form>
                                <p className="text-sm text-muted">
                                    Questions? Contact{' '}
                                    <a href="https://x.com/thegoldenboyle" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                        @theGoldenBoyle
                                    </a>
                                    {' '}on X
                                </p>
                            </>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </>
    )
}