'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/Button'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, loading, signOut } = useAuth()
    const { t, locale, setLocale } = useI18n()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [loading, user, router])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-stone-500">{t.common.loading}</p>
            </div>
        )
    }

    if (!user) {
        return null
    }

    const isActive = (path: string) => pathname === path

    return (
        <div className="min-h-screen">
            <nav className="border-b border-stone-200">
                <div className="max-w-6xl px-8 py-4 mx-auto">
                    <div className="flex flex-col items-center justify-between md:flex-row">

                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-xl font-bold"
                        >
                            FrameFor
                        </button>
                        <div className="flex gap-4 mx-auto mt-4 md:mt-0">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className={`px-4 py-2 rounded-lg transition-colors ${isActive('/dashboard')
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-stone-600 hover:text-stone-900'
                                    }`}
                            >
                                {t.home.dashboard}
                            </button>
                            <button
                                onClick={() => router.push('/dashboard/playground')}
                                className={`px-4 py-2 rounded-lg transition-colors ${isActive('/dashboard/playground')
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-stone-600 hover:text-stone-900'
                                    }`}
                            >
                                {t.playground.title}
                            </button>
                            <button
                                onClick={() => router.push('/dashboard/gallery')}
                                className={`px-4 py-2 rounded-lg transition-colors ${isActive('/dashboard/gallery')
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-stone-600 hover:text-stone-900'
                                    }`}
                            >
                                {t.dashboard.viewGallery}
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setLocale(locale === 'en' ? 'de' : 'en')}
                                className="text-sm text-stone-500 hover:text-stone-700"
                            >
                                {locale === 'en' ? 'DE' : 'EN'}
                            </button>
                            <Button variant="ghost" onClick={() => signOut()}>
                                {t.auth.logout}
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>
            <main>{children}</main>
        </div>
    )
}