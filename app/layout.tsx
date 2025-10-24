import type { Metadata } from 'next'
import { I18nProvider } from '@/lib/i18n/context'
import './styles/globals.css'
import { Navbar } from '@/components/partials/Navbar'
import { AuthProvider } from '@/lib/auth/provider'
import { ThemeProvider } from '@/lib/theme/provider'

export const metadata: Metadata = {
    metadataBase: new URL('https://bildoro.app'),
    title: {
        default: 'BildOro - Unlimited AI Image Generation',
        template: '%s | BildOro'
    },
    description: 'Unleash your creativity with BildOro. Access top-tier AI image generation models without limits. Generate, explore, and create at unprecedented speed and affordability.',
    keywords: [
        'AI image generation',
        'image creation',
        'AI models',
        'creative tools',
        'image playground',
        'affordable AI'
    ],
    openGraph: {
        title: 'BildOro - Unlimited AI Image Generation',
        description: 'Unleash your creativity with BildOro. Access top-tier AI image generation models without limits.',
        type: 'website',
        url: 'https://bildoro.app',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'BildOro - Your Unlimited AI Image Generation Playground'
            }
        ]
    },
    twitter: {
        card: 'summary_large_image',
        title: 'BildOro - Unlimited AI Image Generation',
        description: 'Unleash your creativity with BildOro. Access top-tier AI image generation models without limits.',
        images: ['/og-image.png']
    }
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
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