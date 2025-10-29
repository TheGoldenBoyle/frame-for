'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Footer } from '@/components/partials/Footer'
import { useAuth } from '@/hooks/useAuth'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { PricingCards } from '@/components/PricingCards'
import { Gift, Infinity, Zap, Wand2, Sparkles, Layers } from 'lucide-react'

const MODELS = [
    { name: "FLUX 1.1 Pro", provider: "Black Forest Labs" },
    { name: "Imagen 4", provider: "Google" },
    { name: "Seedream 4", provider: "ByteDance" },
    { name: "Ideogram v3 Turbo", provider: "Ideogram AI" },
    { name: "Recraft v3", provider: "Recraft AI" },
    { name: "Nano Banana", provider: "Google" },
]

export default function LandingPage() {
    const router = useRouter()
    const { user } = useAuth()
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

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            console.error('Checkout failed')
        }
    }

    if (isWaitlistMode) {
        return (
            <>
                <div className="min-h-screen flex flex-col relative overflow-hidden">
                    {/* <div className="fixed inset-0 z-0 h-screen max-h-screen" aria-hidden="true">
                        <AnimatedBackground intensity="low" />
                    </div> */}
                    <div
                        className="fixed inset-0 pointer-events-none z-[1] h-screen max-h-screen"
                        aria-hidden="true"
                        style={{
                            background: 'var(--color-background)',
                            opacity: 0.65,
                            backdropFilter: 'blur(80px)',
                            WebkitBackdropFilter: 'blur(80px)'
                        }}
                    />

                    <main className="flex-grow flex items-center justify-center px-8 text-center relative z-10 py-20">
                        <div className="max-w-4xl">
                            <div className="mb-8 space-y-3">
                                <h2 className="text-5xl md:text-7xl font-bold leading-tight">
                                    We've reached capacity
                                </h2>
                            </div>

                            <div className="text-xl text-muted max-w-2xl mx-auto mb-8 space-y-2">
                                <p className="font-medium text-primary">
                                    🎯 Testing with a small group first
                                </p>
                                <p>
                                    Join the waitlist for early access when spots open.
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
                                    <Button type="submit" size="lg" disabled={loading}>
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
                            </p>
                        </div>
                    </main>
                </div>
                <Footer />
            </>
        )
    }

    return (
        <>
            <div className="min-h-screen relative py-10 lg:py-32">
                {/* <div className="fixed inset-0 z-0 h-screen max-h-screen" aria-hidden="true">
                    <AnimatedBackground intensity="low" />
                </div> */}
                <div
                    className="fixed inset-0 pointer-events-none z-[1] h-screen max-h-screen"
                    aria-hidden="true"
                    style={{
                        background: 'var(--color-background)',
                        opacity: 0.65,
                        backdropFilter: 'blur(80px)',
                        WebkitBackdropFilter: 'blur(80px)'
                    }}
                />

                <main className="relative z-10 px-6 py-20">
                    {/* Hero Section */}
                    <section className="max-w-5xl mx-auto text-center mb-32">
                        <h1 className="text-6xl md:text-8xl font-bold mb-6">
                            The best AI models.
                            <br />
                            <span className="text-primary">No restrictions.</span>
                        </h1>
                        
                        <p className="text-xl text-muted max-w-2xl mx-auto mb-4">
                            Top quality. Latest models. Tokens that never expire.
                        </p>

                        <p className="text-lg text-muted max-w-xl mx-auto mb-12">
                            Perfect for casual creators who want to test, forget, and come back when the next trendy model drops.
                        </p>

                        <div className="flex justify-center gap-4 mb-16">
                            <Button
                                size="lg"
                                onClick={() => router.push(user ? '/dashboard' : '/signup')}
                            >
                                Start Free
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => router.push(user ? '/dashboard/playground' : '/signup')}
                            >
                                Try Playground
                            </Button>
                        </div>

                        {/* Video Placeholder */}
                        <div className="max-w-4xl mx-auto">
                            <Card>
                                <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg flex items-center justify-center">
                                    <p className="text-muted">Product video coming soon</p>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* Why BildOro */}
                    <section className="max-w-5xl mx-auto mb-32">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            Why BildOro?
                        </h2>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                            <Card>
                                <div className="p-6 flex flex-col items-center text-center">
                                    <Gift className="w-10 h-10 text-primary mb-4" />
                                    <h3 className="font-bold mb-2">Free Test Tokens</h3>
                                    <p className="text-sm text-muted">
                                        Only platform with free tokens to start
                                    </p>
                                </div>
                            </Card>

                            <Card>
                                <div className="p-6 flex flex-col items-center text-center">
                                    <Infinity className="w-10 h-10 text-primary mb-4" />
                                    <h3 className="font-bold mb-2">Never Expire</h3>
                                    <p className="text-sm text-muted">
                                        Buy once, use anytime
                                    </p>
                                </div>
                            </Card>

                            <Card>
                                <div className="p-6 flex flex-col items-center text-center">
                                    <Zap className="w-10 h-10 text-primary mb-4" />
                                    <h3 className="font-bold mb-2">Top Quality</h3>
                                    <p className="text-sm text-muted">
                                        Best settings, hard-coded
                                    </p>
                                </div>
                            </Card>

                            <Card>
                                <div className="p-6 flex flex-col items-center text-center">
                                    <Wand2 className="w-10 h-10 text-primary mb-4" />
                                    <h3 className="font-bold mb-2">AI Prompt Builder</h3>
                                    <p className="text-sm text-muted">
                                        Free optimizer built-in
                                    </p>
                                </div>
                            </Card>

                            <Card>
                                <div className="p-6 flex flex-col items-center text-center">
                                    <Layers className="w-10 h-10 text-primary mb-4" />
                                    <h3 className="font-bold mb-2">One-Stop Shop</h3>
                                    <p className="text-sm text-muted">
                                        All latest models in one place
                                    </p>
                                </div>
                            </Card>

                            <Card>
                                <div className="p-6 flex flex-col items-center text-center">
                                    <Sparkles className="w-10 h-10 text-primary mb-4" />
                                    <h3 className="font-bold mb-2">Your Choice</h3>
                                    <p className="text-sm text-muted">
                                        Freedom to create your way
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </section>

                    {/* Current Models */}
                    <section className="max-w-4xl mx-auto mb-32">
                        <h2 className="text-3xl font-bold text-center mb-4">
                            Latest Models Available
                        </h2>
                        <p className="text-center text-muted mb-12">
                            Cutting-edge AI at your fingertips
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                            {MODELS.map((model) => (
                                <Card key={model.name}>
                                    <div className="p-6 text-center">
                                        <h3 className="font-bold text-lg mb-1">{model.name}</h3>
                                        <p className="text-sm text-muted">{model.provider}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Pricing */}
                    <section className="max-w-6xl mx-auto mb-20">
                        <h2 className="text-3xl font-bold text-center mb-4">
                            Simple Pricing
                        </h2>
                        <p className="text-center text-muted mb-12">
                            Better, cheaper, unrestricted
                        </p>
                        
                        <PricingCards onPurchase={handlePurchase} />
                    </section>

                    {/* Final CTA */}
                    <section className="max-w-2xl mx-auto text-center">
                        <Card>
                            <div className="p-12">
                                <h2 className="text-3xl font-bold mb-4">
                                    Ready to create?
                                </h2>
                                <p className="text-muted mb-8">
                                    Start with free tokens. No credit card required.
                                </p>
                                <Button
                                    size="lg"
                                    onClick={() => router.push(user ? '/dashboard' : '/signup')}
                                >
                                    Get Started Free
                                </Button>
                            </div>
                        </Card>
                    </section>
                </main>
            </div>
            <Footer />
        </>
    )
}