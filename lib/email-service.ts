import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
})

async function sendEmail({
    subject,
    html,
    text,
}: {
    subject: string
    html: string
    text: string
}) {
    try {
        await transporter.sendMail({
            from: `"BildOro Notifications" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            subject,
            html,
            text,
        })
        console.log(`Email sent: ${subject}`)
    } catch (error) {
        console.error('Failed to send email:', error)
        // Don't throw - don't want email failures to break the app
    }
}

export async function notifyNewSignup(userData: {
    email: string
    userId: string
    signupDate: Date
}) {
    const { email, userId, signupDate } = userData

    await sendEmail({
        subject: '🎉 New User Signup - BildOro',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
                    🎉 New User Signup
                </h2>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 10px 0;">
                        <strong style="color: #555;">Email:</strong> 
                        <span style="color: #333;">${email}</span>
                    </p>
                    <p style="margin: 10px 0;">
                        <strong style="color: #555;">User ID:</strong> 
                        <span style="color: #333; font-family: monospace;">${userId}</span>
                    </p>
                    <p style="margin: 10px 0;">
                        <strong style="color: #555;">Signup Date:</strong> 
                        <span style="color: #333;">${signupDate.toLocaleString()}</span>
                    </p>
                    <p style="margin: 10px 0;">
                        <strong style="color: #555;">Account Type:</strong> 
                        <span style="color: #333;">Free Trial (3 tokens)</span>
                    </p>
                </div>
                <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                    This is an automated notification from BildOro
                </p>
            </div>
        `,
        text: `
🎉 New User Signup

Email: ${email}
User ID: ${userId}
Signup Date: ${signupDate.toLocaleString()}
Account Type: Free Trial (3 tokens)

---
This is an automated notification from BildOro
        `.trim(),
    })
}

// Notification: New Purchase
export async function notifyNewPurchase(purchaseData: {
    email: string
    userId: string
    purchaseType: 'subscription' | 'onetime'
    amount: number
    currency: string
    purchaseDate: Date
    stripeCustomerId?: string
}) {
    const {
        email,
        userId,
        purchaseType,
        amount,
        currency,
        purchaseDate,
        stripeCustomerId,
    } = purchaseData

    const purchaseTypeLabel =
        purchaseType === 'subscription' ? '💳 Subscription' : '🎫 One-Time Purchase'

    await sendEmail({
        subject: `💰 New Purchase: ${purchaseType === 'subscription' ? 'Subscription' : 'One-Time'} - BildOro`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">
                    💰 New Purchase
                </h2>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 10px 0;">
                        <strong style="color: #555;">Customer Email:</strong> 
                        <span style="color: #333;">${email}</span>
                    </p>
                    <p style="margin: 10px 0;">
                        <strong style="color: #555;">User ID:</strong> 
                        <span style="color: #333; font-family: monospace;">${userId}</span>
                    </p>
                    <p style="margin: 10px 0;">
                        <strong style="color: #555;">Purchase Type:</strong> 
                        <span style="color: #333;">${purchaseTypeLabel}</span>
                    </p>
                    <p style="margin: 10px 0;">
                        <strong style="color: #555;">Amount:</strong> 
                        <span style="color: #333; font-size: 18px; font-weight: bold;">
                            ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}
                        </span>
                    </p>
                    <p style="margin: 10px 0;">
                        <strong style="color: #555;">Purchase Date:</strong> 
                        <span style="color: #333;">${purchaseDate.toLocaleString()}</span>
                    </p>
                    ${
                        stripeCustomerId
                            ? `
                    <p style="margin: 10px 0;">
                        <strong style="color: #555;">Stripe Customer ID:</strong> 
                        <span style="color: #333; font-family: monospace;">${stripeCustomerId}</span>
                    </p>
                    `
                            : ''
                    }
                </div>
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #FFD700; margin: 20px 0;">
                    <p style="margin: 0; color: #856404;">
                        <strong>💡 Action Required:</strong> Check Stripe dashboard for payment details
                    </p>
                </div>
                <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                    This is an automated notification from BildOro
                </p>
            </div>
        `,
        text: `
💰 New Purchase

Customer Email: ${email}
User ID: ${userId}
Purchase Type: ${purchaseTypeLabel}
Amount: ${(amount / 100).toFixed(2)} ${currency.toUpperCase()}
Purchase Date: ${purchaseDate.toLocaleString()}
${stripeCustomerId ? `Stripe Customer ID: ${stripeCustomerId}` : ''}

💡 Action Required: Check Stripe dashboard for payment details

---
This is an automated notification from BildOro
        `.trim(),
    })
}

export async function notifyContactForm(formData: {
    name: string
    email: string
    subject: string
    message: string
}) {
    const { name, email, subject, message } = formData

    await sendEmail({
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
}