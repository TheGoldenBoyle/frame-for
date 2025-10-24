import type { Metadata } from 'next'
import { I18nProvider } from '@/lib/i18n/context'
import './styles/globals.css'
import { Navbar } from '@/components/partials/Navbar'
import { AuthProvider } from '@/lib/auth/provider'
import { ThemeProvider } from '@/lib/theme/provider'
import { Lexend, DM_Sans } from 'next/font/google'

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
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" className={`${lexend.variable} ${dmSans.variable}`}>
            <body>
                <ThemeProvider>
                    <AuthProvider>
                        <I18nProvider>
                            <Navbar />
                            {children}
                        </I18nProvider>
                    </AuthProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}