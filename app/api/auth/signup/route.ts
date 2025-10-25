import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase-server"
import { notifyNewSignup } from "@/lib/email-service"

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password required" },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/dashboard/playground`
            }
        })

        if (error) {
            console.error("Supabase signup error:", error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        if (data.user) {
            // Upsert user in Prisma
            await prisma.user.upsert({
                where: { id: data.user.id },
                update: {},
                create: {
                    id: data.user.id,
                    email: data.user.email!,
                    subscriptionStatus: "free",
                    tokens: 3,
                    tokenType: "free"
                }
            })

            notifyNewSignup({
                email: data.user.email!,
                userId: data.user.id,
                signupDate: new Date()
            }).catch(err => console.error('Failed to send signup notification:', err))
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