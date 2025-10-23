'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { t, locale, setLocale } = useI18n()

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="flex items-center justify-between px-8 py-6">
                <h1 className="text-2xl font-bold">BildOro</h1>
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
                        <Button onClick={() => router.push('/signup')}>
                            {t.auth.signup}
                        </Button>
                    )}
                </div>
            </nav>

            <main className="flex-grow flex items-center justify-center px-8 text-center">
                <div className="max-w-4xl">
                    <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                        {t.landing.headline}
                    </h2>
                    <p className="text-xl text-muted max-w-2xl mx-auto mb-12">
                        {t.landing.subheadline}
                    </p>
                    <div className="flex justify-center gap-4">
                        <Button 
                            size="lg" 
                            onClick={() => router.push(user ? '/dashboard' : '/signup')}
                        >
                            {t.landing.cta}
                        </Button>
                        <Button 
                            variant="outline" 
                            size="lg" 
                            onClick={() => router.push('/playground')}
                        >
                            {t.playground.title}
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    )
}