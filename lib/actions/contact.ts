'use server'

import nodemailer from 'nodemailer'

interface ContactFormData {
    name: string
    email: string
    subject: string
    message: string
}

export async function sendContactEmail(data: ContactFormData) {
    try {
        const { name, email, subject, message } = data
        
        const transporter = nodemailer.createTransport({
            host: 'smtp-pulse.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.SENDPULSE_SMTP_USER,
                pass: process.env.SENDPULSE_SMTP_PASSWORD,
            },
        })

        await transporter.sendMail({
            from: `"BildOro Contact" <${process.env.CONTACT_FORM_FROM_EMAIL}>`,
            to: process.env.CONTACT_FORM_TO_EMAIL,
            subject: `New Contact Form Submission: ${subject}`,
            html: `
                <h1>New Contact Form Submission</h1>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
        })

        return { success: true }
    } catch (error) {
        console.error('Email sending failed:', error)
        throw error
    }
}