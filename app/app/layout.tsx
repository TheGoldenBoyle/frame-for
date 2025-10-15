import { I18nProvider } from '@/lib/i18n/context'
import './globals.css'

import { AuthProvider } from '@/lib/auth/provider'

export const metadata = {
  title: 'FrameFor - Beautiful Photo Memories',
  description: 'Combine photos of loved ones into one beautiful image',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <I18nProvider>{children}</I18nProvider>
        </AuthProvider>
      </body>
    </html>
  )
}