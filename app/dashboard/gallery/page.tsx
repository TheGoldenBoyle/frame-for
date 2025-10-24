'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { useAuth } from '@/hooks/useAuth'
import { Photo } from '@/types/globals'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loader } from '@/components/ui/Loader'

export default function GalleryPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [photos, setPhotos] = useState<Photo[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchPhotos = async () => {
            try {
                const response = await fetch('/api/photos')
                const data = await response.json()
                setPhotos(data.photos || [])
            } catch (error) {
                console.error('Failed to fetch photos:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPhotos()
    }, [user])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        )
    }

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                            Back
                        </Button>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" onClick={() => router.push('/dashboard/gallery/playground')}>
                            Playground Gallery
                        </Button>
                        {/* <Button onClick={() => router.push('/dashboard')}>
                            Create New
                        </Button> */}
                    </div>
                </div>

                <h1 className="mb-8 text-3xl font-bold">Your Gallery</h1>

                {photos.length === 0 ? (
                    <Card>
                        <div className="py-12 text-center">
                            <p className="mb-4 text-muted">No photos yet</p>
                            {/* <Button onClick={() => router.push('/dashboard')}>
                                Create Your First Memory
                            </Button> */}
                        </div>
                    </Card>
                ) : (
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
                )}
            </div>
        </div>
    )
}