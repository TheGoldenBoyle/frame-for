'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Footer } from '@/components/partials/Footer'
import { useAuth } from '@/hooks/useAuth'
import { PricingCards } from '@/components/PricingCards'
import HowItWorks from '@/components/landing/HowItWorks'
import { useI18n } from '@/lib/i18n/context'

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
                setMessage(t.landing.waitlistSuccess.replace('{position}', data.position))
                setEmail('')
            } else {
                setMessage(data.error || t.landing.waitlistError)
            }
        } catch (error) {
            setMessage(t.landing.waitlistFailed)
        } finally {
            setLoading(false)
        }
    }

    const handlePurchase = async (type: 'onetime' | 'subscription') => {
        if (!user) {
            router.push('/signup')
            return
        }

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            })

            const data = await response.json()
            if (data.url) window.location.href = data.url
        } catch (error) {
            console.error('Checkout failed')
        }
    }

    if (isWaitlistMode) {
        return (
            <div className="min-h-screen flex flex-col relative overflow-hidden">
                <main className="flex-grow flex items-center justify-center px-8 text-center relative z-10 py-20">
                    <div className="max-w-4xl animate-fade-in-up">
                        <h2 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
                            {t.landing.waitlistTitle}
                        </h2>
                        <p className="text-xl text-primary font-medium mb-2">
                            {t.landing.waitlistSubtitle1}
                        </p>
                        <p className="text-lg mb-8">
                            {t.landing.waitlistSubtitle2}
                        </p>

                        <form onSubmit={handleWaitlistSignup} className="max-w-md mx-auto mb-6">
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t.landing.emailPlaceholder}
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:outline-none"
                                    required
                                    disabled={loading}
                                />
                                <Button type="submit" size="lg" disabled={loading}>
                                    {loading ? t.landing.joining : t.landing.joinWaitlist}
                                </Button>
                            </div>
                            {message && (
                                <p className={`mt-3 text-sm ${message.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                                    {message}
                                </p>
                            )}
                        </form>

                        <p className="text-sm text-muted">
                            {t.landing.questionsContact}{' '}
                            <a href="https://x.com/thegoldenboyle" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                @theGoldenBoyle
                            </a>
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="relative py-10 lg:py-32">
            <main className="relative z-10 px-6 py-20">
                {/* Hero */}
                <section className="max-w-5xl mx-auto text-center mb-32">
                    <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in-up">
                        {t.landing.heroTitle} <span className="text-primary">{t.landing.heroTitleHighlight}</span>
                    </h1>

                    <p className="text-xl text-muted max-w-2xl mx-auto mb-4 animate-fade-in-up stagger-1">
                        {t.landing.heroSubtitle1}
                    </p>

                    <p className="text-lg text-muted max-w-xl mx-auto mb-12 animate-fade-in-up stagger-2">
                        {t.landing.heroSubtitle2}
                    </p>

                    <div className="flex justify-center gap-4 mb-16 animate-fade-in-up stagger-3">
                        <Button
                            size="lg"
                            onClick={() => router.push(user ? '/dashboard' : '/signup')}
                            className="shimmer-effect glow-on-hover"
                        >
                            {t.landing.tryItFree}
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => window.open('https://x.com/theGoldenBoyle', '_blank')}
                        >
                            {t.landing.followJourney}
                        </Button>
                    </div>

                    <div className="relative max-w-4xl mx-auto animate-fade-in-up stagger-4">
                        <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-2xl flex items-center justify-center shadow-elevated-gold overflow-hidden">
                            <iframe
                                className="w-full h-full absolute inset-0 rounded-2xl"
                                src="https://www.youtube.com/embed/tXDXnj8P9X4?rel=0&modestbranding=1"
                                title={t.landing.videoTitle}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                loading="lazy"
                            />
                        </div>
                    </div>
                </section>


                <HowItWorks />

                {/* CTA */}
                <section className="max-w-3xl mx-auto text-center py-20 mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in-up">
                        {t.landing.ctaTitle}
                    </h2>
                    <p className="text-xl text-muted mb-10 max-w-xl mx-auto animate-fade-in-up">
                        {t.landing.ctaSubtitle}
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 mb-16 animate-fade-in-up stagger-3">

                        {/* Ghost / Outline Button */}
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => window.open('https://x.com/theGoldenBoyle', '_blank')}
                        >
                            @theGoldenBoyle
                        </Button>
                        {/* Primary Try For Free */}
                        <div className="flex flex-col items-center relative w-full">
                            <Button
                                size="lg"
                                onClick={() => router.push('/signup')}
                                className="shimmer-effect glow-on-hover w-full"
                            >
                                {t.landing.startFree}
                            </Button>
                            <span className="text-sm text-muted mt-1 absolute -bottom-5">{t.landing.freeTokensDesc}</span>
                        </div>
                    </div>
                </section>

                {/* Pricing */}
                <section className="max-w-6xl mx-auto mb-32">
                    <h2 className="text-3xl font-bold text-center mb-4 animate-fade-in-up">
                        {t.landing.pricingTitle}
                    </h2>
                    <p className="text-center text-muted mb-12 animate-fade-in-up stagger-1">
                        {t.landing.pricingSubtitle}
                    </p>

                    <PricingCards onPurchase={handlePurchase} />
                </section>
            </main>
            <Footer />
        </div>
    )
}