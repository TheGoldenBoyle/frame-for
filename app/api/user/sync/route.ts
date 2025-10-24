import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase-server"
import { prisma, safeDbOperation } from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        // Early return if no authenticated user
        if (authError || !user || !user.id) {
            return NextResponse.json({ 
                error: "Unauthorized", 
                details: "No valid user session" 
            }, { status: 401 })
        }

        // Validate user data before database operation
        if (!user.email) {
            return NextResponse.json({ 
                error: "Invalid user data", 
                details: "Missing email" 
            }, { status: 400 })
        }

        // Use safe database operation with explicit error handling
        try {
            const dbUser = await safeDbOperation(async () => {
                return await prisma.user.upsert({
                    where: { id: user.id },
                    update: {
                        email: user.email
                    },
                    create: {
                        id: user.id,
                        email: user.email!,
                        subscriptionStatus: "free",
                        tokens: 3,
                        tokenType: "free"
                    },
                })
            })

            return NextResponse.json({
                user: {
                    id: dbUser.id,
                    email: dbUser.email,
                    subscriptionStatus: dbUser.subscriptionStatus
                },
                message: "User synchronized successfully",
            }, { status: 200 })

        } catch (dbError) {
            console.error("Database sync error:", dbError)
            return NextResponse.json(
                {
                    error: "Database synchronization failed",
                    details: dbError instanceof Error 
                        ? dbError.message 
                        : "Unknown database error"
                },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error("User sync unexpected error:", error)
        return NextResponse.json(
            { 
                error: "Internal server error", 
                details: error instanceof Error 
                    ? error.message 
                    : "Unexpected sync failure" 
            },
            { status: 500 }
        )
    }
}