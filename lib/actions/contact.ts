"use server"

import nodemailer from "nodemailer"

interface ContactFormData {
	name: string
	email: string
	subject: string
	message: string
}

export async function sendContactEmail(data: ContactFormData) {
	try {
		const { name, email, subject, message } = data

		// Create transporter using Gmail SMTP
		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: process.env.GMAIL_USER,
				pass: process.env.GMAIL_APP_PASSWORD,
			},
		})

		// Send email
		await transporter.sendMail({
			from: `"BildOro Contact Form" <${process.env.GMAIL_USER}>`,
			to: process.env.GMAIL_USER, // Sends to yourself
			replyTo: email, // When you hit reply, it goes to the person who filled the form
			subject: `Contact Form: ${subject}`,
			html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
                        New Contact Form Submission
                    </h2>
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 10px 0;">
                            <strong style="color: #555;">Name:</strong> 
                            <span style="color: #333;">${name}</span>
                        </p>
                        <p style="margin: 10px 0;">
                            <strong style="color: #555;">Email:</strong> 
                            <a href="mailto:${email}" style="color: #4CAF50; text-decoration: none;">${email}</a>
                        </p>
                        <p style="margin: 10px 0;">
                            <strong style="color: #555;">Subject:</strong> 
                            <span style="color: #333;">${subject}</span>
                        </p>
                    </div>
                    <div style="background-color: #fff; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                        <p style="margin: 0 0 10px 0;">
                            <strong style="color: #555;">Message:</strong>
                        </p>
                        <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                    </div>
                    <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                        This email was sent from the BildOro contact form at bildoro.app
                    </p>
                </div>
            `,
			text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This email was sent from the BildOro contact form.
Reply to this email to respond directly to ${name}.
            `.trim(),
		})

		return { success: true }
	} catch (error) {
		console.error("Email sending failed:", error)
		throw error
	}
}
