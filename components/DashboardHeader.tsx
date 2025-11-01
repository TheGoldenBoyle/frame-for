'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useScrollDirection } from '@/hooks/useScrollDirection'
import { DashboardMobileMenu } from './DashboardMobileMenu'
import { ThemeToggle } from '@/components/ThemeToggle'

type DashboardHeaderProps = {
    user: any
    t: any
    locale: string
    onLocaleChangeAction: () => void
    onSignOutAction: () => void
}

export function DashboardHeader({
    t,
    locale,
    onLocaleChangeAction,
    onSignOutAction,
}: DashboardHeaderProps) {
    const router = useRouter()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const isVisible = useScrollDirection()

    const navItems = [
        { path: '/dashboard', label: t.home.tokens },
        { path: '/dashboard/playground', label: t.playground.title },
        { path: '/dashboard/image-playground', label: 'Image Playground' },
        { path: '/dashboard/pro-studio', label: 'Pro Studio' },
        { path: '/dashboard/gallery', label: t.dashboard.viewGallery },
    ]

    const isActive = (path: string) => pathname === path

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 bg-surface border-b border-border z-30 transition-transform duration-300 ${
                    isVisible ? 'translate-y-0' : '-translate-y-full'
                }`}
            >
                <div className="max-w-6xl px-4 py-4 mx-auto md:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-2xl font-bold text-text"
                        >
                            Bild<span className="font-black text-primary">Oro</span>
                        </button>

                        {/* Desktop Navigation */}
                        <div className="hidden gap-4 md:flex">
                            {navItems.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => router.push(item.path)}
                                    className={`px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                                        isActive(item.path)
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-muted hover:text-text'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden items-center gap-3 md:flex">
                            {/* Language Switcher */}
                            <button
                                onClick={onLocaleChangeAction}
                                className="text-sm transition-colors text-muted hover:text-text"
                            >
                                {locale === 'en' ? 'DE' : 'EN'}
                            </button>

                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Sign Out */}
                            <button
                                onClick={onSignOutAction}
                                className="px-4 py-2 transition-colors rounded-lg text-muted hover:text-text"
                            >
                                {t.auth.logout}
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-2 md:hidden"
                            aria-label="Open menu"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <DashboardMobileMenu
                isOpen={mobileMenuOpen}
                onCloseAction={() => setMobileMenuOpen(false)}
                pathname={pathname}
                onNavigateAction={router.push}
                t={t}
                locale={locale}
                onLocaleChangeAction={onLocaleChangeAction}
                onSignOutAction={onSignOutAction}
                navItems={navItems}
            />

            <div className="h-16" />
        </>
    )
}
