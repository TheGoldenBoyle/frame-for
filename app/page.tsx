'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/Button'


export default function LandingPage() {
    const router = useRouter()
    const { user, loading } = useAuth()
    const { t, locale, setLocale } = useI18n()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted">{t.common.loading}</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen">
            <nav className="flex items-center justify-between px-8 py-6">
                <h1 className="text-2xl font-bold">FrameFor</h1>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <button
                        onClick={() => setLocale(locale === 'en' ? 'de' : 'en')}
                        className="text-sm text-muted hover:text-text transition-colors"
                    >
                        {locale === 'en' ? 'DE' : 'EN'}
                    </button>
                    {user ? (
                        <Button onClick={() => router.push('/dashboard')}>
                            {t.home.dashboard}
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={() => router.push('/login')}>
                                {t.auth.login}
                            </Button>
                            <Button onClick={() => router.push('/signup')}>
                                {t.auth.signup}
                            </Button>
                        </>
                    )}
                </div>
            </nav>

            <div className="flex flex-col items-center justify-center px-8 py-32 text-center">
                <h2 className="mb-6 text-5xl font-bold md:text-6xl">
                    {t.landing.headline}
                </h2>
                <p className="max-w-2xl mb-12 text-xl text-muted">
                    {t.landing.subheadline}
                </p>
                <Button
                    onClick={() => router.push(user ? '/dashboard' : '/signup')}
                >
                    {t.landing.cta}
                </Button>
            </div>
        </div>
    )
}