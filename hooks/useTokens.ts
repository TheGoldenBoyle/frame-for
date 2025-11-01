import { useState, useEffect, useCallback } from 'react'
import { TOKEN_CONFIG } from '@/lib/config/tokens'

type TokenType = 'free' | 'subscription' | 'onetime'
type SubscriptionStatus = 'free' | 'active' | 'canceled'

interface TokenData {
    tokens: number
    tokenType: TokenType
    subscriptionStatus: SubscriptionStatus
}

interface UseTokensReturn {
    tokens: number
    tokenType: TokenType
    subscriptionStatus: SubscriptionStatus
    isLoading: boolean
    error: string | null
    refreshTokens: () => Promise<void>
    hasEnoughTokens: (cost: number) => boolean
    calculateCost: (action: keyof typeof TOKEN_CONFIG.COSTS, quantity?: number) => number
    formatTokenDisplay: (cost?: number) => string
}

export function useTokens(): UseTokensReturn {
    const [tokenData, setTokenData] = useState<TokenData>({
        tokens: 0,
        tokenType: 'free',
        subscriptionStatus: 'free'
    })
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchTokenBalance = useCallback(async () => {
        try {
            setError(null)
            const response = await fetch('/api/tokens')
            
            if (!response.ok) {
                throw new Error('Failed to fetch token balance')
            }

            const data = await response.json()

            setTokenData({
                tokens: data.tokens ?? 0,
                tokenType: data.tokenType,
                subscriptionStatus: data.subscriptionStatus
            })
        } catch (err) {
            console.error('Failed to fetch token balance:', err)
            setError('Failed to load token balance')
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTokenBalance()
    }, [fetchTokenBalance])

    const refreshTokens = useCallback(async () => {
        await fetchTokenBalance()
    }, [fetchTokenBalance])

    const hasEnoughTokens = useCallback((cost: number) => {
        return tokenData.tokens >= cost
    }, [tokenData.tokens])

    const calculateCost = useCallback((
        action: keyof typeof TOKEN_CONFIG.COSTS,
        quantity: number = 1
    ) => {
        return TOKEN_CONFIG.COSTS[action] * quantity
    }, [])

    const formatTokenDisplay = useCallback((cost?: number) => {
        if (cost !== undefined) {
            return `${tokenData.tokens - cost}/${tokenData.tokens} tokens`
        }
        return `${tokenData.tokens} ${tokenData.tokens === 1 ? 'token' : 'tokens'}`
    }, [tokenData.tokens])

    return {
        tokens: tokenData.tokens,
        tokenType: tokenData.tokenType,
        subscriptionStatus: tokenData.subscriptionStatus,
        isLoading,
        error,
        refreshTokens,
        hasEnoughTokens,
        calculateCost,
        formatTokenDisplay
    }
}