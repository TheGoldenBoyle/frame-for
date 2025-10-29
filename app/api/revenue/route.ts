import { NextRequest, NextResponse } from "next/server"
import { getCurrentRevenue, canAcceptNewSignups } from "@/lib/revenue-tracker"

export async function GET(request: NextRequest) {
    try {
        const stats = await getCurrentRevenue()
        const canSignup = await canAcceptNewSignups()

        return NextResponse.json({
            ...stats,
            canSignup
        })
    } catch (error) {
        console.error("Revenue stats error:", error)
        return NextResponse.json(
            { 
                error: "Internal server error",
                // Return safe defaults on error
                canSignup: true,
                totalRevenue: 0,
                subscriptionRevenue: 0,
                onetimeRevenue: 0,
                activeSubscribers: 0,
                onetimePurchases: 0,
                remainingCapacity: 410,
                isAtCapacity: false,
                percentageUsed: 0
            },
            { status: 500 }
        )
    }
}