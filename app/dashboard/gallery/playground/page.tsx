'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'
import { PlaygroundResult } from '@shared/globals'

type PlaygroundPhoto = {
  id: string
  prompt: string
  originalUrl: string | null
  results: PlaygroundResult[]
  createdAt: string
}

export default function PlaygroundGalleryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { t } = useI18n()
  const [photos, setPhotos] = useState<PlaygroundPhoto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchPhotos = async () => {
      try {
        const response = await fetch('/api/playground/photos')
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
        <p className="text-stone-500">{t.common.loading}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
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
                <div className={`grid gap-4 ${
                  photo.results.length === 1
                    ? 'grid-cols-1 max-w-2xl'
                    : photo.results.length === 2
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                }`}>
                  {photo.results.map((result) => (
                    result.imageUrl && (
                      <div key={result.modelId} className="space-y-2">
                        <div className="relative overflow-hidden rounded-lg bg-stone-100" style={{ aspectRatio: '1/1' }}>
                          <img
                            src={result.imageUrl}
                            alt={result.modelName}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <p className="text-sm font-medium text-center text-stone-600">
                          {result.modelName}
                        </p>
                      </div>
                    )
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