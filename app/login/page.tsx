'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { Footer } from '@/components/partials/Footer'

export default function LoginPage() {
    const router = useRouter()
    const { signIn } = useAuth()
    const { t, locale, setLocale } = useI18n()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        try {
            const { error } = await signIn(email, password)
            if (error) {
                setError(error.message)
            } else {
                router.push('/dashboard')
            }
        } catch (err) {
            setError(t.common.error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-[95vh] p-4">
            <div className="w-full max-w-lg">
                <Card>
                     <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold">{t.home.title}</h1>      
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t.auth.email}
                            required
                        />

                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t.auth.password}
                            required
                        />

                        {error && (
                            <p className="text-sm text-center text-red-600">{error}</p>
                        )}

                        <Button type="submit" disabled={isSubmitting} className="w-full">
                            {t.auth.login}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/signup" className="text-sm text-stone-500 hover:text-stone-700">
                            {t.auth.noAccount}
                        </Link>
                    </div>
                </Card>
            </div>
            <Footer />
        </div>
    )
}