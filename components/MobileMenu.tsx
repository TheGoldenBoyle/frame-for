'use client'

import { useEffect, useRef } from 'react'

type MobileMenuProps = {
    isOpen: boolean
    onCloseAction: () => void
    pathname: string
    onNavigateAction: (path: string) => void
    t: any
    locale: string
    onLocaleChangeAction: () => void
    onSignOutAction: () => void
}

export function MobileMenu({
    isOpen,
    onCloseAction,
    pathname,
    onNavigateAction,
    t,
    locale,
    onLocaleChangeAction,
    onSignOutAction
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
            onCloseAction()
            startX.current = null
        }
    }

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onCloseAction()
        }
    }

    const navItems = [
        // { path: '/dashboard', label: t.home.dashboard },
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
                        <span className="text-2xl font-black text-text">FF</span>
                        <button
                            onClick={onCloseAction}
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
                                        onNavigateAction(item.path)
                                        onCloseAction()
                                    }}
                                    className={`w-full text-center px-6 py-4 rounded-lg transition-colors ${pathname === item.path
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
                                onLocaleChangeAction()
                                onCloseAction()
                            }}
                            className="w-full px-6 py-4 transition-colors rounded-lg text-muted hover:bg-surface hover:text-text"
                        >
                            {locale === 'en' ? 'Deutsch' : 'English'}
                        </button>
                        <button
                            onClick={() => {
                                onSignOutAction()
                                onCloseAction()
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