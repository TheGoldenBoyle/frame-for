import { prisma } from "@/lib/prisma"

export const REVENUE_CAP = 410
export const SAFETY_BUFFER = 350

export interface RevenueStats {
	totalRevenue: number
	subscriptionRevenue: number
	onetimeRevenue: number
	activeSubscribers: number
	onetimePurchases: number
	remainingCapacity: number
	isAtCapacity: boolean
	percentageUsed: number
}

export async function getCurrentRevenue(): Promise<RevenueStats> {
	try {
		const subscribers = await prisma.user.count({
			where: {
				subscriptionStatus: "active",
				tokenType: "subscription",
			},
		})

		const onetimePurchases = await prisma.tokenTransaction.count({
			where: {
				type: "purchase",
				reason: {
					contains: "one-time",
				},
			},
		})

		const subscriptionRevenue = subscribers * 4.99
		const onetimeRevenue = onetimePurchases * 9.99
		const totalRevenue = subscriptionRevenue + onetimeRevenue

		const remainingCapacity = REVENUE_CAP - totalRevenue
		const isAtCapacity = totalRevenue >= SAFETY_BUFFER
		const percentageUsed = (totalRevenue / REVENUE_CAP) * 100

		return {
			totalRevenue,
			subscriptionRevenue,
			onetimeRevenue,
			activeSubscribers: subscribers,
			onetimePurchases,
			remainingCapacity,
			isAtCapacity,
			percentageUsed,
		}
	} catch (error) {
		console.error("Revenue tracking error:", error)
		throw error
	}
}

export async function canAcceptNewSignups(): Promise<boolean> {
	const stats = await getCurrentRevenue()
	return !stats.isAtCapacity
}
