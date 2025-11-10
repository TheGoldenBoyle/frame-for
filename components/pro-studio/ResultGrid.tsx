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

    const handleRevisionComplete = () => {
        onRevisionComplete()
    }

    return (
        <div className="space-y-6">
            <Card className="p-4">
                <div className="space-y-4">
                    <div>
                        <h2 className="mb-2 text-xl font-semibold">Your Prompt</h2>
                        <p className="text-sm leading-relaxed text-muted">{prompt}</p>
                    </div>

                    {successfulResults.length > 0 && (
                        <div className="flex flex-col gap-2 pt-2">
                            <span className="text-sm font-medium text-muted">
                                {successfulResults.length} {successfulResults.length === 1 ? 'image' : 'images'} generated
                            </span>
                            {successfulResults.length > 1 && (
                                <Button variant="ghost" size="sm" onClick={handleDownloadAll}>
                                    Download All
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </Card>

            <div className={`grid gap-4 ${
                successfulResults.length === 1
                    ? 'grid-cols-1 max-w-3xl mx-auto'
                    : successfulResults.length === 2
                        ? 'grid-cols-1 md:grid-cols-2'
                        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
                {results.map((result) => (
                    <Card key={result.index} className="overflow-hidden">
                        {result.imageUrl ? (
                            <div className="space-y-0">
                                <div
                                    className="relative overflow-hidden transition-opacity cursor-pointer bg-surface hover:opacity-95 group"
                                    style={{ aspectRatio: '1/1' }}
                                    onClick={() => handleImageClick(result)}
                                >
                                    <img
                                        src={result.imageUrl}
                                        alt={`Generated image ${result.index + 1}`}
                                        className="object-cover w-full h-full"
                                    />
                                    <div className="absolute inset-0 transition-colors bg-black/0 group-hover:bg-black/5" />
                                </div>
                                <div className="p-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleImageClick(result)}
                                        className="w-full"
                                    >
                                        Revise Image
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center p-4 aspect-square bg-red-50">
                                <p className="text-sm text-center text-red-600">
                                    {result.error || 'Generation failed'}
                                </p>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {results.some(r => !r.imageUrl) && (
                <Card className="p-4 border-orange-200 bg-orange-50">
                    <p className="text-sm text-orange-700">
                        <span className="font-medium">Note:</span> Some images failed to generate. This can happen due to rate limits or model availability.
                    </p>
                </Card>
            )}

            {selectedImage && (
                <RevisionModal
                    isOpen={revisionModalOpen}
                    onClose={() => {
                        setRevisionModalOpen(false)
                        setSelectedImage(null)
                    }}
                    imageUrl={selectedImage.imageUrl!}
                    batchId={batchId}
                    imageIndex={selectedImage.index}
                    originalPrompt={prompt}
                    onRevisionComplete={handleRevisionComplete}
                />
            )}
        </div>
    )
}