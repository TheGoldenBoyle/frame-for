'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'

type RevisionModalProps = {
    isOpen: boolean
    onClose: () => void
    imageUrl: string
    batchId: string
    imageIndex: number
    originalPrompt: string
    onRevisionComplete: () => void
}

export function RevisionModal({
    isOpen,
    onClose,
    imageUrl,
    batchId,
    imageIndex,
    originalPrompt,
    onRevisionComplete
}: RevisionModalProps) {
    const router = useRouter()
    const [revisionPrompt, setRevisionPrompt] = useState('')
    const [revising, setRevising] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [insufficientTokens, setInsufficientTokens] = useState(false)

    if (!isOpen) return null

    const handleRevise = async () => {
        if (!revisionPrompt.trim()) {
            setError('Please describe the changes you want')
            return
        }

        setRevising(true)
        setError(null)
        setInsufficientTokens(false)

        try {
            const response = await fetch('/api/pro-studio/revise', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    batchId,
                    imageIndex,
                    revisionPrompt: revisionPrompt.trim(),
                }),
            })

            const data = await response.json()

            if (response.status === 402) {
                setInsufficientTokens(true)
                setError(data.message || 'Insufficient tokens')
                return
            }

            if (!response.ok) {
                throw new Error(data.error || 'Revision failed')
            }

            onRevisionComplete()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setRevising(false)
        }
    }

    const handleGetTokens = () => {
        onClose()
        router.push('/dashboard')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-surface rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Revise Image</h2>
                        <button
                            onClick={onClose}
                            disabled={revising}
                            className="text-muted hover:text-text text-2xl leading-none"
                        >
                            ×
                        </button>
                    </div>

                    <div className="mb-6">
                        <img
                            src={imageUrl}
                            alt="Image to revise"
                            className="w-full rounded-lg"
                        />
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-muted mb-2">Original Prompt:</p>
                        <p className="text-sm p-3 bg-background border border-border rounded-lg">
                            {originalPrompt}
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            What changes would you like? (2 tokens)
                        </label>
                        <textarea
                            value={revisionPrompt}
                            onChange={(e) => setRevisionPrompt(e.target.value)}
                            placeholder="E.g., Make the lighting warmer, add a smile, change background to mountains..."
                            disabled={revising}
                            className="w-full px-4 py-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={4}
                        />
                    </div>

                    {insufficientTokens && (
                        <div className="p-4 mb-4 border border-primary/30 rounded-lg bg-primary/10">
                            <p className="text-sm font-medium mb-3">
                                ⚠️ You don't have enough tokens for this revision
                            </p>
                            <p className="text-sm text-muted mb-4">
                                {error}
                            </p>
                            <Button
                                onClick={handleGetTokens}
                                className="w-full"
                            >
                                Get More Tokens
                            </Button>
                        </div>
                    )}

                    {error && !insufficientTokens && (
                        <div className="p-4 mb-4 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                            {error}
                        </div>
                    )}

                    {!insufficientTokens && (
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={onClose}
                                disabled={revising}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRevise}
                                disabled={!revisionPrompt.trim() || revising}
                                className="flex-1"
                            >
                                {revising ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader size="sm" />
                                        Revising...
                                    </span>
                                ) : (
                                    'Apply Revision'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}