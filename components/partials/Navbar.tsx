'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export const Navbar = () => {
    const router = useRouter()
    const pathname = usePathname()
    const { user } = useAuth()
    const { t, locale, setLocale } = useI18n()

    if (pathname.startsWith('/dashboard')) return null

    return (
        <nav className="flex items-center justify-between px-8 py-6 absolute inset-x-0 max-w-6xl mx-auto z-[100]">
            <Link
                href="/"
                title="Go to home page"
                className="!text-2xl font-bold"
            >
                Bild<span className="font-black text-primary">Oro</span>
            </Link>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <button
                    onClick={() => setLocale(locale === 'en' ? 'de' : 'en')}
                    className="text-sm transition-colors text-muted hover:text-text"
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
    )
}