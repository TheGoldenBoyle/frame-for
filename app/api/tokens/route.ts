import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/superbase-server"
import { getTokenBalance } from "@/lib/tokens"

export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient()

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser()

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const balance = await getTokenBalance(user.id)

		if (!balance) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			)
		}

		return NextResponse.json({
			tokens: balance.tokens,
			tokenType: balance.tokenType,
			subscriptionStatus: balance.subscriptionStatus,
		})
	} catch (error) {
		console.error("Token balance error:", error)
		return NextResponse.json(
			{ error: "Failed to get token balance" },
			{ status: 500 }
		)
	}
}