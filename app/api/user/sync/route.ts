import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase-server"
import { prisma } from "@/lib/prisma"
// In route.ts
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Add more robust error handling
        if (!user.id || !user.email) {
            return NextResponse.json({ error: "Invalid user data" }, { status: 400 })
        }

        try {
            const dbUser = await prisma.user.upsert({
                where: { id: user.id },
                update: {
                    email: user.email, // Always update email in case it changes
                },
                create: {
                    id: user.id,
                    email: user.email!,
                    subscriptionStatus: "free",
                    tokens: 3,
                    tokenType: "free"
                },
            })

            return NextResponse.json({
                user: dbUser,
                message: "User synchronized",
            })
        } catch (dbError) {
            console.error("Database sync error:", dbError)
            return NextResponse.json(
                { 
                    error: "Database synchronization failed", 
                    details: String(dbError) 
                },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error("User sync error:", error)
        return NextResponse.json(
            { error: "Internal server error", details: String(error) },
            { status: 500 }
        )
    }
}