'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { Loader } from '@/components/ui/Loader'
import { PricingCards } from '@/components/PricingCards'

export default function DashboardPage() {
    const router = useRouter()
    const { user, signOut } = useAuth()
    const { t } = useI18n()
    const [tokens, setTokens] = useState(0)
    const [tokenType, setTokenType] = useState('free')
    const [isLoading, setIsLoading] = useState(true)
    const [purchaseLoading, setPurchaseLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

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
        setPurchaseLoading(true)
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
        } finally {
            setPurchaseLoading(false)
        }
    }

    const handleLogout = async () => {
        const { error } = await signOut()
        if (!error) {
            router.push('/')
            router.refresh()
        } else {
            console.error('Logout failed:', error)
        }
    }

    const handleDeleteAccount = async () => {
        if (!showDeleteConfirm) {
            setShowDeleteConfirm(true)
            return
        }

        setDeleteLoading(true)
        try {
            const response = await fetch('/api/account/delete', {
                method: 'POST'
            })

            if (response.ok) {
                router.push('/')
                router.refresh()
            } else {
                const data = await response.json()
                alert(data.error || 'Failed to delete account')
            }
        } catch (error) {
            console.error('Delete account failed')
            alert('Failed to delete account')
        } finally {
            setDeleteLoading(false)
            setShowDeleteConfirm(false)
        }
    }

    if (isLoading) {
        return <Loader fullScreen />
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Token Balance */}
                <div className="text-center">
                    <Card className="inline-block">
                        <div className="px-8 py-6">
                            <div className="flex items-center justify-center gap-4">
                                <span className="text-lg text-muted">Current Balance:</span>
                                <span className="text-4xl font-bold text-primary">
                                    {tokens ?? 0}
                                </span>
                                <span className="text-lg text-muted">tokens</span>
                            </div>
                            {tokenType === 'subscription' && (
                                <p className="text-sm text-muted mt-2">Active Subscription</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Quick Actions */}
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

                {/* Pricing Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-center">Get More Tokens</h2>
                    <PricingCards onPurchase={handlePurchaseTokens} loading={purchaseLoading} />
                </div>

                {/* Low Balance Warning */}
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

                {/* Account Actions */}
                <div className="max-w-2xl mx-auto pt-8 border-t border-border">
                    <h3 className="text-xl font-bold mb-4 text-center">Account Settings</h3>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            size="lg"
                        >
                            Logout
                        </Button>
                        <Button
                            onClick={handleDeleteAccount}
                            variant="outline"
                            size="lg"
                            className={showDeleteConfirm ? 'border-red-500 text-red-500 hover:bg-red-50' : ''}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? 'Deleting...' : showDeleteConfirm ? 'Click Again to Confirm' : 'Delete Account'}
                        </Button>
                    </div>
                    {showDeleteConfirm && (
                        <p className="text-center text-sm text-red-600 mt-3">
                            Warning: This will permanently delete your account, cancel any active subscriptions, and remove all your data. This cannot be undone.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}