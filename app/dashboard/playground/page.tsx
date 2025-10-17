'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { ImageUpload } from '@/components/ImageUpload'
import { PromptInput } from '@/components/PromptInput'
import { ModelSelector } from '@/components/ModelSelector'
import { GenerationLoader } from '@/components/GenerationLoader'
import { ComparisonGrid } from '@/components/ComparisonGrid'
import { useAuth } from '@/hooks/useAuth'
import { PlaygroundResult } from '@/app/types/globals'


export default function PlaygroundPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [prompt, setPrompt] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>([])
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<PlaygroundResult[]>([])
  const [playgroundPhotoId, setPlaygroundPhotoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({})

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

    setLoading(true)
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
      setLoading(false)
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
    setSelectedModels([])
    setImage(null)
    setResults([])
    setPlaygroundPhotoId(null)
    setError(null)
  }

  if (loading) {
    return <GenerationLoader modelCount={selectedModels.length} />
  }

  if (results.length > 0) {
    return (
      <div className="min-h-screen p-8">
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
              <p className="text-sm text-stone-600">{prompt}</p>
            </div>

            <ComparisonGrid
              results={results.filter(r => r.imageUrl)}
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
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="mb-2 text-3xl font-bold">Playground</h1>
            <p className="text-stone-600">
              Experiment with the latest AI image generation models
            </p>
          </div>
        </div>

        <Card>
          <div className="space-y-6">
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              placeholder="A serene mountain landscape at sunset with vibrant colors..."
              label="Prompt"
              maxLength={1000}
              disabled={loading}
            />

            <ModelSelector
              selectedModels={selectedModels}
              onSelect={handleModelSelect}
              maxSelection={3}
              disabled={loading}
            />

            <div>
              <label className="block mb-3 text-sm font-medium">
                Input Image (Optional)
              </label>
              <ImageUpload
                onImagesChange={handleImageChange}
                maxImages={1}
              />
              <p className="mt-2 text-sm text-stone-500">
                Add an image for image-to-image generation, or leave empty for text-to-image
              </p>
            </div>

            {error && (
              <div className="p-4 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim() || selectedModels.length === 0}
                className="flex-1"
              >
                {selectedModels.length > 1 
                  ? `Compare ${selectedModels.length} Models` 
                  : 'Generate Image'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="p-6 mt-8 border border-blue-200 rounded-lg bg-blue-50">
          <h3 className="mb-2 font-bold text-blue-900">💡 Tips</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Select multiple models to compare their outputs side-by-side</li>
            <li>• Nano Banana requires an input image for editing</li>
            <li>• Be specific in your prompts for better results</li>
            <li>• Save your favorite results to the playground gallery</li>
          </ul>
        </div>
      </div>
    </div>
  )
}