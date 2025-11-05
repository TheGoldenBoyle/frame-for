'use client'

import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/lib/i18n/context'

interface PricingCardsProps {
    onPurchase: (type: 'onetime' | 'subscription') => void
    loading?: boolean
}

export function PricingCards({ onPurchase, loading = false }: PricingCardsProps) {
    const { t } = useI18n()

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Monthly Subscription */}
            <Card className="p-4 rounded-xl border transition-all bg-surface border-border hover:border-primary/30 relative">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="mb-1 font-semibold text-2xl">{t.landing.monthlyTitle}</h3>
                        <div className="text-3xl font-bold flex items-baseline gap-2">
                            <span className="text-muted line-through text-lg">{t.landing.monthlyOriginalPrice}</span>
                            <span>{t.landing.monthlyPrice}</span>
                            <span className="text-sm font-normal text-muted">{t.landing.monthlyPeriod}</span>
                        </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium text-white rounded bg-primary">
                        {t.landing.monthlyBadge}
                    </span>
                </div>

                <ul className="mb-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>{t.landing.monthlyFeature1}
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>{t.landing.monthlyFeature2}
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>{t.landing.monthlyFeature3}
                    </li>
                    <li className="pt-2 mt-2 border-t border-border/50 flex items-center gap-2 text-sm">
                        <span className="text-primary">✨</span>{t.landing.monthlyFeature4}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                        <span className="text-primary">✨</span>{t.landing.monthlyFeature5}
                    </li>
                </ul>

                <Button
                    onClick={() => onPurchase('subscription')}
                    className="w-full"
                    size="lg"
                    disabled={loading}
                >
                    {t.landing.monthlyButton}
                </Button>
            </Card>

            {/* One-Time Pack */}
            <Card className="p-4 rounded-xl border transition-all bg-surface border-border hover:border-primary/30">
                <div className="mb-4">
                    <h3 className="mb-1 font-semibold text-2xl">{t.landing.onetimeTitle}</h3>
                    <div className="text-3xl font-bold flex items-baseline gap-2">
                        <span className="text-muted line-through text-lg">{t.landing.onetimeOriginalPrice}</span>
                        <span>{t.landing.onetimePrice}</span>
                        <span className="text-sm font-normal text-muted">{t.landing.onetimePeriod}</span>
                    </div>
                </div>

                <ul className="mb-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>{t.landing.onetimeFeature1}
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>{t.landing.onetimeFeature2}
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="text-primary">✓</span>{t.landing.onetimeFeature3}
                    </li>
                    <li className="pt-2 mt-2 border-t border-border/50 flex items-center gap-2 text-sm">
                        <span className="text-primary">✨</span>{t.landing.onetimeFeature4}
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                        <span className="text-primary">✨</span>{t.landing.onetimeFeature5}
                    </li>
                </ul>

                <Button
                    onClick={() => onPurchase('onetime')}
                    className="w-full"
                    variant="outline"
                    size="lg"
                    disabled={loading}
                >
                    {t.landing.onetimeButton}
                </Button>
            </Card>
        </div>
    )
}