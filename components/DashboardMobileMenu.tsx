'use client'

type NavItem = {
    path: string
    label: string
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

    const handleNavigate = (path: string) => {
        onNavigateAction(path)
        onCloseAction()
    }

    if (!isOpen) return null

    return (
        <>
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden max-h-screen overflow-auto"
                onClick={onCloseAction}
            />
            <div className="fixed top-0 right-0 z-50 w-64 h-full shadow-lg bg-surface md:hidden">
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
                                onClick={() => handleNavigate(item.path)}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                                    isActive(item.path)
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'text-text hover:bg-surface-hover'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 space-y-2 border-t border-border">
                        <button
                            onClick={() => {
                                onLocaleChangeAction()
                                onCloseAction()
                            }}
                            className="w-full px-4 py-2 text-left transition-colors rounded-lg text-muted hover:text-text hover:bg-surface-hover"
                        >
                            {locale === 'en' ? '🇩🇪 Deutsch' : '🇺🇸 English'}
                        </button>
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