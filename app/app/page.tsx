'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'

export default function Home() {
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
                <p className="text-stone-500">{t.common.loading}</p>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">{t.home.title}</h1>
                    <div className="flex items-center gap-4">
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
                <Card>
                    <p className="text-center text-stone-500">
                        {t.auth.welcome}, {user.email}
                    </p>
                    <p className="mt-4 text-sm text-center text-stone-400">
                        {t.home.uploadSoon}
                    </p>
                </Card>
            </div>
        </div>
    )
}