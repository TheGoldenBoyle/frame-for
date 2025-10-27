import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase-server"

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: "Email required" },
                { status: 400 }
            )
        }

        await prisma.waitlist.update({
            where: { email },
            data: {
                approved: true,
                approvedAt: new Date()
            }
        })

        return NextResponse.json({ 
            message: "Waitlist user approved" 
        })
    } catch (error) {
        console.error("Waitlist approval error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}