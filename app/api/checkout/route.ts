import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@/lib/superbase-server"
import { prisma } from "@/lib/prisma"
import { TOKEN_CONFIG } from "@/lib/config/tokens"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-09-30.clover",
})

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

		const { type } = await request.json()

		if (type !== "subscription" && type !== "onetime") {
			return NextResponse.json({ error: "Invalid type" }, { status: 400 })
		}

		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
		})

		if (!dbUser) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			)
		}

		let customerId = dbUser.stripeCustomerId

		if (!customerId) {
			const customer = await stripe.customers.create({
				email: user.email!,
				metadata: {
					userId: user.id,
				},
			})

			customerId = customer.id

			await prisma.user.update({
				where: { id: user.id },
				data: { stripeCustomerId: customerId },
			})
		}

		const priceId =
			type === "subscription"
				? TOKEN_CONFIG.STRIPE_PRICE_IDS.SUBSCRIPTION
				: TOKEN_CONFIG.STRIPE_PRICE_IDS.ONETIME

		const session = await stripe.checkout.sessions.create({
			customer: customerId,
			payment_method_types: ["card"],
			line_items: [
				{
					price: priceId,
					quantity: 1,
				},
			],
			mode: type === "subscription" ? "subscription" : "payment",
			success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
			cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?canceled=true`,
		})

		return NextResponse.json({ url: session.url })
	} catch (error) {
		console.error("Checkout error:", error)
		return NextResponse.json(
			{ error: "Failed to create checkout session" },
			{ status: 500 }
		)
	}
}
