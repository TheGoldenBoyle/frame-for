'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { Loader } from '@/components/ui/Loader'
import { Sparkles, Zap, Image, LogOut, Trash2, ImagePlus } from 'lucide-react'

export default function DashboardPage() {
    const router = useRouter()
    const { user, signOut } = useAuth()
    const { t } = useI18n()
    const [tokens, setTokens] = useState(0)
    const [tokenType, setTokenType] = useState('free')
    const [subscriptionStatus, setSubscriptionStatus] = useState('free')
    const [isLoading, setIsLoading] = useState(true)
    const [purchaseLoading, setPurchaseLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        async function fetchTokenBalance() {
            try {
                const response = await fetch('/api/tokens')
                const data = await response.json()

                setTokens(data.tokens ?? 0) // default to 0 if null
                setTokenType(data.tokenType)
                setSubscriptionStatus(data.subscriptionStatus)
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
            const response = await fetch('/api/account/delete', { method: 'POST' })

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

    const isSubscribed = subscriptionStatus === 'active'

    return (
        <div className="min-h-[calc(100vh-80px)] overflow-y-auto p-4 md:p-8">
            {/* Plan Badge + Token Count */}
            <div className="flex items-center max-w-5xl gap-4 mx-auto mb-6">
                <span
                    className={`px-2 py-1 text-sm font-medium rounded ${
                        isSubscribed ? 'text-white bg-primary' : 'text-muted border border-border'
                    }`}
                >
                    {isSubscribed
                        ? 'Active Subscription'
                        : tokenType === 'onetime'
                        ? 'One-Time Pack'
                        : 'Free Plan'}
                </span>

                <span className="px-2 py-1 text-sm font-medium border rounded text-primary border-primary">
                    {tokens ?? 0} {tokens === 1 ? 'token' : 'tokens'}
                </span>
            </div>

            <div className="max-w-5xl mx-auto space-y-8">
                {tokens < 3 && (
                    <div className="p-4 border rounded-lg bg-yellow-500/5 border-yellow-500/20">
                        <p className="text-sm font-medium text-yellow-800">
                            ⚠️ Low balance — You need at least 3 tokens to use Pro Studio
                        </p>
                    </div>
                )}

                {/* Quick Actions */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        <button
                            onClick={() => router.push('/dashboard/playground')}
                            className="flex flex-col items-center justify-center p-6 text-center transition-all border rounded-xl bg-surface border-border hover:border-primary/30"
                        >
                            <Sparkles className="w-6 h-6 mb-3 text-primary" />
                            <div className="mb-1 font-semibold">Playground</div>
                            <div className="text-xs text-muted">Compare models</div>
                        </button>

                        <button
                            onClick={() => router.push('/dashboard/image-playground')}
                            className="flex flex-col items-center justify-center p-6 text-center transition-all border rounded-xl bg-surface border-border hover:border-primary/30"
                        >
                            <ImagePlus className="w-6 h-6 mb-3 text-primary" />
                            <div className="mb-1 font-semibold">Image Playground</div>
                            <div className="text-xs text-muted">Image-to-image</div>
                        </button>

                        <button
                            onClick={() => router.push('/dashboard/pro-studio')}
                            className="flex flex-col items-center justify-center p-6 text-center transition-all border rounded-xl bg-surface border-border hover:border-primary/30"
                        >
                            <Zap className="w-6 h-6 mb-3 text-primary" />
                            <div className="mb-1 font-semibold">Pro Studio</div>
                            <div className="text-xs text-muted">Hyper-realistic</div>
                        </button>

                        <button
                            onClick={() => router.push('/dashboard/gallery')}
                            className="flex flex-col items-center justify-center p-6 text-center transition-all border rounded-xl bg-surface border-border hover:border-primary/30"
                        >
                            <Image className="w-6 h-6 mb-3 text-primary" />
                            <div className="mb-1 font-semibold">Gallery</div>
                            <div className="text-xs text-muted">Your work</div>
                        </button>
                    </div>
                </div>

                {/* Get More Tokens */}
                <div>
                    <h2 className="mb-4 text-xl font-semibold">Get More Tokens</h2>
                    <div className="grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
                        <div
                            className={`p-6 rounded-xl border transition-all ${
                                isSubscribed
                                    ? 'bg-primary/5 border-primary'
                                    : 'bg-surface border-border hover:border-primary/30'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="mb-1 font-semibold">Monthly</h3>
                                    <div className="text-2xl font-bold">
                                        €4.99
                                        <span className="text-sm font-normal text-muted">/mo</span>
                                    </div>
                                </div>
                                {isSubscribed && (
                                    <span className="px-2 py-1 text-xs font-medium text-white rounded bg-primary">
                                        Active
                                    </span>
                                )}
                            </div>
                            <ul className="mb-4 space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span>
                                    <span>50 tokens/month</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span>
                                    <span>Auto-renewal</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span>
                                    <span>Cancel anytime</span>
                                </li>
                            </ul>
                            {!isSubscribed && (
                                <Button
                                    onClick={() => handlePurchaseTokens('subscription')}
                                    disabled={purchaseLoading}
                                    className="w-full"
                                >
                                    Subscribe
                                </Button>
                            )}
                        </div>

                        <div className="p-6 transition-all border rounded-xl bg-surface border-border hover:border-primary/30">
                            <div className="mb-4">
                                <h3 className="mb-1 font-semibold">One-Time</h3>
                                <div className="text-2xl font-bold">
                                    €9.99
                                    <span className="text-sm font-normal text-muted"> once</span>
                                </div>
                            </div>
                            <ul className="mb-4 space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span>
                                    <span>100 tokens</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span>
                                    <span>Never expire</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-primary">✓</span>
                                    <span>No commitment</span>
                                </li>
                            </ul>
                            <Button
                                onClick={() => handlePurchaseTokens('onetime')}
                                disabled={purchaseLoading}
                                variant="outline"
                                className="w-full"
                            >
                                Buy Tokens
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Account Section */}
                <div className="pt-8 border-t border-border">
                    <h2 className="mb-4 text-xl font-semibold">Account</h2>
                    <div className="mb-4">
                        <p className="text-sm text-muted">{user?.email}</p>
                    </div>
                    <div className="grid gap-2 lg:w-1/2 lg:grid-cols-2 lg:gap-4">
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="flex flex-col items-center justify-center"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>

                        <Button
                            onClick={handleDeleteAccount}
                            variant="outline"
                            className={`flex flex-col items-center justify-center ${
                                showDeleteConfirm
                                    ? 'border-red-500 text-red-500 hover:bg-red-50'
                                    : ''
                            }`}
                            disabled={deleteLoading}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {deleteLoading
                                ? 'Deleting...'
                                : showDeleteConfirm
                                ? 'Confirm Delete'
                                : 'Delete Account'}
                        </Button>
                    </div>

                    {showDeleteConfirm && (
                        <div className="p-3 mt-4 border border-red-200 rounded-lg bg-red-50">
                            <p className="text-xs text-red-600">
                                This will permanently delete your account and all data.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
