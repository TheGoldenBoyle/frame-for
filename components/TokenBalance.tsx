'use client'

import { useEffect, useState } from 'react'
import { TOKEN_CONFIG } from '@/lib/config/tokens'
import { TokenBalanceType } from '@/types/globals'

export function TokenBalance() {
	const [balance, setBalance] = useState<TokenBalanceType | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchBalance()
	}, [])

	const fetchBalance = async () => {
		try {
			const response = await fetch('/api/tokens/balance')
			if (response.ok) {
				const data = await response.json()
				setBalance(data)
			}
		} catch (error) {
			console.error('Failed to fetch token balance:', error)
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return <div className="text-sm text-muted">Loading...</div>
	}

	if (!balance) {
		return null
	}

	const isLow = balance.tokens < 10
	const isEmpty = balance.tokens === 0

	return (
		<div className="flex items-center gap-3">
			<div className="text-right">
				<div className="text-sm font-medium">
					{balance.tokens} {balance.tokens === 1 ? 'token' : 'tokens'}
				</div>
				{balance.tokenType === 'subscription' && (
					<div className="text-xs text-muted">Subscription</div>
				)}
				{balance.tokenType === 'onetime' && (
					<div className="text-xs text-muted">One-time</div>
				)}
			</div>
			
			{isEmpty && (
				<a
					href={TOKEN_CONFIG.CONTACT.url}
					target="_blank"
					rel="noopener noreferrer"
					className="text-xs underline"
				>
					Out of tokens? DM {TOKEN_CONFIG.CONTACT.handle}
				</a>
			)}
			
			{isLow && !isEmpty && (
				<div className="text-xs text-yellow-600">Running low</div>
			)}
		</div>
	)
}