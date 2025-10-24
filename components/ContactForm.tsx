'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/lib/i18n/context'
import { sendContactEmail } from '@/lib/actions/contact'

export function ContactForm() {
    const { t } = useI18n()
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    })
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormState(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('sending')

        try {
            await sendContactEmail(formState)
            setStatus('success')
            // Reset form
            setFormState({
                name: '',
                email: '',
                subject: '',
                message: ''
            })
        } catch (error) {
            console.error('Error sending email:', error)
            setStatus('error')
        }
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-surface rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-center">
                {t.contact.title}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="name"
                        className="block text-sm font-medium text-muted mb-2"
                    >
                        {t.contact.name}
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-muted mb-2"
                    >
                        {t.contact.email}
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div>
                    <label
                        htmlFor="subject"
                        className="block text-sm font-medium text-muted mb-2"
                    >
                        {t.contact.subject}
                    </label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formState.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div>
                    <label
                        htmlFor="message"
                        className="block text-sm font-medium text-muted mb-2"
                    >
                        {t.contact.message}
                    </label>
                    <textarea
                        id="message"
                        name="message"
                        value={formState.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div className="text-center">
                    <Button
                        // type="submit"
                        onClick={() => {
                            alert("Woah slow down! 🚀\n\nRelease date is NOV 30.\n\nContact @theGoldenBoyle on X.");
                        }}
                        disabled={status === 'sending'}
                        className="w-full"
                    >
                        {status === 'sending' ? t.common.loading : t.contact.submit}
                    </Button>
                </div>
                {status === 'success' && (
                    <p className="text-green-600 text-center mt-4">
                        {t.contact.successMessage}
                    </p>
                )}
                {status === 'error' && (
                    <p className="text-red-600 text-center mt-4">
                        {t.contact.errorMessage}
                    </p>
                )}
            </form>
        </div>
    )
}