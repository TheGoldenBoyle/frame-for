'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TOKEN_CONFIG } from '@/lib/config/tokens'

interface PricingCardsProps {
    onPurchase: (type: 'onetime' | 'subscription') => void
    loading?: boolean
}

export function PricingCards({ onPurchase, loading = false }: PricingCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Subscription Card */}
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
                        onClick={() => onPurchase('subscription')}
                        className="w-full"
                        size="lg"
                        disabled={loading}
                    >
                        Subscribe Now
                    </Button>

                    <p className="text-xs text-muted">
                        Cancel anytime, no questions asked
                    </p>
                </div>
            </Card>

            {/* One-Time Pack Card */}
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
                        onClick={() => onPurchase('onetime')}
                        className="w-full"
                        variant="outline"
                        size="lg"
                        disabled={loading}
                    >
                        Buy Token Pack
                    </Button>

                    <p className="text-xs text-muted">
                        Stack unlimited packs
                    </p>
                </div>
            </Card>
        </div>
    )
}