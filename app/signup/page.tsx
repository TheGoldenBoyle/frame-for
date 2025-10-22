'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { TOKEN_CONFIG } from '@/lib/config/tokens'

export default function SignupPage() {
    const router = useRouter()
    const { signIn } = useAuth()
    const { t, locale, setLocale } = useI18n()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

    useEffect(() => {
        const plan = sessionStorage.getItem('selectedPlan')
        if (plan) {
            setSelectedPlan(plan)
        }
    }, [])

    const handlePlanChange = (plan: string) => {
        setSelectedPlan(plan)
        sessionStorage.setItem('selectedPlan', plan)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!selectedPlan) {
            setError('Please select a plan to continue')
            return
        }

        setIsSubmitting(true)

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            const { error: signInError } = await signIn(email, password)
            if (signInError) {
                setError(signInError.message)
                return
            }

            sessionStorage.removeItem('selectedPlan')
            
            const checkoutResponse = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: selectedPlan })
            })

            const checkoutData = await checkoutResponse.json()

            if (checkoutData.url) {
                window.location.href = checkoutData.url
                return
            }

            router.push('/dashboard')
        } catch (err) {
            setError(t.common.error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md">
                <Card>
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold">{t.home.title}</h1>
                        <button
                            onClick={() => setLocale(locale === 'en' ? 'de' : 'en')}
                            className="text-sm text-stone-500 hover:text-stone-700"
                        >
                            {locale === 'en' ? 'DE' : 'EN'}
                        </button>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm font-medium mb-3">Select your plan:</p>
                        
                        <div className="space-y-3 mb-6">
                            <button
                                type="button"
                                onClick={() => handlePlanChange('subscription')}
                                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                                    selectedPlan === 'subscription'
                                        ? 'border-green-500 bg-green-50 text-green-900'
                                        : 'border-gray-200 hover:border-green-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="font-bold text-lg">Monthly</div>
                                    <div className="font-bold text-lg">€{TOKEN_CONFIG.SUBSCRIPTION_PRICE}/mo</div>
                                </div>
                                <div className="text-sm text-muted">
                                    {TOKEN_CONFIG.SUBSCRIPTION_TOKENS} tokens per month • Best value • Cancel anytime
                                </div>
                                {selectedPlan === 'subscription' && (
                                    <div className="mt-2 text-xs text-green-700 font-medium">✓ Selected</div>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => handlePlanChange('onetime')}
                                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                                    selectedPlan === 'onetime'
                                        ? 'border-green-500 bg-green-50 text-green-900'
                                        : 'border-gray-200 hover:border-green-300'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <div className="font-bold text-lg">One-Time</div>
                                    <div className="font-bold text-lg">€{TOKEN_CONFIG.ONETIME_PRICE}</div>
                                </div>
                                <div className="text-sm text-muted">
                                    {TOKEN_CONFIG.ONETIME_TOKENS} tokens • Never expire • No commitment
                                </div>
                                {selectedPlan === 'onetime' && (
                                    <div className="mt-2 text-xs text-green-700 font-medium">✓ Selected</div>
                                )}
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t.auth.email}
                            required
                        />

                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t.auth.password}
                            required
                        />

                        {error && (
                            <p className="text-sm text-center text-red-600">{error}</p>
                        )}

                        <Button 
                            type="submit" 
                            disabled={isSubmitting || !selectedPlan} 
                            className="w-full"
                        >
                            {isSubmitting ? 'Processing...' : 'Continue to Payment'}
                        </Button>

                        <p className="text-xs text-center text-muted">
                            You'll be redirected to Stripe to complete payment
                        </p>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm text-stone-500 hover:text-stone-700">
                            {t.auth.hasAccount}
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    )
}