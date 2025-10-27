'use client'

import { Navbar } from '@/components/partials/Navbar'
import { useI18n } from '@/lib/i18n/context'
import { Footer } from '@/components/partials/Footer'

export default function Terms() {
    const { t } = useI18n()

    return (
        <>
            <div className="min-h-screen flex flex-col relative">
                <Navbar />
                <main className="flex-grow flex items-center justify-center px-8 py-16 relative z-10">
                    <div className="max-w-2xl bg-surface border border-border p-8 rounded-lg shadow-md">
                        <h1 className="text-4xl font-bold mb-6">AGB / Terms of Service</h1>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">1. Anbieter / Provider</h2>
                            <p>James Patrick Boyle</p>
                            <p>Goldrain 5</p>
                            <p>36088 Hünfeld, Deutschland</p>
                            <p className="mt-2">thegoldenboyle@gmail.com</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">2. Leistungsumfang / Services</h2>
                            <p className="text-muted mb-2">
                                BildOro bietet Zugang zu KI-gestützten Bildgenerierungsmodellen.
                            </p>
                            <p className="text-muted">
                                BildOro provides access to AI-powered image generation models.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">3. Nutzungsbedingungen / Usage Terms</h2>
                            <ul className="list-disc list-inside space-y-2 text-muted">
                                <li>Mindestalter 18 Jahre / Minimum age 18 years</li>
                                <li>Ein Konto pro Person / One account per person</li>
                                <li>Keine illegalen Inhalte / No illegal content</li>
                                <li>Keine Weitergabe von Zugangsdaten / No sharing of credentials</li>
                                <li>Keine automatisierte Nutzung / No automated usage</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">4. Verbotene Inhalte / Prohibited Content</h2>
                            <p className="text-muted mb-2">Verboten ist die Generierung von / Prohibited:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted">
                                <li>Illegalen Inhalten / Illegal content</li>
                                <li>Gewaltdarstellungen / Violent content</li>
                                <li>Hassrede / Hate speech</li>
                                <li>Urheberrechtsverletzungen / Copyright violations</li>
                                <li>Kinderpornografie / Child abuse material</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">5. Preise & Zahlung / Pricing & Payment</h2>
                            <p className="text-muted mb-2">
                                Preise werden auf der Website angezeigt. Zahlung via Stripe.
                            </p>
                            <p className="text-muted">
                                Prices are displayed on the website. Payment via Stripe.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">6. Widerrufsrecht / Right of Withdrawal</h2>
                            <p className="text-muted mb-2">
                                14 Tage Widerrufsrecht gemäß § 355 BGB. Bei digitalen Inhalten erlischt das Widerrufsrecht nach Beginn der Leistungserbringung.
                            </p>
                            <p className="text-muted">
                                14-day withdrawal right according to § 355 BGB. For digital content, withdrawal right expires after service begins.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">7. Haftung / Liability</h2>
                            <p className="text-muted mb-2">
                                Haftung nur bei Vorsatz und grober Fahrlässigkeit.
                            </p>
                            <p className="text-muted">
                                Liability only for intent and gross negligence.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">8. Urheberrechte / Copyright</h2>
                            <p className="text-muted mb-2">
                                Generierte Bilder gehören dem Nutzer. BildOro behält sich das Recht vor, Bilder für Modellverbesserungen zu verwenden.
                            </p>
                            <p className="text-muted">
                                Generated images belong to the user. BildOro reserves the right to use images for model improvements.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">9. Kündigung / Termination</h2>
                            <p className="text-muted mb-2">
                                Beide Parteien können jederzeit kündigen. Bei Verstoß gegen AGB kann sofort gekündigt werden.
                            </p>
                            <p className="text-muted">
                                Both parties can terminate at any time. Immediate termination for TOS violations.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">10. Streitbeilegung / Dispute Resolution</h2>
                            <p className="text-muted mb-2">
                                Online-Streitbeilegung: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://ec.europa.eu/consumers/odr</a>
                            </p>
                            <p className="text-muted">
                                Wir nehmen nicht an Streitbeilegungsverfahren vor Verbraucherschlichtungsstellen teil.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">11. Anwendbares Recht / Applicable Law</h2>
                            <p className="text-muted">
                                Es gilt deutsches Recht / German law applies
                            </p>
                        </section>

                        <p className="text-sm text-muted mt-8">
                            Stand / Last updated: {new Date().toLocaleDateString('de-DE')}
                        </p>
                    </div>
                </main>
            </div>
            <Footer />
        </>
    )
}