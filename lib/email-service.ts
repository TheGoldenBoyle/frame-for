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

// ✅ NEW: Model Request Email Notification
export async function notifyModelRequest({
    email,
    modelName,
}: {
    email: string
    modelName: string
}) {
    await sendEmail({
        subject: `✨ New Model Request - ${modelName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
                    ✨ New Model Request
                </h2>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 10px 0;">
                        <strong style="color: #555;">User Email:</strong> 
                        <span style="color: #333;">${email}</span>
                    </p>
                    <p style="margin: 10px 0;">
                        <strong style="color: #555;">Requested Model:</strong> 
                        <span style="color: #333;">${modelName}</span>
                    </p>
                </div>
                <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                    This is an automated notification from BildOro
                </p>
            </div>
        `,
        text: `
✨ New Model Request

User Email: ${email}
Requested Model: ${modelName}

---
This is an automated notification from BildOro
        `.trim(),
    })
}

// ✅ Send welcome email to new users
export async function sendWelcomeEmail(userEmail: string, username: string) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    })

    try {
        await transporter.sendMail({
            from: `"BildOro" <${process.env.GMAIL_USER}>`,
            to: userEmail,
            subject: 'Welcome to Bildoro – Let\'s Bild This Together',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #333; margin-bottom: 20px;">Hey ${username}!</h2>
                    
                    <p style="color: #333; line-height: 1.6; margin-bottom: 15px;">
                        Thanks for signing up for Bildoro – genuinely excited to have you here.
                    </p>
                    
                    <p style="color: #333; line-height: 1.6; margin-bottom: 15px;">
                        Here's the deal: <strong>I'm iterating fast, and your feedback directly shapes what gets built next.</strong> 
                        This isn't a "we'll consider your suggestion" situation – tell me what you need, and I'll build it.
                    </p>
                    
                    <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 25px 0;">
                        <h3 style="color: #333; margin-top: 0;">What I need from you:</h3>
                        <ul style="color: #333; line-height: 1.8;">
                            <li>Try it out and tell me what works (and what doesn't)</li>
                            <li>Request features, add-ons, tweaks – whatever would make this more useful for you</li>
                            <li>Spot a bug? Report it and I'll hook you up with some tokens as a thank you</li>
                        </ul>
                    </div>
                    
                    <p style="color: #333; line-height: 1.6; margin-bottom: 15px;">
                        We're in the early days of this fight, and I'm building Bildoro for people who actually use it. 
                        Your input isn't just welcome – it's essential.
                    </p>
                    
                    <p style="color: #333; line-height: 1.6; margin-bottom: 15px;">
                        Hit me up anytime at <a href="mailto:thegoldenboyle@gmail.com" style="color: #D4AF37;">thegoldenboyle@gmail.com</a> 
                        or on X <a href="https://x.com/thegoldenboyle" style="color: #D4AF37;">@thegoldenboyle</a>
                    </p>
                    
                    <p style="color: #333; line-height: 1.6; margin-bottom: 5px;">
                        Let's go,<br>
                        Golden
                    </p>
                    
                    <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #D4AF37; margin: 25px 0;">
                        <p style="margin: 0; color: #856404;">
                            <strong>P.S.</strong> – There are regular updates dropping, so keep an eye out. 
                            What you see today won't be what you see next week.
                        </p>
                    </div>
                </div>
            `,
            text: `
Hey ${username}!

Thanks for signing up for Bildoro – genuinely excited to have you here.

Here's the deal: I'm iterating fast, and your feedback directly shapes what gets built next. This isn't a "we'll consider your suggestion" situation – tell me what you need, and I'll build it.

What I need from you:
• Try it out and tell me what works (and what doesn't)
• Request features, add-ons, tweaks – whatever would make this more useful for you
• Spot a bug? Report it and I'll hook you up with some tokens as a thank you

We're in the early days of this fight, and I'm building Bildoro for people who actually use it. Your input isn't just welcome – it's essential.

Hit me up anytime at thegoldenboyle@gmail.com or on X @thegoldenboyle

Let's go,
Golden

P.S. – There are regular updates dropping, so keep an eye out. What you see today won't be what you see next week.
            `.trim(),
        })
        console.log(`Welcome email sent to: ${userEmail}`)
    } catch (error) {
        console.error('Failed to send welcome email:', error)
        // Don't throw - don't want email failures to break the signup flow
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

export async function notifyWaitlistSignup({
    email,
    createdAt
}: {
    email: string
    createdAt: Date
}) {
    await sendEmail({
        subject: '🎯 New Waitlist Signup - BildOro',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333; border-bottom: 2px solid #D4AF37; padding-bottom: 10px;">
                    🎯 New Waitlist Signup
                </h2>
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <p style="margin: 10px 0;">
                        <strong style="color: #555;">Email:</strong> 
                        <span style="color: #333;">${email}</span>
                    </p>
                    <p style="margin: 10px 0;">
                        <strong style="color: #555;">Joined:</strong> 
                        <span style="color: #333;">${createdAt.toLocaleString('de-DE')}</span>
                    </p>
                </div>
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #D4AF37; margin: 20px 0;">
                    <p style="margin: 0; color: #856404;">
                        <strong>💡 Action:</strong> Check your admin dashboard to review and approve when capacity opens up.
                    </p>
                </div>
                <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
                    This is an automated notification from BildOro
                </p>
            </div>
        `,
        text: `
🎯 New Waitlist Signup

Email: ${email}
Joined: ${createdAt.toLocaleString('de-DE')}

💡 Action: Check your admin dashboard to review and approve when capacity opens up.

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