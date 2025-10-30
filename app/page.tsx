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
            <div className="min-h-screen flex flex-col relative overflow-hidden">
                <main className="flex-grow flex items-center justify-center px-8 text-center relative z-10 py-20">
                    <div className="max-w-4xl animate-fade-in-up">
                        <div className="mb-8 space-y-3">
                            <h2 className="text-5xl md:text-7xl font-bold leading-tight">
                                We've reached capacity
                            </h2>
                        </div>

                        <div className="text-xl text-muted max-w-2xl mx-auto mb-8 space-y-2 animate-fade-in-up stagger-1">
                            <p className="font-medium text-primary">
                                🎯 Testing with a small group first
                            </p>
                            <p>
                                Join the waitlist for early access when spots open.
                            </p>
                        </div>

                        <form onSubmit={handleWaitlistSignup} className="max-w-md mx-auto mb-6 animate-fade-in-up stagger-2">
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
                                <p className={`mt-3 text-sm animate-fade-in ${message.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                                    {message}
                                </p>
                            )}
                        </form>

                        <p className="text-sm text-muted animate-fade-in-up stagger-3">
                            Questions? Contact{' '}
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
                <section className="max-w-5xl mx-auto text-center mb-32">
                    <h1 className="text-6xl md:text-8xl font-bold mb-6 animate-fade-in-up">
                        The best AI models.
                        <br />
                        <span className="text-primary">No restrictions.</span>
                    </h1>
                    
                    <p className="text-xl text-muted max-w-2xl mx-auto mb-4 animate-fade-in-up stagger-1">
                        Top quality. Latest models. Tokens that never expire.
                    </p>

                    <p className="text-lg text-muted max-w-xl mx-auto mb-12 animate-fade-in-up stagger-2">
                        Perfect for casual creators who want to test, forget, and come back when the next trendy model drops.
                    </p>

                    <div className="flex justify-center gap-4 mb-16 animate-fade-in-up stagger-3">
                        <Button
                            size="lg"
                            onClick={() => router.push(user ? '/dashboard' : '/signup')}
                            className="shimmer-effect glow-on-hover"
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

                    <div className="max-w-4xl mx-auto animate-fade-in-up stagger-4">
                        <div className="aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-2xl flex items-center justify-center shadow-elevated-gold relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <p className="text-muted relative z-10">Product video coming soon</p>
                        </div>
                    </div>
                </section>

                <section className="max-w-6xl mx-auto mb-32">
                    <h2 className="text-3xl font-bold text-center mb-4 animate-fade-in-up">
                        Why BildOro?
                    </h2>
                    <p className="text-center text-muted mb-16 animate-fade-in-up stagger-1">
                        Everything you need, nothing you don't
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                        <div className="animate-fade-in-up stagger-1 group text-center">
                            <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Gift className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Free Test Tokens</h3>
                            <p className="text-muted leading-relaxed">
                                Only platform with free tokens to start
                            </p>
                        </div>

                        <div className="animate-fade-in-up stagger-2 group text-center">
                            <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Infinity className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Never Expire</h3>
                            <p className="text-muted leading-relaxed">
                                Buy once, use anytime
                            </p>
                        </div>

                        <div className="animate-fade-in-up stagger-3 group text-center">
                            <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Zap className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Top Quality</h3>
                            <p className="text-muted leading-relaxed">
                                Best settings, hard-coded
                            </p>
                        </div>

                        <div className="animate-fade-in-up stagger-4 group text-center">
                            <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Wand2 className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">AI Prompt Builder</h3>
                            <p className="text-muted leading-relaxed">
                                Free optimizer built-in
                            </p>
                        </div>

                        <div className="animate-fade-in-up stagger-5 group text-center">
                            <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Layers className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">One-Stop Shop</h3>
                            <p className="text-muted leading-relaxed">
                                All latest models in one place
                            </p>
                        </div>

                        <div className="animate-fade-in-up stagger-6 group text-center">
                            <div className="mb-6 inline-flex p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                                <Sparkles className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Your Choice</h3>
                            <p className="text-muted leading-relaxed">
                                Freedom to create your way
                            </p>
                        </div>
                    </div>
                </section>

                <section className="max-w-5xl mx-auto mb-32">
                    <h2 className="text-3xl font-bold text-center mb-4 animate-fade-in-up">
                        Latest Models Available
                    </h2>
                    <p className="text-center text-muted mb-16 animate-fade-in-up stagger-1">
                        Cutting-edge AI at your fingertips
                    </p>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MODELS.map((model, index) => (
                            <div 
                                key={model.name} 
                                className={`animate-fade-in-up stagger-${(index % 6) + 1} p-6 rounded-xl bg-surface/50 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-elevated-gold group`}
                            >
                                <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{model.name}</h3>
                                <p className="text-sm text-muted">{model.provider}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="max-w-6xl mx-auto mb-32">
                    <h2 className="text-3xl font-bold text-center mb-4 animate-fade-in-up">
                        Simple Pricing
                    </h2>
                    <p className="text-center text-muted mb-12 animate-fade-in-up stagger-1">
                        Better, cheaper, unrestricted
                    </p>
                    
                    <div className="animate-fade-in-up stagger-2">
                        <PricingCards onPurchase={handlePurchase} />
                    </div>
                </section>

                <section className="max-w-3xl mx-auto text-center py-20 animate-fade-in-up mb-20">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/30 to-primary/20 blur-3xl opacity-30 animate-pulse"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Ready to create?
                            </h2>
                            <p className="text-xl text-muted mb-10 max-w-xl mx-auto">
                                Start with free tokens. No credit card required.
                            </p>
                            <Button
                                size="lg"
                                onClick={() => router.push(user ? '/dashboard' : '/signup')}
                                className="shimmer-effect glow-on-hover text-lg px-8 py-4"
                            >
                                Get Started Free
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}