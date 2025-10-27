import { createClient } from "@/lib/superbase-server"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

async function generateUniqueUsername(email: string): Promise<string> {
    // Extract username from email
    const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '')
    
    let username = baseUsername
    let counter = 1
    
    // Keep trying until we find a unique username
    while (true) {
        const existing = await prisma.user.findUnique({
            where: { username }
        })
        
        if (!existing) {
            return username
        }
        
        username = `${baseUsername}${counter}`
        counter++
    }
}

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/dashboard/playground"

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error && data.user) {
            // Check if user exists in database
            const existingUser = await prisma.user.findUnique({
                where: { id: data.user.id }
            })

            // If user doesn't exist, create them (OAuth signup)
            if (!existingUser) {
                try {
                    // Get username from user metadata or generate one
                    let username = data.user.user_metadata?.username
                    
                    if (!username && data.user.email) {
                        username = await generateUniqueUsername(data.user.email)
                    }

                    await prisma.user.create({
                        data: {
                            id: data.user.id,
                            email: data.user.email!,
                            username: username,
                            subscriptionStatus: "free",
                            tokens: 3,
                            tokenType: "free"
                        }
                    })
                } catch (dbError) {
                    console.error("Failed to create user in database:", dbError)
                    // Continue anyway - user is authenticated in Supabase
                }
            }

            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    return NextResponse.redirect(`${origin}/auth/error`)
}