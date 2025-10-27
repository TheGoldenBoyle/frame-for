import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { notifyWaitlistSignup } from "@/lib/email-service"

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: "Email required" },
                { status: 400 }
            )
        }

        const existingWaitlist = await prisma.waitlist.findUnique({
            where: { email }
        })

        if (existingWaitlist) {
            return NextResponse.json(
                { error: "Email already on waitlist" },
                { status: 400 }
            )
        }

        const waitlistEntry = await prisma.waitlist.create({
            data: { email }
        })

        notifyWaitlistSignup({
            email,
            createdAt: waitlistEntry.createdAt
        }).catch(err => console.error('Failed to send waitlist notification:', err))

        return NextResponse.json({ 
            message: "Added to waitlist successfully",
            position: await prisma.waitlist.count()
        })
    } catch (error) {
        console.error("Waitlist signup error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}