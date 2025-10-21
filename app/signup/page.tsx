'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
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

            const plan = sessionStorage.getItem('selectedPlan')
            
            if (plan) {
                sessionStorage.removeItem('selectedPlan')
                
                const checkoutResponse = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: plan })
                })

                const checkoutData = await checkoutResponse.json()

                if (checkoutData.url) {
                    window.location.href = checkoutData.url
                    return
                }
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

                    {selectedPlan && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                            Selected plan: {selectedPlan === 'subscription' ? 'Monthly (€4.99/mo)' : 'One-Time (€9.99)'}
                        </div>
                    )}

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

                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {selectedPlan ? t.auth.signup + ' & Checkout' : t.auth.signup}
                        </Button>
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