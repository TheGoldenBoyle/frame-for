'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface RevenueStats {
    totalRevenue: number
    subscriptionRevenue: number
    onetimeRevenue: number
    activeSubscribers: number
    onetimePurchases: number
    remainingCapacity: number
    isAtCapacity: boolean
    percentageUsed: number
    canSignup: boolean
}

interface WaitlistEntry {
    id: string
    email: string
    createdAt: string
    approved: boolean
}

export default function AdminDashboard() {
    const { user } = useAuth()
    const router = useRouter()
    const [stats, setStats] = useState<RevenueStats | null>(null)
    const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    async function fetchData() {
        try {
            const [revenueRes, waitlistRes] = await Promise.all([
                fetch('/api/revenue'),
                fetch('/api/admin/waitlist')
            ])

            if (revenueRes.ok) {
                const data = await revenueRes.json()
                setStats(data)
            }

            if (waitlistRes.ok) {
                const data = await waitlistRes.json()
                setWaitlist(data.waitlist)
            }
        } catch (error) {
            console.error('Failed to fetch admin data')
        } finally {
            setIsLoading(false)
        }
    }

    async function approveWaitlist(email: string) {
        try {
            const response = await fetch('/api/admin/waitlist/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            if (response.ok) {
                fetchData()
            }
        } catch (error) {
            console.error('Failed to approve waitlist user')
        }
    }

    if (isLoading) {
        return <Loader fullScreen />
    }

    if (!stats) {
        return <div className="p-8">Failed to load admin data</div>
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
                    <p className="text-muted">Revenue tracking & waitlist management</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <div className="p-6">
                            <div className="text-sm text-muted mb-2">Total Revenue</div>
                            <div className="text-3xl font-bold text-primary">
                                €{stats.totalRevenue.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted mt-2">
                                Cap: €410.00
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <div className="text-sm text-muted mb-2">Remaining Capacity</div>
                            <div className="text-3xl font-bold">
                                €{stats.remainingCapacity.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted mt-2">
                                {stats.percentageUsed.toFixed(1)}% used
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <div className="text-sm text-muted mb-2">Status</div>
                            <div className={`text-2xl font-bold ${stats.canSignup ? 'text-green-600' : 'text-red-600'}`}>
                                {stats.canSignup ? 'ACCEPTING' : 'WAITLIST'}
                            </div>
                            <div className="text-xs text-muted mt-2">
                                {stats.canSignup ? 'New signups allowed' : 'At capacity'}
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4">Breakdown</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-muted">Active Subscribers:</span>
                                    <span className="font-semibold">{stats.activeSubscribers}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">Subscription Revenue:</span>
                                    <span className="font-semibold">€{stats.subscriptionRevenue.toFixed(2)}</span>
                                </div>
                                <div className="h-px bg-border my-2" />
                                <div className="flex justify-between">
                                    <span className="text-muted">One-time Purchases:</span>
                                    <span className="font-semibold">{stats.onetimePurchases}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted">One-time Revenue:</span>
                                    <span className="font-semibold">€{stats.onetimeRevenue.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4">Progress to Cap</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>€{stats.totalRevenue.toFixed(2)}</span>
                                        <span>€410.00</span>
                                    </div>
                                    <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all"
                                            style={{ width: `${Math.min(stats.percentageUsed, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-sm text-muted">
                                    {stats.isAtCapacity ? (
                                        <p className="text-yellow-600 font-medium">
                                            ⚠️ Safety buffer reached (€350). Waitlist active.
                                        </p>
                                    ) : (
                                        <p>
                                            You can earn €{stats.remainingCapacity.toFixed(2)} more before hitting the cap.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {waitlist.length > 0 && (
                    <Card>
                        <div className="p-6">
                            <h3 className="text-xl font-bold mb-4">
                                Waitlist ({waitlist.length} users)
                            </h3>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {waitlist.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                    >
                                        <div>
                                            <div className="font-medium">{entry.email}</div>
                                            <div className="text-xs text-muted">
                                                Joined: {new Date(entry.createdAt).toLocaleDateString('de-DE')}
                                            </div>
                                        </div>
                                        {!entry.approved && (
                                            <Button
                                                size="sm"
                                                onClick={() => approveWaitlist(entry.email)}
                                            >
                                                Approve
                                            </Button>
                                        )}
                                        {entry.approved && (
                                            <span className="text-sm text-green-600 font-medium">
                                                ✓ Approved
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Card>
                )}

                {waitlist.length === 0 && (
                    <Card>
                        <div className="p-6 text-center text-muted">
                            No users on waitlist yet
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}