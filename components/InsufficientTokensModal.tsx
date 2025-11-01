'use client'

import { TOKEN_CONFIG } from '@/lib/config/tokens'

type InsufficientTokensModalProps = {
	isOpen: boolean
	onCloseAction: () => void
	tokensNeeded?: number
}

export function InsufficientTokensModal({
	isOpen,
	onCloseAction,
	tokensNeeded = 1
}: InsufficientTokensModalProps) {
	if (!isOpen) return null

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
			<div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
				<h2 className="text-xl font-bold mb-4">Out of Tokens</h2>
				
				<p className="mb-4">
					You need {tokensNeeded} {tokensNeeded === 1 ? 'token' : 'tokens'} to continue.
				</p>
				
				<p className="mb-6 text-sm text-muted">
					Contact me on X to purchase more tokens or subscribe for monthly tokens.
				</p>
				
				<div className="flex gap-3">
					<a
						href={TOKEN_CONFIG.CONTACT.url}
						target="_blank"
						rel="noopener noreferrer"
						className="flex-1 bg-black text-white py-2 px-4 rounded text-center"
					>
						DM {TOKEN_CONFIG.CONTACT.handle}
					</a>
					
					<button
						onClick={onCloseAction}
						className="flex-1 border py-2 px-4 rounded"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	)
}