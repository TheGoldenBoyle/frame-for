'use client'

import { ContactForm } from '@/components/ContactForm'
import { Footer } from '@/components/partials/Footer'
import { useI18n } from '@/lib/i18n/context'

export default function ContactPage() {
    const { t } = useI18n()

    return (
        <>
            <div className="min-h-[95vh] grid place-items-center">
                <main className="flex-grow container mx-auto px-4 py-16">
                    <ContactForm />
                </main>
        
            </div>
            <Footer />
        </>
    )
}