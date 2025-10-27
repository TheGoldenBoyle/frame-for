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

export default function SignupPage() {
    const router = useRouter()
    const { signIn, signInWithGoogle } = useAuth()
    const { t } = useI18n()
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
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
                body: JSON.stringify({ email, username, password }),
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

            router.push('/dashboard/playground')
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
        <>
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
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                required
                                minLength={3}
                                maxLength={30}
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

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-muted"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 text-muted">Or continue with</span>
                                </div>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGoogleSignIn}
                                    className="w-full"
                                >
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path
                                            fill="currentColor"
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        />
                                        <path
                                            fill="currentColor"
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        />
                                    </svg>
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
                                </Button> */}
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link href="/login" className="text-sm text-muted hover:text-muted">
                                {t.auth.hasAccount}
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
            <Footer />
        </>
    )
}