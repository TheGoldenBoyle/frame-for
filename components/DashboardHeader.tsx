'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useScrollDirection } from '@/hooks/useScrollDirection'

type MobileMenuProps = {
    isOpen: boolean
    onClose: () => void
    pathname: string
    onNavigate: (path: string) => void
    t: any
    locale: string
    onLocaleChange: () => void
    onSignOut: () => void
}

function MobileMenu({
    isOpen,
    onClose,
    pathname,
    onNavigate,
    t,
    locale,
    onLocaleChange,
    onSignOut
}: MobileMenuProps) {
    const startX = useRef<number | null>(null)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!startX.current) return

        const currentX = e.touches[0].clientX
        const diff = currentX - startX.current

        if (diff > 50) {
            onClose()
            startX.current = null
        }
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    const navItems = [
        { path: '/dashboard', label: t.home.dashboard },
        { path: '/dashboard/playground', label: t.playground.title },
        { path: '/dashboard/gallery', label: t.dashboard.viewGallery },
    ]

    return (
        <>
            <div
                className={`fixed inset-0 bg-text/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={handleBackdropClick}
            />

            <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                className={`fixed top-0 right-0 h-full w-full bg-surface z-50 transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b border-border">
                        <span className="text-2xl font-bold text-text">FF</span>
                        <button
                            onClick={onClose}
                            className="p-2 transition-colors rounded-lg hover:bg-primary/10"
                            aria-label="Close menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <nav className="flex-1 p-6">
                        <div className="space-y-2">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => {
                                        onNavigate(item.path)
                                        onClose()
                                    }}
                                    className={`w-full text-left px-6 py-4 rounded-lg transition-colors ${pathname === item.path
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-text hover:bg-surface'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </nav>

                    <div className="p-6 space-y-4 border-t border-border">
                        <button
                            onClick={() => {
                                onLocaleChange()
                                onClose()
                            }}
                            className="w-full px-6 py-4 transition-colors rounded-lg text-muted hover:bg-surface hover:text-text"
                        >
                            {locale === 'en' ? '🇩🇪 Deutsch' : '🇬🇧 English'}
                        </button>
                        <button
                            onClick={() => {
                                onSignOut()
                                onClose()
                            }}
                            className="w-full px-6 py-4 font-medium transition-colors rounded-lg text-text hover:bg-primary/10 hover:text-primary"
                        >
                            {t.auth.logout}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

type DashboardHeaderProps = {
    user: any
    t: any
    locale: string
    onLocaleChange: () => void
    onSignOut: () => void
}

export function DashboardHeader({
    t,
    locale,
    onLocaleChange,
    onSignOut
}: DashboardHeaderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const isVisible = useScrollDirection()

    const navItems = [
        { path: '/dashboard', label: t.home.dashboard },
        { path: '/dashboard/playground', label: t.playground.title },
        { path: '/dashboard/gallery', label: t.dashboard.viewGallery },
    ]

    const isActive = (path: string) => pathname === path

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 bg-surface border-b border-border z-30 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
                    }`}
            >
                <div className="max-w-6xl px-4 py-4 mx-auto md:px-8">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-2xl font-bold text-text"
                        >
                            FF
                        </button>

                        <div className="hidden gap-4 md:flex">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => router.push(item.path)}
                                    className={`px-4 py-2 rounded-lg transition-colors ${isActive(item.path)
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-muted hover:text-text'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="hidden gap-4 md:flex">
                            <button
                                onClick={onLocaleChange}
                                className="text-sm transition-colors text-muted hover:text-text"
                            >
                                {locale === 'en' ? 'DE' : 'EN'}
                            </button>
                            <button
                                onClick={onSignOut}
                                className="px-4 py-2 transition-colors rounded-lg text-muted hover:text-text"
                            >
                                {t.auth.logout}
                            </button>
                        </div>

                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 md:hidden"
                            aria-label="Open menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            <MobileMenu
                isOpen={mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                pathname={pathname}
                onNavigate={router.push}
                t={t}
                locale={locale}
                onLocaleChange={onLocaleChange}
                onSignOut={onSignOut}
            />

            <div className="h-16" />
        </>
    )
}