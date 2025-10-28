import { createClient } from "@/lib/superbase-server"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") ?? "/dashboard/playground"

    if (code) {
        const supabase = await createClient()
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error && data.user) {
            try {
                // Check if user exists in database
                const existingUser = await prisma.user.findUnique({
                    where: { id: data.user.id }
                })

                // If user doesn't exist, create them (OAuth signup)
                if (!existingUser) {
                    console.log('Creating new OAuth user in database:', data.user.email)

                    await prisma.user.create({
                        data: {
                            id: data.user.id,
                            email: data.user.email!,
                            username: null, // OAuth users don't have username yet
                            subscriptionStatus: "free",
                            tokens: 3,
                            tokenType: "free"
                        }
                    })
                    
                    console.log('OAuth user created successfully')
                }

                return NextResponse.redirect(`${origin}${next}`)
            } catch (dbError) {
                console.error("Database error during OAuth callback:", dbError)
                return NextResponse.redirect(`${origin}/auth/error?reason=database`)
            }
        }
    }

    return NextResponse.redirect(`${origin}/auth/error`)
}