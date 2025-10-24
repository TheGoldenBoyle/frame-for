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
                {/* Animated background effect - bottom layer */}
                <AnimatedBackground intensity="low" />
                
                {/* Blur overlay layer - creates depth and softens the animation */}
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
                                onClick={() => router.push(user ? '/dashboard/playground' : '/signup')}
                            >
                                {t.playground.title}
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    )
}