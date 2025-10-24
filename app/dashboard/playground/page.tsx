'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { ImageUpload } from '@/components/ImageUpload'
import { PromptInput } from '@/components/PromptInput'
import { ModelSelector } from '@/components/ModelSelector'
import { GenerationLoader } from '@/components/GenerationLoader'
import { ComparisonGrid } from '@/components/ComparisonGrid'
import { useAuth } from '@/hooks/useAuth'

import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'
import { Card } from '@/components/ui/Card'

type PlaygroundResult = {
  modelId: string
  modelName: string
  imageUrl: string | null
  error?: string
}

type ComparisonResult = {
  modelId: string
  modelName: string
  imageUrl: string
}

function toComparisonResult(result: PlaygroundResult): ComparisonResult | null {
  if (result.imageUrl) {
    return {
      modelId: result.modelId,
      modelName: result.modelName,
      imageUrl: result.imageUrl
    }
  }
  return null
}
  
export default function PlaygroundPage() {
    const router = useRouter()
    const { user } = useAuth()
    const promptRef = useRef<HTMLTextAreaElement>(null)
    const [prompt, setPrompt] = useState('')
    const [selectedModels, setSelectedModels] = useState<string[]>(['nano-banana'])
    const [image, setImage] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [results, setResults] = useState<ComparisonResult[]>([])
    const [playgroundPhotoId, setPlaygroundPhotoId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [savingStates, setSavingStates] = useState<Record<string, boolean>>({})

    useEffect(() => {
        if (!loading && !generating && results.length === 0 && promptRef.current) {
            promptRef.current.focus()
        }
    }, [loading, generating, results.length])

    const handleModelSelect = (modelId: string) => {
        setSelectedModels((prev) =>
            prev.includes(modelId)
                ? prev.filter((id) => id !== modelId)
                : [...prev, modelId]
        )
    }

    const handleImageChange = (files: File[]) => {
        setImage(files[0] || null)
    }

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt')
            return
        }

        if (selectedModels.length === 0) {
            setError('Please select at least one model')
            return
        }

        setGenerating(true)
        setError(null)
        setResults([])

        try {
            const formData = new FormData()
            formData.append('prompt', prompt.trim())
            formData.append('modelIds', JSON.stringify(selectedModels))

            if (image) {
                formData.append('image', image)
            }

            const response = await fetch('/api/playground/generate', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Generation failed')
            }

            setResults(data.results || [])
            setPlaygroundPhotoId(data.playgroundPhotoId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setGenerating(false)
        }
    }

    const handleSaveResult = async (modelId: string) => {
        if (!playgroundPhotoId) return

        setSavingStates((prev) => ({ ...prev, [modelId]: true }))

        try {
            const response = await fetch('/api/playground/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    playgroundPhotoId,
                    modelId,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Save failed')
            }

            alert('Saved to playground gallery!')
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Save failed')
        } finally {
            setSavingStates((prev) => ({ ...prev, [modelId]: false }))
        }
    }

    const handleStartOver = () => {
        setPrompt('')
        setSelectedModels(['nano-banana'])
        setImage(null)
        setResults([])
        setPlaygroundPhotoId(null)
        setError(null)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        )
    }

    if (generating) {
        return (
            <GenerationLoader 
                modelCount={selectedModels.length}
                modelNames={selectedModels}
                hasImage={!!image}
                prompt={prompt}
            />
        )
    }

    if (results.length > 0) {
        return (
            <div className="min-h-screen p-2 md:p-4">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                            ← Back to Dashboard
                        </Button>
                        <div className="flex gap-4">
                            <Button variant="ghost" onClick={handleStartOver}>
                                Start Over
                            </Button>
                        </div>
                    </div>

                    <Card>
                        <div className="mb-6">
                            <h2 className="mb-2 text-2xl font-bold">Results</h2>
                            <p className="text-sm text-muted">{prompt}</p>
                        </div>

                        <ComparisonGrid
                            results={results
                                .map(toComparisonResult)
                                .filter((result): result is ComparisonResult => result !== null)
                            }
                            originalImageUrl={image ? URL.createObjectURL(image) : undefined}
                            onSaveResult={handleSaveResult}
                            savingStates={savingStates}
                        />

                        {results.some(r => !r.imageUrl) && (
                            <div className="p-4 mt-6 text-sm text-orange-600 border border-orange-200 rounded-lg bg-orange-50">
                                Some models failed to generate. This can happen due to rate limits or model availability.
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6 md:mb-8 flex-shrink-0">
                <div>
                    <h1 className="mb-1 md:mb-2 text-2xl md:text-3xl font-bold">Playground</h1>
                    <p className="text-sm md:text-base text-muted">
                        Experiment with the latest AI image generation models
                    </p>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-4 md:gap-6 overflow-hidden">
                <Card className="flex-shrink-0">
                    <ModelSelector
                        selectedModels={selectedModels}
                        onSelect={handleModelSelect}
                        maxSelection={3}
                        disabled={generating}
                        hasImage={!!image}
                    />
                </Card>

                <div className="flex-1 grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 overflow-auto">
                    <Card className="h-full">
                        <PromptInput
                            ref={promptRef}
                            value={prompt}
                            onChange={setPrompt}
                            placeholder="A serene mountain landscape at sunset with vibrant colors..."
                            label="Prompt"
                            maxLength={1000}
                            disabled={generating}
                        />
                    </Card>

                    <Card className="h-fit">
                        <label className="block mb-3 text-sm font-medium text-text">
                            Input Image (Optional)
                        </label>
                        <ImageUpload
                            onImagesChange={handleImageChange}
                            maxImages={1}
                        />
                        <p className="mt-2 text-sm text-muted">
                            Add an image for image-to-image generation, or leave empty for text-to-image
                        </p>
                    </Card>
                </div>

                {error && (
                    <div className="p-4 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50 flex-shrink-0">
                        {error}
                    </div>
                )}

                <Button
                    onClick={handleGenerate}
                    disabled={generating || !prompt.trim() || selectedModels.length === 0}
                    className="w-full flex-shrink-0"
                >
                    {selectedModels.length > 1
                        ? `Compare ${selectedModels.length} Models`
                        : 'Generate Image'}
                </Button>
            </div>
        </>
    )
}