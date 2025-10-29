'use client'

import { ContactForm } from '@/components/ContactForm'
import { Footer } from '@/components/partials/Footer'
import { useI18n } from '@/lib/i18n/context'

export default function ContactPage() {
    const { t } = useI18n()

    return (
        <>
           <div className="flex items-center justify-center min-h-screen md:p-4 py-10 lg:py-32">
                <main className="flex-grow container mx-auto px-4 py-10 lg:py-32">
                    <ContactForm />
                </main>
        
            </div>
            <Footer />
        </>
    )
}