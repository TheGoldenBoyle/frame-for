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
    const { signIn, signInWithGoogle } = useAuth()
    const { t } = useI18n()
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

    const handleGoogleSignIn = async () => {
        setError('')
        try {
            const { error } = await signInWithGoogle()
            if (error) {
                setError(error.message)
            }
        } catch (err) {
            setError(t.common.error)
        }
    }

    // const handleTwitterSignIn = async () => {
    //     setError('')
    //     try {
    //         const { error } = await signInWithTwitter()
    //         if (error) {
    //             setError(error.message)
    //         }
    //     } catch (err) {
    //         setError(t.common.error)
    //     }
    // }

    return (
        <div className="flex items-center justify-center min-h-screen md:p-4 py-10 lg:py-32">
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

                    {/* <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-border"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 text-muted">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGoogleSignIn}
                                className="w-full text-center"
                            >
                                Google
                            </Button>

                            {/* <Button
                                type="button"
                                variant="outline"
                                onClick={handleTwitterSignIn}
                                className="w-full"
                            >
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                X
                            </Button>
                        </div>
                    </div> */}

                    <div className="mt-6 text-center">
                        <Link href="/signup" className="text-sm text-muted hover:text-muted">
                            {t.auth.noAccount}
                        </Link>
                    </div>
                </Card>
            </div>
            <Footer />
        </div>
    )
}