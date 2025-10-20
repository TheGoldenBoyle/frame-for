import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"
import { TOKEN_CONFIG } from "@/lib/config/tokens"

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
		})

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		if (data.user) {
			await prisma.user.create({
				data: {
					id: data.user.id,
					email: data.user.email!,
					subscriptionStatus: "free",
					tokens: TOKEN_CONFIG.FREE_TOKENS,
					tokenType: "free",
				},
			})
		}

		return NextResponse.json({ user: data.user })
	} catch (error) {
		console.error("Signup error", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}
