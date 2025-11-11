import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase-server"
import { notifyNewSignup, sendWelcomeEmail } from "@/lib/email-service"
import { canAcceptNewSignups } from "@/lib/revenue-tracker"
import { TOKEN_CONFIG } from "@/lib/config/tokens"

function validateUsername(username: string): string | null {
    if (!username || username.length < 3) {
        return "Username must be at least 3 characters long"
    }
    if (username.length > 30) {
        return "Username must be less than 30 characters"
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return "Username can only contain letters, numbers, underscores, and hyphens"
    }
    return null
}

export async function POST(request: NextRequest) {
    try {
        const { email, username, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password required" },
                { status: 400 }
            )
        }

        if (!username) {
            return NextResponse.json(
                { error: "Username required" },
                { status: 400 }
            )
        }

        const usernameError = validateUsername(username)
        if (usernameError) {
            return NextResponse.json(
                { error: usernameError },
                { status: 400 }
            )
        }

        const existingUsername = await prisma.user.findUnique({
            where: { username }
        })

        if (existingUsername) {
            return NextResponse.json(
                { error: "Username is already taken" },
                { status: 400 }
            )
        }

        const canSignup = await canAcceptNewSignups()
        
        if (!canSignup) {
            return NextResponse.json(
                { error: "WAITLIST_ONLY", message: "We've reached capacity. Join the waitlist!" },
                { status: 403 }
            )
        }

        const supabase = await createClient()

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/dashboard/playground`,
                data: {
                    username: username
                }
            }
        })

        if (error) {
            console.error("Supabase signup error:", error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        if (data.user) {
            await prisma.user.upsert({
                where: { id: data.user.id },
                update: {},
                create: {
                    id: data.user.id,
                    email: data.user.email!,
                    username: username,
                    subscriptionStatus: "free",
                    tokens: TOKEN_CONFIG.FREE_TOKENS,
                    tokenType: "free"
                }
            })

            notifyNewSignup({
                email: data.user.email!,
                userId: data.user.id,
                signupDate: new Date()
            }).catch(err => console.error('Failed to send signup notification:', err.message))

            sendWelcomeEmail(data.user.email!, username)
                .catch(err => console.error('Failed to send welcome email:', err.message))
        }

        return NextResponse.json({ 
            user: data.user,
            message: "Signup successful"
        })
    } catch (error) {
        console.error("Signup error:", error)
        return NextResponse.json(
            { error: "Internal server error", details: String(error) },
            { status: 500 }
        )
    }
}