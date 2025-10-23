'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { TOKEN_CONFIG } from '@/lib/config/tokens'

export default function DashboardPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { t } = useI18n()
    const [tokens, setTokens] = useState(0)
    const [tokenType, setTokenType] = useState('free')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchTokenBalance() {
            try {
                const response = await fetch('/api/tokens')
                const data = await response.json()
                
                setTokens(data.tokens)
                setTokenType(data.tokenType)
            } catch (error) {
                console.error('Failed to fetch token balance')
            } finally {
                setIsLoading(false)
            }
        }

        fetchTokenBalance()
    }, [])

    const handlePurchaseTokens = async (type: 'onetime' | 'subscription') => {
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

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">{t.common.loading}</div>
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center">
                    <div className="bg-surface border-border border rounded-lg p-6 inline-block">
                        <div className="flex items-center justify-center space-x-4">
                            <span className="text-lg text-muted">Current Balance:</span>
                            <span className="text-3xl font-bold">
                                {tokens} {tokenType === 'free' ? 'Free Tokens' : 'Tokens'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                    <Card className="p-8 hover:shadow-xl transition-all duration-300 ease-in-out">
                        <div className="space-y-6 text-center">
                            <h2 className="text-2xl font-bold mb-4">Monthly Subscription</h2>
                            <p className="text-muted mb-4">Unlimited creativity with our monthly plan</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">€4.99</span>
                                <p className="text-muted">per month</p>
                            </div>
                            <Button 
                                onClick={() => handlePurchaseTokens('subscription')}
                                className="w-full"
                                size="lg"
                            >
                                Subscribe Now
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-8 hover:shadow-xl transition-all duration-300 ease-in-out">
                        <div className="space-y-6 text-center">
                            <h2 className="text-2xl font-bold mb-4">Token Pack</h2>
                            <p className="text-muted mb-4">One-time purchase for flexible use</p>
                            <div className="mb-6">
                                <span className="text-4xl font-bold">€9.99</span>
                                <p className="text-muted">per pack</p>
                            </div>
                            <Button 
                                onClick={() => handlePurchaseTokens('onetime')}
                                className="w-full"
                                variant="outline"
                                size="lg"
                            >
                                Buy Token Pack
                            </Button>
                        </div>
                    </Card>
                </div>

                {tokens === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-center">
                        <p className="text-yellow-700">
                            You've used all your free tokens. Purchase more to continue generating images.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}