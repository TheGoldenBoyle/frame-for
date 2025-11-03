'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Photo } from '@/types/globals'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loader } from '@/components/ui/Loader'
import { ResultCard } from "@/components/ResultCard"

type PlaygroundResult = {
    modelId: string
    modelName: string
    imageUrl: string | null
    error?: string
}

type PlaygroundPhoto = {
    id: string
    prompt: string
    results: PlaygroundResult[]
    createdAt: string
}

type ProStudioResult = {
    index: number
    imageUrl: string | null
    error?: string
}

type ProStudioBatch = {
    id: string
    optimizedPrompt: string
    results: ProStudioResult[]
    createdAt: string
    imageCount: number
}

type ImageTransformation = {
    id: string
    originalUrl: string
    transformedUrl: string
    prompt: string
    modelUsed: string
    createdAt: string
}

export default function GalleryPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [photos, setPhotos] = useState<Photo[]>([])
    const [playgroundPhotos, setPlaygroundPhotos] = useState<PlaygroundPhoto[]>([])
    const [proStudioBatches, setProStudioBatches] = useState<ProStudioBatch[]>([])
    const [transformations, setTransformations] = useState<ImageTransformation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchAllPhotos = async () => {
            try {
                const [regularResponse, playgroundResponse, proStudioResponse, transformationsResponse] = await Promise.all([
                    fetch('/api/photos'),
                    fetch('/api/playground/photos'),
                    fetch('/api/pro-studio/batches'),
                    fetch('/api/image-playground/transformations')
                ])

                const regularData = await regularResponse.json()
                const playgroundData = await playgroundResponse.json()
                const proStudioData = await proStudioResponse.json()
                const transformationsData = await transformationsResponse.json()

                setPhotos(regularData.photos || [])
                setPlaygroundPhotos(playgroundData.photos || [])
                setProStudioBatches(proStudioData.batches || [])
                setTransformations(transformationsData.transformations || [])
            } catch (error) {
                console.error('Failed to fetch photos:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchAllPhotos()
    }, [user])

    if (loading) {
        return <Loader fullScreen />
    }

    const hasPhotos = photos.length > 0 || playgroundPhotos.length > 0 || proStudioBatches.length > 0 || transformations.length > 0

    // Helper to determine grid layout based on result count
    const getGridClass = (count: number) => {
        if (count === 1) return 'grid-cols-1 max-w-3xl mx-auto'
        if (count === 2) return 'grid-cols-1 lg:grid-cols-2'
        if (count === 3) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
        if (count === 4) return 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-4'
        return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-8xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Gallery</h1>
                    <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                        ← Back
                    </Button>
                </div>

                {!hasPhotos ? (
                    <Card>
                        <div className="py-12 text-center">
                            <p className="mb-4 text-muted">No photos yet</p>
                            <p className="text-sm text-muted">
                                Start creating to see your work here
                            </p>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-12">
                        {/* ENHANCED: Playground Comparisons with ResultCard */}
                        {playgroundPhotos.length > 0 && (
                            <div>
                                <h2 className="mb-6 text-2xl font-semibold">Playground Comparisons</h2>
                                <div className="space-y-8">
                                    {playgroundPhotos.map((photo) => {
                                        const validResults = photo.results.filter(r => r.imageUrl)
                                        return (
                                            <Card key={photo.id} className="p-6">
                                                <div className="mb-6">
                                                    <p className="text-sm text-muted">
                                                        {new Date(photo.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <p className="mt-2 font-medium text-text">{photo.prompt}</p>
                                                </div>
                                                
                                                {/* Enhanced grid with ResultCard */}
                                                <div className={`grid ${getGridClass(validResults.length)} gap-4 lg:gap-6`}>
                                                    {validResults.map((result, index) => (
                                                        <div
                                                            key={result.modelId}
                                                            className="animate-scale-in opacity-0"
                                                            style={{
                                                                animationDelay: `${index * 0.08}s`,
                                                                animationFillMode: 'forwards',
                                                            }}
                                                        >
                                                            <ResultCard
                                                                imageUrl={result.imageUrl!}
                                                                modelName={result.modelName}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {proStudioBatches.length > 0 && (
                            <div>
                                <h2 className="mb-6 text-2xl font-semibold">Pro Studio Generations</h2>
                                <div className="space-y-8">
                                    {proStudioBatches.map((batch) => {
                                        const validResults = batch.results.filter(r => r.imageUrl)
                                        return (
                                            <Card key={batch.id} className="p-6">
                                                <div className="mb-6">
                                                    <p className="text-sm text-muted">
                                                        {new Date(batch.createdAt).toLocaleDateString()}
                                                    </p>
                                                    <p className="mt-2 font-medium text-text">{batch.optimizedPrompt}</p>
                                                </div>
                                                <div className={`grid ${getGridClass(validResults.length)} gap-4 lg:gap-6`}>
                                                    {validResults.map((result, index) => (
                                                        <div
                                                            key={result.index}
                                                            className="animate-scale-in opacity-0"
                                                            style={{
                                                                animationDelay: `${index * 0.08}s`,
                                                                animationFillMode: 'forwards',
                                                            }}
                                                        >
                                                            <ResultCard
                                                                imageUrl={result.imageUrl!}
                                                                modelName={`Image ${result.index + 1}`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {transformations.length > 0 && (
                            <div>
                                <h2 className="mb-6 text-2xl font-semibold">Image Transformations</h2>
                                <div className="space-y-8">
                                    {transformations.map((transformation) => (
                                        <Card key={transformation.id} className="p-6">
                                            <div className="mb-6">
                                                <p className="text-sm text-muted">
                                                    {new Date(transformation.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="mt-2 font-medium text-text">{transformation.prompt}</p>
                                                <p className="text-xs text-muted mt-1">Model: {transformation.modelUsed}</p>
                                            </div>
                                            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 max-w-5xl mx-auto">
                                                <div className="space-y-3">
                                                    <ResultCard
                                                        imageUrl={transformation.originalUrl}
                                                        modelName="Original"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <ResultCard
                                                        imageUrl={transformation.transformedUrl}
                                                        modelName="Transformed"
                                                    />
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {photos.length > 0 && (
                            <div>
                                <h2 className="mb-6 text-2xl font-semibold">Generated Photos</h2>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                    {photos.map((photo, index) => (
                                        <div
                                            key={photo.id}
                                            className="animate-scale-in opacity-0"
                                            style={{
                                                animationDelay: `${index * 0.05}s`,
                                                animationFillMode: 'forwards',
                                            }}
                                        >
                                            <ResultCard
                                                imageUrl={photo.generatedUrl}
                                                modelName="Generated Memory"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}