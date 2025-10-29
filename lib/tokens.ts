import { prisma } from "./prisma"
import { createClient } from "@/lib/supabase"
import { TOKEN_CONFIG } from "@/lib/config/tokens"

type TokenTransactionType = "deduct" | "add" | "reset" | "purchase"

export async function getTokenBalance(userId: string) {
    try {
        let user = await prisma.user.findUnique({
            where: { id: userId },
            select: { tokens: true, tokenType: true, subscriptionStatus: true, email: true }
        })

        // If user doesn't exist in database, try to create them
        if (!user) {
            console.log('User not found in database, attempting to create from Supabase session')
            
            const supabase = createClient()
            const { data: { user: supabaseUser }, error } = await supabase.auth.getUser()
            
            if (!error && supabaseUser && supabaseUser.id === userId) {
                user = await prisma.user.create({
                    data: {
                        id: supabaseUser.id,
                        email: supabaseUser.email!,
                        username: null, 
                        subscriptionStatus: "free",
                        tokens: TOKEN_CONFIG.FREE_TOKENS, 
                        tokenType: "free"
                    },
                    select: { tokens: true, tokenType: true, subscriptionStatus: true, email: true }
                })
                
                console.log('User created successfully in tokens check')
            }
        }

        return user
    } catch (error) {
        console.error("Token balance error:", error)
        return null
    }
}

export async function checkTokens(userId: string, amount: number) {
    const user = await getTokenBalance(userId)

    if (!user) {
        throw new Error("User not found")
    }

    return user.tokens >= amount
}

export async function deductTokens(
	userId: string,
	amount: number,
	reason: string
) {
	const hasTokens = await checkTokens(userId, amount)

	if (!hasTokens) {
		throw new Error("INSUFFICIENT_TOKENS")
	}

	await prisma.$transaction([
		prisma.user.update({
			where: { id: userId },
			data: {
				tokens: {
					decrement: amount,
				},
			},
		}),
		prisma.tokenTransaction.create({
			data: {
				userId,
				amount: -amount,
				type: "deduct",
				reason,
			},
		}),
	])
}

export async function addTokens(
	userId: string,
	amount: number,
	type: TokenTransactionType,
	reason: string
) {
	await prisma.$transaction([
		prisma.user.update({
			where: { id: userId },
			data: {
				tokens: {
					increment: amount,
				},
			},
		}),
		prisma.tokenTransaction.create({
			data: {
				userId,
				amount,
				type,
				reason,
			},
		}),
	])
}

export async function setTokens(
	userId: string,
	amount: number,
	tokenType: string,
	reason: string
) {
	await prisma.$transaction([
		prisma.user.update({
			where: { id: userId },
			data: {
				tokens: amount,
				tokenType,
			},
		}),
		prisma.tokenTransaction.create({
			data: {
				userId,
				amount,
				type: "reset",
				reason,
			},
		}),
	])
}