"use server"

import { notifyContactForm } from "@/lib/email-service"

interface ContactFormData {
	name: string
	email: string
	subject: string
	message: string
}

export async function sendContactEmail(data: ContactFormData) {
	try {
		const { name, email, subject, message } = data

		await notifyContactForm({
			name,
			email,
			subject,
			message,
		})

		return { success: true }
	} catch (error) {
		console.error("Email sending failed:", error)
		throw error
	}
}
