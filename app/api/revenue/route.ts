import { NextRequest, NextResponse } from "next/server"
import { getCurrentRevenue, canAcceptNewSignups } from "@/lib/revenue-tracker"
import { createClient } from "@/lib/superbase-server"

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            )
        }

        const stats = await getCurrentRevenue()
        const canSignup = await canAcceptNewSignups()

        return NextResponse.json({
            ...stats,
            canSignup
        })
    } catch (error) {
        console.error("Revenue stats error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}