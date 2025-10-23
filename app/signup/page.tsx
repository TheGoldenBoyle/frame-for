'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import Link from 'next/link'

export default function SignupPage() {
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
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            const { error: signInError } = await signIn(email, password)
            if (signInError) {
                setError(signInError.message)
                return
            }

            // Redirect to playground
            router.push('/playground')
        } catch (err) {
            setError(t.common.error)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
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

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full"
                        >
                            {isSubmitting ? 'Processing...' : t.auth.signup}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm text-stone-500 hover:text-stone-700">
                            {t.auth.hasAccount}
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    )
}