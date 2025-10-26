'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { RevisionModal } from './RevisionModel'

type Result = {
    index: number
    imageUrl: string | null
    error?: string
}

type ResultsGridProps = {
    results: Result[]
    batchId: string
    prompt: string
    onRevisionComplete: () => void
}

export function ResultsGrid({ results, batchId, prompt, onRevisionComplete }: ResultsGridProps) {
    const [selectedImage, setSelectedImage] = useState<Result | null>(null)
    const [revisionModalOpen, setRevisionModalOpen] = useState(false)

    const successfulResults = results.filter(r => r.imageUrl)

    const handleImageClick = (result: Result) => {
        if (result.imageUrl) {
            setSelectedImage(result)
            setRevisionModalOpen(true)
        }
    }

    const handleDownloadAll = () => {
        successfulResults.forEach((result, index) => {
            if (result.imageUrl) {
                const link = document.createElement('a')
                link.href = result.imageUrl
                link.download = `pro-studio-${index + 1}.webp`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }
        })
    }

    return (
        <>
            <Card>
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Results</h2>
                        <p className="text-sm text-muted">{prompt}</p>
                    </div>
                    {successfulResults.length > 1 && (
                        <Button variant="outline" onClick={handleDownloadAll}>
                            Download All
                        </Button>
                    )}
                </div>

                <div className={`grid gap-4 ${
                    successfulResults.length === 1
                        ? 'grid-cols-1 max-w-2xl mx-auto'
                        : successfulResults.length === 2
                            ? 'grid-cols-1 md:grid-cols-2'
                            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                    {results.map((result) => (
                        <div key={result.index} className="space-y-3">
                            {result.imageUrl ? (
                                <>
                                    <div
                                        className="relative overflow-hidden rounded-lg bg-surface cursor-pointer hover:opacity-90 transition-opacity"
                                        style={{ aspectRatio: '1/1' }}
                                        onClick={() => handleImageClick(result)}
                                    >
                                        <img
                                            src={result.imageUrl}
                                            alt={`Generated image ${result.index + 1}`}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleImageClick(result)}
                                        className="w-full"
                                    >
                                        Revise Image
                                    </Button>
                                </>
                            ) : (
                                <div className="aspect-square rounded-lg bg-red-50 border-2 border-red-200 flex items-center justify-center p-4">
                                    <p className="text-sm text-red-600 text-center">
                                        {result.error || 'Generation failed'}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {results.some(r => !r.imageUrl) && (
                    <div className="p-4 mt-6 text-sm text-orange-600 border border-orange-200 rounded-lg bg-orange-50">
                        Some images failed to generate. This can happen due to rate limits or model availability.
                    </div>
                )}
            </Card>

            {selectedImage && (
                <RevisionModal
                    isOpen={revisionModalOpen}
                    onCloseAction={() => {
                        setRevisionModalOpen(false)
                        setSelectedImage(null)
                    }}
                    imageUrl={selectedImage.imageUrl!}
                    batchId={batchId}
                    imageIndex={selectedImage.index}
                    originalPrompt={prompt}
                    onRevisionCompleteAction={onRevisionComplete}
                />
            )}
        </>
    )
}