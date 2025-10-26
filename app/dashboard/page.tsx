'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { TOKEN_CONFIG } from '@/lib/config/tokens'
import { Loader } from '@/components/ui/Loader'

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
        return <Loader fullScreen />
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center">
                    <Card className="inline-block">
                        <div className="px-8 py-6">
                            <div className="flex items-center justify-center gap-4">
                                <span className="text-lg text-muted">Current Balance:</span>
                                <span className="text-4xl font-bold text-primary">
                                    {tokens}
                                </span>
                                <span className="text-lg text-muted">tokens</span>
                            </div>
                            {tokenType === 'subscription' && (
                                <p className="text-sm text-muted mt-2">Active Subscription</p>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-2 text-center">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                        <Button
                            onClick={() => router.push('/dashboard/playground')}
                            variant="outline"
                            className="h-24"
                        >
                            <div className="text-center">
                                <div className="text-lg font-semibold mb-1">Playground</div>
                                <div className="text-xs text-muted">Compare Models</div>
                            </div>
                        </Button>
                        <Button
                            onClick={() => router.push('/dashboard/pro-studio')}
                            variant="outline"
                            className="h-24"
                        >
                            <div className="text-center">
                                <div className="text-lg font-semibold mb-1">Pro Studio</div>
                                <div className="text-xs text-muted">Hyper-Realistic AI</div>
                            </div>
                        </Button>
                        <Button
                            onClick={() => router.push('/dashboard/gallery')}
                            variant="outline"
                            className="h-24"
                        >
                            <div className="text-center">
                                <div className="text-lg font-semibold mb-1">Gallery</div>
                                <div className="text-xs text-muted">View Your Work</div>
                            </div>
                        </Button>
                    </div>
                </div>

                <div>
                    <h2 className="text-2xl font-bold mb-6 text-center">Get More Tokens</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        <Card className="relative overflow-hidden">
                            <div className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                                BEST VALUE
                            </div>
                            <div className="p-8 space-y-6 text-center">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Monthly Subscription</h3>
                                    <p className="text-sm text-muted">
                                        Renews automatically every month
                                    </p>
                                </div>
                                
                                <div className="py-4">
                                    <div className="text-5xl font-bold mb-2">
                                        ${TOKEN_CONFIG.SUBSCRIPTION_PRICE}
                                    </div>
                                    <p className="text-muted">per month</p>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-2xl font-bold text-primary">
                                            {TOKEN_CONFIG.SUBSCRIPTION_TOKENS}
                                        </span>
                                        <span className="text-muted">tokens/month</span>
                                    </div>
                                    <p className="text-muted">
                                        ~33 Pro Studio images or 100 Playground generations
                                    </p>
                                </div>

                                <Button
                                    onClick={() => handlePurchaseTokens('subscription')}
                                    className="w-full"
                                    size="lg"
                                >
                                    Subscribe Now
                                </Button>

                                <p className="text-xs text-muted">
                                    Cancel anytime, no questions asked
                                </p>
                            </div>
                        </Card>

                        <Card>
                            <div className="p-8 space-y-6 text-center">
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">Token Pack</h3>
                                    <p className="text-sm text-muted">
                                        One-time purchase, never expires
                                    </p>
                                </div>
                                
                                <div className="py-4">
                                    <div className="text-5xl font-bold mb-2">
                                        ${TOKEN_CONFIG.ONETIME_PRICE}
                                    </div>
                                    <p className="text-muted">one-time</p>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-2xl font-bold text-primary">
                                            {TOKEN_CONFIG.ONETIME_TOKENS}
                                        </span>
                                        <span className="text-muted">tokens</span>
                                    </div>
                                    <p className="text-muted">
                                        ~16 Pro Studio images or 50 Playground generations
                                    </p>
                                </div>

                                <Button
                                    onClick={() => handlePurchaseTokens('onetime')}
                                    className="w-full"
                                    variant="outline"
                                    size="lg"
                                >
                                    Buy Token Pack
                                </Button>

                                <p className="text-xs text-muted">
                                    Stack unlimited packs
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>

                {tokens < 3 && (
                    <Card className="max-w-2xl mx-auto">
                        <div className="p-6 text-center border-yellow-200">
                            <p className="text-yellow-800 font-medium mb-2">
                                ⚠️ Low Token Balance
                            </p>
                            <p className="text-sm text-yellow-700">
                                You need at least 3 tokens to use Pro Studio. Get more tokens to continue creating!
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}