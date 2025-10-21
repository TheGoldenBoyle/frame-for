'use client'

import { useState } from 'react'
import { TOKEN_CONFIG } from '@/lib/config/tokens'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

type PricingCardsProps = {
    isLoggedIn?: boolean
}

export function PricingCards({ isLoggedIn = false }: PricingCardsProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSelect = async (type: 'subscription' | 'onetime') => {
        if (!isLoggedIn) {
            sessionStorage.setItem('selectedPlan', type)
            router.push('/signup')
            return
        }

        setLoading(true)
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type })
            })

            if (!response.ok) {
                throw new Error('Checkout failed')
            }

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            console.error('Checkout error:', error)
            alert('Failed to start checkout. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="border rounded-lg p-8 flex flex-col">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">Monthly</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">€{TOKEN_CONFIG.SUBSCRIPTION_PRICE}</span>
                        <span className="text-muted">/month</span>
                    </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                    <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{TOKEN_CONFIG.SUBSCRIPTION_TOKENS} tokens per month</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Resets monthly</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Best value for regular use</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Cancel anytime</span>
                    </li>
                </ul>

                <Button
                    onClick={() => handleSelect('subscription')}
                    disabled={loading}
                    className="w-full"
                >
                    {isLoggedIn ? 'Subscribe' : 'Get Started'}
                </Button>
            </div>

            <div className="border rounded-lg p-8 flex flex-col">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold mb-2">One-Time</h3>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">€{TOKEN_CONFIG.ONETIME_PRICE}</span>
                    </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                    <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>{TOKEN_CONFIG.ONETIME_TOKENS} tokens</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Never expire</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>No commitment</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span>Perfect for occasional use</span>
                    </li>
                </ul>

                <Button
                    onClick={() => handleSelect('onetime')}
                    disabled={loading}
                    variant="ghost"
                    className="w-full"
                >
                    {isLoggedIn ? 'Buy Now' : 'Get Started'}
                </Button>
            </div>
        </div>
    )
}