'use client'

import { Navbar } from '@/components/partials/Navbar'
import { useI18n } from '@/lib/i18n/context'
import { Footer } from '@/components/partials/Footer'

export default function Imprint() {
    const { t } = useI18n()

    return (
        <>
            <div className="min-h-screen flex flex-col relative">
                <Navbar />
                <main className="flex-grow flex items-center justify-center px-8 relative z-10">
                    <div className="max-w-2xl bg-surface border border-border p-8 rounded-lg shadow-md">
                        <h1 className="text-4xl font-bold mb-6">{t.imprint.title}</h1>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">{t.imprint.contact}</h2>
                            <p>{t.imprint.companyName}</p>
                            <p>{t.imprint.streetAddress}</p>
                            <p>{t.imprint.cityPostal}</p>
                            <p>{t.imprint.country}</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">{t.imprint.contact_details}</h2>
                            <p>{t.imprint.phone}</p>
                            <p>{t.imprint.email}</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">{t.imprint.legal_representation}</h2>
                            <p>{t.imprint.ceo}</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">{t.imprint.social_media}</h2>
                            <p>{t.imprint.x_account}</p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">{t.imprint.disclaimer}</h2>
                            <p>{t.imprint.disclaimer_text}</p>
                        </section>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    )
}