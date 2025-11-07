'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loader } from '@/components/ui/Loader'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'

type PlaygroundResult = {
    modelId: string
    modelName: string
    imageUrl: string | null
    error?: string
}

export default function PlaygroundGalleryPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { t } = useI18n()
    const [photos, setPhotos] = useState<{
        id: string
        prompt: string
        results: PlaygroundResult[]
        createdAt: string
    }[]>([])
    const [loading, setLoading] = useState(true)
    const [imageErrors, setImageErrors] = useState<{ [key: string]: string }>({})

    useEffect(() => {
        if (!user) return

        const fetchPhotos = async () => {
            try {
                const response = await fetch('/api/playground/photos')
                const data = await response.json()

                setPhotos(data.photos)
            } catch (error) {
                console.error('Failed to fetch photos:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPhotos()
    }, [user])

    const handleImageError = (modelId: string, imageUrl: string) => {
        console.error('Image loading failed:', {
            modelId,
            imageUrl,
            timestamp: new Date().toISOString()
        })

        setImageErrors(prev => ({
            ...prev,
            [modelId]: imageUrl
        }))
    }


     if (loading) {
         return (
             <div className="flex items-center justify-center min-h-screen">
                 <Loader />
             </div>
         )
     }

    return (
        <div className="min-h-screen p-2 md:p-4">
            <div className="mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                            ← {t.common.back}
                        </Button>
                    </div>
                    <Button onClick={() => router.push('/dashboard/playground')}>
                        {t.playground.goToPlayground}
                    </Button>
                </div>

                <h1 className="mb-8 text-3xl font-bold">{t.playground.galleryTitle}</h1>

                {photos.length === 0 ? (
                    <Card>
                        <div className="py-12 text-center">
                            <p className="mb-4 text-stone-500">{t.playground.galleryEmpty}</p>
                            <p className="mb-6 text-sm text-stone-400">
                                {t.playground.galleryEmptyDescription}
                            </p>
                            <Button onClick={() => router.push('/dashboard/playground')}>
                                {t.playground.goToPlayground}
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <div className="space-y-8">
                        {photos.map((photo) => (
                            <Card key={photo.id}>
                                <div className="mb-4">
                                    <p className="text-sm text-stone-500">
                                        {new Date(photo.createdAt).toLocaleDateString()}
                                    </p>
                                    <p className="mt-2 font-medium">{photo.prompt}</p>
                                </div>
                                <div className={`grid gap-4 ${photo.results.length === 1
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
                                                    className="relative overflow-hidden rounded-lg bg-stone-100"
                                                    style={{ aspectRatio: '1/1' }}
                                                >
                                                    {imageErrors[result.modelId] ? (
                                                        <div className="flex items-center justify-center w-full h-full bg-red-100 text-red-600">
                                                            <p>Image Failed to Load</p>
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={result.imageUrl!}
                                                            alt={result.modelName}
                                                            className="object-cover w-full h-full"
                                                            onError={() => handleImageError(result.modelId, result.imageUrl!)}
                                                        />
                                                    )}
                                                </div>
                                                <p className="text-sm font-medium text-center text-stone-600">
                                                    {result.modelName}
                                                </p>
                                                {imageErrors[result.modelId] && (
                                                    <p className="text-xs text-center text-red-500">
                                                        Failed URL: {imageErrors[result.modelId]}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}