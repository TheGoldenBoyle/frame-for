'use client'

import { ThemeToggle } from '@/components/ThemeToggle'

type NavItem = {
    path: string
    label: string
    disabled?: boolean
    comingSoon?: boolean
}

type MobileMenuProps = {
    isOpen: boolean
    onCloseAction: () => void
    pathname: string
    onNavigateAction: (path: string) => void
    t: any
    locale: string
    onLocaleChangeAction: () => void
    onSignOutAction: () => void
    navItems: NavItem[]
}

export function DashboardMobileMenu({
    isOpen,
    onCloseAction,
    pathname,
    onNavigateAction,
    t,
    locale,
    onLocaleChangeAction,
    onSignOutAction,
    navItems,
}: MobileMenuProps) {
    const isActive = (path: string) => pathname === path

    const handleNavigate = (item: NavItem) => {
        if (!item.disabled) {
            onNavigateAction(item.path)
            onCloseAction()
        }
    }

    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden h-screen overflow-auto"
                onClick={onCloseAction}
            />
            <div className="fixed top-0 right-0 z-50 w-64 h-full shadow-lg bg-white/80 md:hidden">
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <span className="text-xl font-bold">
                            Bild<span className="text-primary">Oro</span>
                        </span>
                        <button
                            onClick={onCloseAction}
                            className="p-2"
                            aria-label="Close menu"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {navItems.map((item) => (
                            <button
                                key={item.path}
                                onClick={() => handleNavigate(item)}
                                disabled={item.disabled}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors relative ${item.disabled
                                        ? 'cursor-not-allowed opacity-60'
                                        : ''
                                    } ${isActive(item.path)
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-text hover:bg-surface-hover'
                                    }`}
                            >
                                {item.comingSoon && (
                                    <span className="absolute -top-1 -right-1 px-2 py-0.5 text-[9px] font-bold rounded-full bg-primary text-white shadow-md">
                                        SOON
                                    </span>
                                )}
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 space-y-2 border-t border-border">
                        <div className="flex items-center justify-between w-full py-2 rounded-lg text-muted">
                            <ThemeToggle />
                            <button
                                onClick={() => {
                                    onLocaleChangeAction()
                                    onCloseAction()
                                }}
                                className=" px-4 py-2 text-left transition-colors rounded-lg text-muted hover:text-text hover:bg-surface-hover"
                            >
                                {locale === 'en' ? 'DE' : 'EN'}
                            </button>
                        </div>

                        <button
                            onClick={() => {
                                onSignOutAction()
                                onCloseAction()
                            }}
                            className="w-full px-4 py-2 text-left transition-colors rounded-lg text-muted hover:text-text hover:bg-surface-hover"
                        >
                            {t.auth.logout}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}