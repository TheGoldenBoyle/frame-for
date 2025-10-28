'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Photo } from '@/types/globals'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loader } from '@/components/ui/Loader'

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

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
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
                        {proStudioBatches.length > 0 && (
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">Pro Studio Generations</h2>
                                <div className="space-y-6">
                                    {proStudioBatches.map((batch) => (
                                        <Card key={batch.id}>
                                            <div className="mb-4">
                                                <p className="text-sm text-muted">
                                                    {new Date(batch.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="mt-2 font-medium">{batch.optimizedPrompt}</p>
                                            </div>
                                            <div className={`grid gap-4 ${
                                                batch.results.length === 1
                                                    ? 'grid-cols-1 max-w-2xl'
                                                    : batch.results.length === 2
                                                        ? 'grid-cols-1 md:grid-cols-2'
                                                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                            }`}>
                                                {batch.results
                                                    .filter(result => result.imageUrl)
                                                    .map((result) => (
                                                        <div key={result.index} className="space-y-2">
                                                            <div
                                                                className="relative overflow-hidden rounded-lg bg-surface cursor-pointer hover:opacity-90"
                                                                style={{ aspectRatio: '1/1' }}
                                                                onClick={() => window.open(result.imageUrl!, '_blank')}
                                                            >
                                                                <img
                                                                    src={result.imageUrl!}
                                                                    alt={`Pro Studio image ${result.index + 1}`}
                                                                    className="object-cover w-full h-full"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {transformations.length > 0 && (
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">Image Transformations</h2>
                                <div className="space-y-6">
                                    {transformations.map((transformation) => (
                                        <Card key={transformation.id}>
                                            <div className="mb-4">
                                                <p className="text-sm text-muted">
                                                    {new Date(transformation.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="mt-2 font-medium">{transformation.prompt}</p>
                                                <p className="text-xs text-muted mt-1">Model: {transformation.modelUsed}</p>
                                            </div>
                                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <div
                                                        className="relative overflow-hidden rounded-lg bg-surface cursor-pointer hover:opacity-90 border border-border"
                                                        style={{ aspectRatio: '1/1' }}
                                                        onClick={() => window.open(transformation.originalUrl, '_blank')}
                                                    >
                                                        <img
                                                            src={transformation.originalUrl}
                                                            alt="Original"
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                    <p className="text-sm font-medium text-center text-muted">
                                                        Original
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <div
                                                        className="relative overflow-hidden rounded-lg bg-surface cursor-pointer hover:opacity-90 border border-border"
                                                        style={{ aspectRatio: '1/1' }}
                                                        onClick={() => window.open(transformation.transformedUrl, '_blank')}
                                                    >
                                                        <img
                                                            src={transformation.transformedUrl}
                                                            alt="Transformed"
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                    <p className="text-sm font-medium text-center text-muted">
                                                        Transformed
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {playgroundPhotos.length > 0 && (
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">Playground Comparisons</h2>
                                <div className="space-y-6">
                                    {playgroundPhotos.map((photo) => (
                                        <Card key={photo.id}>
                                            <div className="mb-4">
                                                <p className="text-sm text-muted">
                                                    {new Date(photo.createdAt).toLocaleDateString()}
                                                </p>
                                                <p className="mt-2 font-medium">{photo.prompt}</p>
                                            </div>
                                            <div className={`grid gap-4 ${
                                                photo.results.length === 1
                                                    ? 'grid-cols-1 max-w-2xl'
                                                    : photo.results.length === 2
                                                        ? 'grid-cols-1 md:grid-cols-2'
                                                        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                                            }`}>
                                                {photo.results
                                                    .filter(result => result.imageUrl)
                                                    .map((result) => (
                                                        <div key={result.modelId} className="space-y-2">
                                                            <div
                                                                className="relative overflow-hidden rounded-lg bg-stone-100 cursor-pointer hover:opacity-90"
                                                                style={{ aspectRatio: '1/1' }}
                                                                onClick={() => window.open(result.imageUrl!, '_blank')}
                                                            >
                                                                <img
                                                                    src={result.imageUrl!}
                                                                    alt={result.modelName}
                                                                    className="object-cover w-full h-full"
                                                                />
                                                            </div>
                                                            <p className="text-sm font-medium text-center text-muted">
                                                                {result.modelName}
                                                            </p>
                                                        </div>
                                                    ))}
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        )}

                        {photos.length > 0 && (
                            <div>
                                <h2 className="mb-4 text-xl font-semibold">Generated Photos</h2>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    {photos.map((photo) => (
                                        <div
                                            key={photo.id}
                                            className="relative overflow-hidden transition-opacity rounded-lg cursor-pointer aspect-square bg-surface border border-border hover:opacity-90"
                                            onClick={() => window.open(photo.generatedUrl, '_blank')}
                                        >
                                            <img
                                                src={photo.generatedUrl}
                                                alt="Generated memory"
                                                className="object-cover w-full h-full"
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