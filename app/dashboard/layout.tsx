'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/Button'

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
                <p className="text-muted">{t.common.loading}</p>
            </div>
        )
    }

    if (!user) {
        return null
    }

    const isActive = (path: string) => pathname === path

    return (
        <div className="min-h-screen">
            <nav className="border-b border-border">
                <div className="max-w-6xl px-8 py-4 mx-auto">
                    <div className="flex flex-col items-center justify-between md:flex-row">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-2xl font-bold text-text"
                        >
                            FF
                        </button>
                        
                        <div className="flex gap-4 mx-auto mt-4 md:mt-0">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    isActive('/dashboard')
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted hover:text-text'
                                }`}
                            >
                                {t.home.dashboard}
                            </button>
                            <button
                                onClick={() => router.push('/dashboard/playground')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    isActive('/dashboard/playground')
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted hover:text-text'
                                }`}
                            >
                                {t.playground.title}
                            </button>
                            <button
                                onClick={() => router.push('/dashboard/gallery')}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    isActive('/dashboard/gallery')
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-muted hover:text-text'
                                }`}
                            >
                                {t.dashboard.viewGallery}
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <ThemeToggle />
                            <button
                                onClick={() => setLocale(locale === 'en' ? 'de' : 'en')}
                                className="text-sm transition-colors text-muted hover:text-text"
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