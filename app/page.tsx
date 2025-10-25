'use client'

import { useRouter } from 'next/navigation'
import { useI18n } from '@/lib/i18n/context'
import { Button } from '@/components/ui/Button'
import { Footer } from '@/components/partials/Footer'
import { useAuth } from '@/hooks/useAuth'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'

export default function LandingPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { t } = useI18n()

    return (
        <>
            <div className="min-h-screen flex flex-col relative overflow-hidden">

                <AnimatedBackground intensity="low" />

                <div
                    className="absolute inset-0 pointer-events-none z-[1]"
                    style={{
                        background: 'var(--color-background)',
                        opacity: 0.65,
                        backdropFilter: 'blur(80px)',
                        WebkitBackdropFilter: 'blur(80px)'
                    }}
                />

                {/* Content layer - on top */}
                <main className="flex-grow flex items-center justify-center px-8 text-center relative z-10">
                    <div className="max-w-4xl">
                        <div className="mb-8 space-y-3">
                            <h2 className="text-5xl md:text-7xl font-old leading-tight">
                                {t.landing.headline1}
                            </h2>
                            {/* <h2 className="text-4xl md:text-5xl font-bold text-primary leading-tight">
                                {t.landing.headline2}
                            </h2> */}
                        </div>
                        <div className="text-xl text-muted max-w-2xl mx-auto mb-12 space-y-2">
                            <p className="font-medium">
                                {t.landing.subheadline1}
                            </p>
                            <p>
                                {t.landing.subheadline2}
                            </p>
                            <p className="text-lg mt-4">
                                {t.landing.subheadline3}
                            </p>
                        </div>
                        <div className="flex justify-center gap-4">
                            <Button
                                size="lg"
                                onClick={() => {
                                    alert("Woah slow down! 🚀\n\nRelease date is NOV 1.\n\nContact @theGoldenBoyle on X for early access.");
                                }}
                            >
                                {t.landing.cta}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => {
                                    alert("Woah slow down! 🚀\n\nRelease date is NOV 1.\n\nContact @theGoldenBoyle on X for early access.");
                                }}
                            >
                                {t.playground.title}
                            </Button>
                            {/* <Button
                                size="lg"
                                onClick={() => router.push(user ? '/dashboard' : '/signup')}
                            >
                                {t.landing.cta}
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => router.push(user ? '/dashboard/playground' : '/signup')}
                            >
                                {t.playground.title}
                            </Button> */}
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    )
}