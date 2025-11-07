'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
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

export default function GalleryPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [playgroundPhotos, setPlaygroundPhotos] = useState<PlaygroundPhoto[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchPlaygroundPhotos = async () => {
            try {
                const response = await fetch('/api/playground/photos')
                const data = await response.json()
                setPlaygroundPhotos(data.photos || [])
            } catch (error) {
                console.error('Failed to fetch photos:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPlaygroundPhotos()
    }, [user])

    if (loading) {
        return <Loader fullScreen />
    }

    const hasPhotos = playgroundPhotos.length > 0

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
                    <Button variant="ghost" onClick={() => router.push('/dashboard/playground')}>
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
                )}
            </div>
        </div>
    )
}