'use client'

import { useState, useRef, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loader } from '@/components/ui/Loader'
import { ImageUpload } from '@/components/ImageUpload'
import { PromptInput } from '@/components/PromptInput'
import { GenerationLoader } from '@/components/GenerationLoader'
import { ResultCard } from '@/components/ResultCard'

type TransformResult = {
    imageUrl: string
    originalUrl: string
}

export default function ImagePlaygroundPage() {
    const router = useRouter()
    const { user } = useAuth()
    const promptRef = useRef<HTMLTextAreaElement>(null)
    
    const [image, setImage] = useState<File | null>(null)
    const [prompt, setPrompt] = useState('')
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [result, setResult] = useState<TransformResult | null>(null)
    const [error, setError] = useState<string | ReactNode | null>(null)

    const handleImageChange = (files: File[]) => {
        setImage(files[0] || null)
        setResult(null)
        setError(null)
    }

    const handleTransform = async () => {
        if (!image) {
            setError('Please upload an image')
            return
        }

        if (!prompt.trim()) {
            setError('Please describe how you want to transform the image')
            return
        }

        setGenerating(true)
        setError(null)
        setResult(null)

        try {
            const formData = new FormData()
            formData.append('image', image)
            formData.append('prompt', prompt.trim())

            const response = await fetch('/api/image-playground/transform', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (response.status === 402) {
                setError(
                    <div className="space-y-3">
                        <p>{data.message || 'Insufficient tokens'}</p>
                        <Button onClick={() => router.push('/dashboard')} size="sm">
                            Get More Tokens
                        </Button>
                    </div>
                )
                return
            }

            if (!response.ok) {
                throw new Error(data.error || 'Transformation failed')
            }

            setResult({
                imageUrl: data.imageUrl,
                originalUrl: data.originalUrl,
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setGenerating(false)
        }
    }

    const handleStartOver = () => {
        setImage(null)
        setPrompt('')
        setResult(null)
        setError(null)
    }

    if (loading) {
        return <Loader fullScreen />
    }

    if (generating) {
        return (
            <GenerationLoader
                modelCount={1}
                modelNames={['nano-banana']}
                hasImage={true}
                prompt={prompt}
            />
        )
    }

    if (result) {
        return (
            <div className="min-h-screen p-4 md:p-8">
                <div className="mx-auto max-w-4xl">
                    <div className="flex items-center justify-between mb-8">
                        <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                            ← Back to Dashboard
                        </Button>
                        <Button variant="ghost" onClick={handleStartOver}>
                            Transform Another
                        </Button>
                    </div>

                    <Card>
                        <div className="mb-6">
                            <h2 className="mb-2 text-2xl font-bold">Transformed Image</h2>
                            <p className="text-sm text-muted">{prompt}</p>
                        </div>

                        <div className="max-w-2xl mx-auto">
                            <ResultCard
                                imageUrl={result.imageUrl}
                                modelName="Nano Banana"
                                originalImageUrl={result.originalUrl}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6 md:mb-8 flex-shrink-0">
                <div>
                    <h1 className="mb-1 md:mb-2 text-2xl md:text-3xl font-bold">Image Playground</h1>
                    <p className="text-sm md:text-base text-muted">
                        Transform your images with AI-powered editing
                    </p>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 overflow-auto">
                <Card className="h-fit">
                    <label className="block mb-3 text-sm font-medium text-text">
                        Upload Image
                    </label>
                    <ImageUpload
                        onImagesChange={handleImageChange}
                        maxImages={1}
                        label="Select an image to transform"
                    />
                    <p className="mt-3 text-sm text-muted">
                        Upload a photo and describe how you want to transform it
                    </p>
                </Card>

                <Card className="h-fit">
                    <PromptInput
                        ref={promptRef}
                        value={prompt}
                        onChange={setPrompt}
                        placeholder="Add a sunset background, make it cinematic, enhance colors, change style to watercolor..."
                        label="Transformation Instructions"
                        maxLength={1000}
                        disabled={generating}
                    />
                    <div className="mt-3 p-3 text-xs rounded-lg bg-surface border border-border">
                        <p className="font-medium text-text mb-1">Using: Nano Banana</p>
                        <p className="text-muted">Cost: 1 token per transformation</p>
                    </div>
                </Card>
            </div>

            {error && (
                <div className="p-4 mt-6 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50 flex-shrink-0">
                    {error}
                </div>
            )}

            <Button
                onClick={handleTransform}
                disabled={generating || !image || !prompt.trim()}
                className="w-full mt-6 flex-shrink-0"
            >
                Transform Image
            </Button>
        </>
    )
}