import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase-server"
import { prisma } from "@/lib/prisma"

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

		const dbUser = await prisma.user.upsert({
			where: { id: user.id },
			update: {},
			create: {
				id: user.id,
				email: user.email!,
				subscriptionStatus: "free",
				tokens: 3,
				tokenType: "free",
			},
		})

		return NextResponse.json({
			user: dbUser,
			message: "User synchronized",
		})
	} catch (error) {
		console.error("User sync error:", error)
		return NextResponse.json(
			{ error: "Internal server error", details: String(error) },
			{ status: 500 }
		)
	}
}
