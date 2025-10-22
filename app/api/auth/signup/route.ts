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
			options: {
				emailRedirectTo: `${process.env.NEXT_PUBLIC_URL}/dashboard`
			}
		})

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

		if (data.user) {
			const existingUser = await prisma.user.findUnique({
				where: { id: data.user.id }
			})

			if (!existingUser) {
				await prisma.user.create({
					data: {
						id: data.user.id,
						email: data.user.email!,
						subscriptionStatus: "free",
						tokens: TOKEN_CONFIG.FREE_TOKENS,
						tokenType: "free"
					},
				})
			}
		}

		if (data.session) {
			return NextResponse.json({ user: data.user })
		} else {
			return NextResponse.json({ 
				user: data.user,
				message: "Check your email to confirm your account"
			})
		}
	} catch (error) {
		console.error("Signup error", error)
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		)
	}
}