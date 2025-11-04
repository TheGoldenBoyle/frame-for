import { sendWelcomeEmail } from "../lib/email-service.js"

async function testWelcomeEmail() {
    const testEmail = "thegoldenboyle@gmail.com" // Change this to your email
    const testUsername = "Golden" // Change this to test with different usernames

    console.log(`Sending test welcome email to ${testEmail}...`)
    
    try {
        await sendWelcomeEmail(testEmail, testUsername)
        console.log("✅ Test email sent successfully!")
        console.log(`Check your inbox at ${testEmail}`)
    } catch (error) {
        console.error("❌ Failed to send test email:", error)
    }
}

testWelcomeEmail()