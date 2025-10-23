'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { DashboardHeader } from '@/components/DashboardHeader'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
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

    return (
        <div className="min-h-screen">
            <DashboardHeader
                user={user}
                t={t}
                locale={locale}
                onLocaleChangeAction={() => setLocale(locale === 'en' ? 'de' : 'en')}
                onSignOutAction={signOut}
            />
            <main>
                {children}
            </main>
        </div>
    )
}