'use client'

import { Navbar } from '@/components/partials/Navbar'
import { useI18n } from '@/lib/i18n/context'
import { Footer } from '@/components/partials/Footer'

export default function Privacy() {
    const { t } = useI18n()

    return (
        <>
            <div className="min-h-screen flex flex-col relative">
                <Navbar />
                <main className="flex-grow flex items-center justify-center px-8 py-16 relative z-10">
                    <div className="max-w-2xl bg-surface border border-border p-8 rounded-lg shadow-md">
                        <h1 className="text-4xl font-bold mb-6">Datenschutzerklärung / Privacy Policy</h1>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">1. Verantwortlicher / Data Controller</h2>
                            <p>James Patrick Boyle</p>
                            <p>Goldrain 5</p>
                            <p>36088 Hünfeld</p>
                            <p>Deutschland</p>
                            <p className="mt-2">Email: thegoldenboyle@gmail.com</p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">2. Datenerfassung / Data Collection</h2>
                            <p className="mb-2">Wir erfassen folgende Daten / We collect the following data:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted">
                                <li>Email-Adresse bei Registrierung / Email address during registration</li>
                                <li>Benutzername / Username</li>
                                <li>Nutzungsdaten (generierte Bilder) / Usage data (generated images)</li>
                                <li>Zahlungsinformationen (über Stripe) / Payment information (via Stripe)</li>
                            </ul>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">3. Zweck der Datenverarbeitung / Purpose</h2>
                            <p className="text-muted">
                                Ihre Daten werden verwendet für: Bereitstellung des Dienstes, Abrechnung, Kundensupport.
                            </p>
                            <p className="text-muted mt-2">
                                Your data is used for: Service provision, billing, customer support.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">4. Rechtsgrundlage / Legal Basis</h2>
                            <p className="text-muted">
                                DSGVO Art. 6 Abs. 1 lit. b (Vertragserfüllung) / GDPR Art. 6(1)(b) (contract performance)
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">5. Drittanbieter / Third Parties</h2>
                            <ul className="list-disc list-inside space-y-1 text-muted">
                                <li>Supabase (Authentication & Database) - USA</li>
                                <li>Stripe (Payment Processing) - USA</li>
                                <li>Google OAuth (Optional Login) - USA</li>
                                <li>X/Twitter OAuth (Optional Login) - USA</li>
                            </ul>
                            <p className="text-muted mt-2">
                                Alle Drittanbieter sind DSGVO-konform / All third parties are GDPR compliant.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
                            <p className="text-muted">
                                Wir verwenden essenzielle Cookies für Authentifizierung und Funktionalität.
                            </p>
                            <p className="text-muted mt-2">
                                We use essential cookies for authentication and functionality.
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">7. Ihre Rechte / Your Rights</h2>
                            <p className="mb-2">Sie haben das Recht auf / You have the right to:</p>
                            <ul className="list-disc list-inside space-y-1 text-muted">
                                <li>Auskunft / Access to your data</li>
                                <li>Berichtigung / Correction of your data</li>
                                <li>Löschung / Deletion of your data</li>
                                <li>Datenübertragbarkeit / Data portability</li>
                                <li>Widerspruch / Object to processing</li>
                            </ul>
                            <p className="text-muted mt-2">
                                Kontakt: thegoldenboyle@gmail.com
                            </p>
                        </section>

                        <section className="mb-6">
                            <h2 className="text-2xl font-semibold mb-4">8. Datenspeicherung / Data Retention</h2>
                            <p className="text-muted">
                                Daten werden gespeichert, solange Ihr Konto aktiv ist oder gesetzlich erforderlich.
                            </p>
                            <p className="text-muted mt-2">
                                Data is stored as long as your account is active or legally required.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-semibold mb-4">9. Kontakt / Contact</h2>
                            <p className="text-muted">
                                Bei Fragen zum Datenschutz / For privacy questions:
                            </p>
                            <p className="mt-2">thegoldenboyle@gmail.com</p>
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