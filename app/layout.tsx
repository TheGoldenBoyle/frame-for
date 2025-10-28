import type { Metadata, Viewport } from 'next'
import { I18nProvider } from '@/lib/i18n/context'
import './styles/globals.css'
import { Navbar } from '@/components/partials/Navbar'
import PWARegistration from '@/components/pwa/PWARegistration'
import PWAInstallPrompt from '@/components/pwa/PWAInstallPrompt'
import { AuthProvider } from '@/lib/auth/provider'
import { ThemeProvider } from '@/lib/theme/provider'
import { Lexend, DM_Sans } from 'next/font/google'
import { Analytics } from "@vercel/analytics/next"


const lexend = Lexend({ 
    subsets: ['latin'],
    variable: '--font-heading',
    weight: ['400', '500', '600', '700']
})

const dmSans = DM_Sans({ 
    subsets: ['latin'],
    variable: '--font-body',
    weight: ['400', '500', '600', '700']
})

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#D4AF37' },
        { media: '(prefers-color-scheme: dark)', color: '#D4AF37' }
    ]
}

export const metadata: Metadata = {
    metadataBase: new URL('https://bildoro.app'),
    title: {
        default: 'BildOro - Easy Access to Latest AI Models',
        template: '%s | BildOro'
    },
    description: 'Break free from restrictions. BildOro gives you instant, affordable access to the latest AI image generation models. No gatekeeping, no barriers—just pure creative freedom.',
    keywords: [
        'AI image generation',
        'latest AI models',
        'unrestricted AI access',
        'affordable AI tools',
        'image generation playground',
        'flux',
        'stable diffusion',
        'creative AI',
        'easy AI access'
    ],
    applicationName: 'BildOro',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'BildOro',
    },
    formatDetection: {
        telephone: false,
    },
    verification: {
        google: 'upvI-Brlhpw7hli76EeC9mKuU2wBcnU9n_zUSucdsd4'
    },
    manifest: '/manifest.json',
    openGraph: {
        title: 'BildOro - Easy Access to Latest AI Models',
        description: 'Break free from restrictions. Instant, affordable access to the latest AI image generation models. No gatekeeping, no barriers.',
        type: 'website',
        url: 'https://bildoro.app',
        siteName: 'BildOro',
        images: [
            {
                url: '/og-image-2.png',
                width: 1200,
                height: 630,
                alt: 'BildOro - Easy Access to Latest AI Image Generation Models'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'BildOro - Easy Access to Latest AI Models',
        description: 'Break free from restrictions. Instant, affordable access to the latest AI image generation models.',
        creator: '@theGoldenBoyle',
        images: ['/og-image-2.png']
    },
    robots: {
        index: true,
        follow: true
    },
    icons: {
        icon: [
            { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        ],
        shortcut: '/icons/favicon.ico',
        apple: [
            { url: '/icons/icon-180x180.png', sizes: '180x180', type: 'image/png' },
        ],
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${lexend.variable} ${dmSans.variable}`}>
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="BildOro" />
            </head>
            <body>
                <ThemeProvider>
                    <AuthProvider>
                        <I18nProvider>
                            <Navbar />
                            {children}
                            <PWARegistration />
                            <PWAInstallPrompt />
                        </I18nProvider>
                    </AuthProvider>
                </ThemeProvider>
                <Analytics />
            </body>
        </html>
    )
}