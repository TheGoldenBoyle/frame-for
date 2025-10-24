'use client'

import { useEffect, useRef } from 'react'
import LogoLink from '../ui/LogoLink'
import Link from 'next/link'

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
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = () => {
            if (isOpen) {
                onCloseAction()
            }
        }

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onCloseAction()
            }
        }

        if (isOpen) {
            document.body.style.overflow = 'hidden'
            window.addEventListener('scroll', handleScroll)
            document.addEventListener('mousedown', handleClickOutside)
        } else {
            document.body.style.overflow = ''
            window.removeEventListener('scroll', handleScroll)
            document.removeEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('scroll', handleScroll)
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen, onCloseAction])

    const handleTouchStart = (e: React.TouchEvent) => {
        startX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!startX.current) return

        const currentX = e.touches[0].clientX
        const diff = startX.current - currentX

        // Swipe left to close (reversed logic for right-side menu)
        if (diff > 50) {
            onCloseAction()
            startX.current = null
        }
    }

    const navItems = [
        { path: '/dashboard', label: t.home.dashboard },
        { path: '/dashboard/playground', label: t.playground.title },
        { path: '/dashboard/gallery', label: t.dashboard.viewGallery },
    ]

    return (
        <>
            {/* Full-screen Backdrop */}
            <div
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ease-in-out ${
                    isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
                }`}
                onClick={onCloseAction}
            />

            {/* Full-screen Mobile Menu */}
            <div
                ref={menuRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                className={`
                    fixed inset-0 bg-surface z-50 
                    transform transition-transform duration-300 ease-out
                    flex flex-col max-h-screen
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Header with Logo and Close Button */}
                <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-border">
                    <LogoLink />
                    <button
                        onClick={onCloseAction}
                        className="p-2 transition-colors rounded-lg active:scale-95"
                        aria-label="Close menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <nav className="p-4 space-y-2 mx-auto py-10">
                    {navItems.map((item, index) => (
                        <button
                            key={item.path}
                            onClick={() => {
                                onNavigateAction(item.path)
                                onCloseAction()
                            }}
                            style={{
                                transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                            }}
                            className={`
                                w-full px-4 py-3 rounded-lg transition-all text-base text-center
                                transform ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}
                                ${pathname === item.path
                                    ? 'bg-primary/10 text-primary font-semibold'
                                    : 'text-text active:scale-98'}
                            `}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* Action Buttons */}
                <div className="p-4 space-y-2 border-t border-border mt-auto mx-4">
                    <button
                        onClick={() => {
                            onLocaleChangeAction()
                            onCloseAction()
                        }}
                        className="w-full px-4 py-3 text-base transition-colors rounded-lg text-muted active:scale-98"
                    >
                        {locale === 'en' ? 'Deutsch' : 'English'}
                    </button>
                    <button
                        onClick={() => {
                            onSignOutAction()
                            onCloseAction()
                        }}
                        className="w-full px-4 py-3 text-base font-medium transition-colors rounded-lg text-text active:scale-98"
                    >
                        {t.auth.logout}
                    </button>
                </div>
              

                {/* Footer Links - Fixed at Bottom */}
                <div className="flex-shrink-0 p-4 text-center border-t border-border mx-4">
                    <div className="flex justify-center gap-10 text-sm text-muted">
                        <Link 
                            href="/imprint" 
                            className=" transition-colors active:text-primary"
                            onClick={onCloseAction}
                        >
                            {t.imprint.title}
                        </Link>
                        <Link 
                            href="/contact" 
                            className=" transition-colors active:text-primary"
                            onClick={onCloseAction}
                        >
                            {t.common.contact}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}