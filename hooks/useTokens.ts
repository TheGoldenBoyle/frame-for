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
            setIsLoading(true)
            setError(null)
            
            const response = await fetch('/api/tokens', {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            
            if (!response.ok) {
                const errorText = await response.text()
                console.error('Token fetch failed:', response.status, errorText)
                throw new Error(`Failed to fetch tokens: ${response.status}`)
            }

            const data = await response.json()
            
            console.log('Token data received:', data)

            setTokenData({
                tokens: data.tokens ?? 0,
                tokenType: data.tokenType || 'free',
                subscriptionStatus: data.subscriptionStatus || 'free'
            })
        } catch (err) {
            console.error('Failed to fetch token balance:', err)
            setError(err instanceof Error ? err.message : 'Failed to load token balance')
            // Set default values on error
            setTokenData({
                tokens: 0,
                tokenType: 'free',
                subscriptionStatus: 'free'
            })
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