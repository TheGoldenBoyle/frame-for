import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"
import { setTokens, addTokens } from "@/lib/tokens"
import { TOKEN_CONFIG } from "@/lib/config/tokens"
import { notifyNewPurchase } from "@/lib/email-service"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2025-09-30.clover",
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
	const body = await request.text()
	const headersList = await headers()
	const signature = headersList.get("stripe-signature")

	if (!signature) {
		return NextResponse.json({ error: "No signature" }, { status: 400 })
	}

	let event: Stripe.Event

	try {
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
	} catch (error) {
		console.error("Webhook signature verification failed:", error)
		return NextResponse.json(
			{ error: "Invalid signature" },
			{ status: 400 }
		)
	}

	try {
		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session

				if (session.mode === "subscription") {
					const subscriptionId = session.subscription as string
					const customerId = session.customer as string

					await prisma.user.update({
						where: { stripeCustomerId: customerId },
						data: {
							stripeSubscriptionId: subscriptionId,
							subscriptionStatus: "active",
						},
					})

					const user = await prisma.user.findUnique({
						where: { stripeCustomerId: customerId },
					})

					if (user) {
						await setTokens(
							user.id,
							TOKEN_CONFIG.SUBSCRIPTION_TOKENS,
							"subscription",
							"Subscription activated"
						)

						// Create purchase transaction for revenue tracking
						await prisma.tokenTransaction.create({
							data: {
								userId: user.id,
								amount: TOKEN_CONFIG.SUBSCRIPTION_TOKENS,
								type: 'purchase',
								reason: 'subscription-renewal'
							}
						})

						notifyNewPurchase({
							email: user.email,
							userId: user.id,
							purchaseType: "subscription",
							amount: session.amount_total || 0,
							currency: session.currency || "usd",
							purchaseDate: new Date(),
							stripeCustomerId: customerId,
						}).catch(err => console.error('Failed to send purchase notification:', err))
					}
				}

				if (session.mode === "payment") {
					const customerId = session.customer as string

					const user = await prisma.user.findUnique({
						where: { stripeCustomerId: customerId },
					})

					if (user) {
						await addTokens(
							user.id,
							TOKEN_CONFIG.ONETIME_TOKENS,
							"purchase",
							"One-time token purchase"
						)

						await prisma.user.update({
							where: { id: user.id },
							data: {
								tokenType: "onetime",
							},
						})

						// Create purchase transaction for revenue tracking
						await prisma.tokenTransaction.create({
							data: {
								userId: user.id,
								amount: TOKEN_CONFIG.ONETIME_TOKENS,
								type: 'purchase',
								reason: 'one-time-purchase'
							}
						})

						notifyNewPurchase({
							email: user.email,
							userId: user.id,
							purchaseType: "onetime",
							amount: session.amount_total || 0,
							currency: session.currency || "usd",
							purchaseDate: new Date(),
							stripeCustomerId: customerId,
						}).catch(err => console.error('Failed to send purchase notification:', err))
					}
				}

				break
			}

			case "customer.subscription.updated": {
				const subscription = event.data.object as Stripe.Subscription
				const customerId = subscription.customer as string

				const status =
					subscription.status === "active" ? "active" : "inactive"

				await prisma.user.update({
					where: { stripeCustomerId: customerId },
					data: {
						subscriptionStatus: status,
					},
				})

				break
			}

			case "customer.subscription.deleted": {
				const subscription = event.data.object as Stripe.Subscription
				const customerId = subscription.customer as string

				const user = await prisma.user.findUnique({
					where: { stripeCustomerId: customerId },
				})

				if (user) {
					await prisma.user.update({
						where: { id: user.id },
						data: {
							subscriptionStatus: "inactive",
							stripeSubscriptionId: null,
						},
					})

					await setTokens(
						user.id,
						0,
						"free",
						"Subscription cancelled"
					)
				}

				break
			}

			case "invoice.payment_succeeded": {
				const invoice = event.data.object as Stripe.Invoice
				const customerId = invoice.customer as string

				if (invoice.billing_reason === "subscription_cycle") {
					const user = await prisma.user.findUnique({
						where: { stripeCustomerId: customerId },
					})

					if (user && user.subscriptionStatus === "active") {
						await setTokens(
							user.id,
							TOKEN_CONFIG.SUBSCRIPTION_TOKENS,
							"subscription",
							"Monthly token renewal"
						)

						// Create purchase transaction for revenue tracking
						await prisma.tokenTransaction.create({
							data: {
								userId: user.id,
								amount: TOKEN_CONFIG.SUBSCRIPTION_TOKENS,
								type: 'purchase',
								reason: 'subscription-renewal'
							}
						})
					}
				}

				break
			}

			default:
				console.log(`Unhandled event type: ${event.type}`)
		}

		return NextResponse.json({ received: true })
	} catch (error) {
		console.error("Webhook handler error:", error)
		return NextResponse.json(
			{ error: "Webhook handler failed" },
			{ status: 500 }
		)
	}
}