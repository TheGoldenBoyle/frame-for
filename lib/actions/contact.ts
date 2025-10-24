'use server'

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactFormData {
    name: string
    email: string
    subject: string
    message: string
}

export async function sendContactEmail(data: ContactFormData) {
    try {
        const { name, email, subject, message } = data
        
        const result = await resend.emails.send({
            from: 'BildOro Contact <contact@bildoro.com>',
            to: 'thegoldenboyle@gmail.com',
            subject: `New Contact Form Submission: ${subject}`,
            html: `
                <h1>New Contact Form Submission</h1>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        })

        if (result.error) {
            console.error('Resend Error:', result.error)
            throw new Error('Failed to send email')
        }

        return { success: true }
    } catch (error) {
        console.error('Email sending failed:', error)
        throw error
    }
}