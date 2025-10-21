import type { Metadata } from 'next'
import { I18nProvider } from '@/lib/i18n/context'
import './globals.css'

import { AuthProvider } from '@/lib/auth/provider'
import { ThemeProvider } from '@/lib/theme/provider'

export const metadata: Metadata = {
  title: 'TheGoldenGenerator - Beautiful Photo Memories',
  description: 'Combine photos of loved ones into one beautiful image. Access the latest AI image generation models in one playground.',
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
            <I18nProvider>{children}</I18nProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}