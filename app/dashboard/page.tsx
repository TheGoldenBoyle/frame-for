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
        <div className="container mx-auto p-6 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <h2 className="text-2xl font-bold mb-4">Your Tokens</h2>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg">Current Balance:</span>
                        <span className="text-2xl font-bold">
                            {tokens} {tokenType === 'free' ? 'Free Tokens' : 'Tokens'}
                        </span>
                    </div>

                    <Button 
                        onClick={() => router.push('/dashboard/studio')} 
                        className="w-full mb-4"
                    >
                        Go to Studio
                    </Button>

                    {tokens === 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                            <p className="text-yellow-700">
                                You've used all your free tokens. Purchase more to continue generating images.
                            </p>
                        </div>
                    )}
                </Card>

                <Card>
                    <h2 className="text-2xl font-bold mb-4">Add Tokens</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold mb-2">One-Time Purchase</h3>
                            <Button 
                                onClick={() => handlePurchaseTokens('onetime')}
                                className="w-full"
                                variant="outline"
                            >
                                {TOKEN_CONFIG.ONETIME_TOKENS} Tokens - €{TOKEN_CONFIG.ONETIME_PRICE}
                            </Button>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Monthly Subscription</h3>
                            <Button 
                                onClick={() => handlePurchaseTokens('subscription')}
                                className="w-full"
                            >
                                {TOKEN_CONFIG.SUBSCRIPTION_TOKENS} Tokens - €{TOKEN_CONFIG.SUBSCRIPTION_PRICE}/mo
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}