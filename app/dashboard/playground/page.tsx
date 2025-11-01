'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { PromptInput } from '@/components/PromptInput'
import { GenerationLoader } from '@/components/GenerationLoader'
import { ComparisonGrid } from '@/components/ComparisonGrid'
import { RevisionModal } from '@/components/RevisionModal'
import { useAuth } from '@/hooks/useAuth'

import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'
import { Card } from '@/components/ui/Card'
import { RequestModelForm } from '@/components/RequestModelForm'

const MODELS = [
  { id: 'flux-1.1-pro', name: 'FLUX 1.1 Pro', provider: 'Black Forest Labs', description: 'Best for realism and detail' },
  { id: 'imagen-4', name: 'Imagen 4', provider: 'Google', description: 'Great for text and graphics' },
  { id: 'seedream-4', name: 'Seedream 4', provider: 'ByteDance', description: 'Fast and creative' },
  { id: 'ideogram-v3-turbo', name: 'Ideogram v3 Turbo', provider: 'Ideogram AI', description: 'Perfect for logos and design' },
  { id: 'recraft-v3', name: 'Recraft v3', provider: 'Recraft AI', description: 'Artistic and stylized' },
]

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
      imageUrl: result.imageUrl,
    }
  }
  return null
}

export default function PlaygroundPage() {
  const router = useRouter()
  const { user } = useAuth()
  const promptRef = useRef<HTMLTextAreaElement>(null)

  const [prompt, setPrompt] = useState('')
  const [selectedModels, setSelectedModels] = useState<string[]>(['flux-1.1-pro'])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [revising, setRevising] = useState(false)
  const [results, setResults] = useState<ComparisonResult[]>([])
  const [playgroundPhotoId, setPlaygroundPhotoId] = useState<string | null>(null)
  const [revisionCount, setRevisionCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({})
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [revisingImage, setRevisingImage] = useState<{
    imageUrl: string
    modelId: string
    modelName: string
  } | null>(null)

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

  const handleGenerate = async () => {
    if (!prompt.trim()) return setError('Please enter a prompt')
    if (selectedModels.length === 0) return setError('Please select at least one model')

    setGenerating(true)
    setError(null)
    setResults([])

    try {
      const formData = new FormData()
      formData.append('prompt', prompt.trim())
      formData.append('modelIds', JSON.stringify(selectedModels))

      const response = await fetch('/api/playground/generate', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Generation failed')

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playgroundPhotoId, modelId }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Save failed')
      alert('Saved to playground gallery!')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSavingStates((prev) => ({ ...prev, [modelId]: false }))
    }
  }

  const handleReviseResult = (modelId: string) => {
    const result = results.find(r => r.modelId === modelId)
    if (!result || !result.imageUrl) return

    setRevisingImage({
      imageUrl: result.imageUrl,
      modelId: result.modelId,
      modelName: result.modelName
    })
  }

  const handleReviseSubmit = async (
    revisionPrompt: string,
    modelIds: string[],
    maskData: string | null
  ) => {
    if (!revisingImage || !playgroundPhotoId) return

    setRevising(true)
    setRevisingImage(null)

    try {
      const res = await fetch('/api/playground/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: revisingImage.imageUrl,
          modelId: revisingImage.modelId,
          prompt: revisionPrompt,
          playgroundPhotoId,
          maskData,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Revision failed')

      if (data.results && data.results.length > 0) {
        setResults(data.results.map((r: any) => ({
          ...r,
          imageUrl: `${r.imageUrl}?v=${Date.now()}`
        })))
        setRevisionCount(prev => prev + 1)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revision failed')
    } finally {
      setRevising(false)
    }
  }

  const handleStartOver = () => {
    setPrompt('')
    setSelectedModels(['flux-1.1-pro'])
    setResults([])
    setPlaygroundPhotoId(null)
    setError(null)
  }

  if (loading) return <Loader fullScreen />

  if (generating)
    return (
      <GenerationLoader
        modelCount={selectedModels.length}
        modelNames={selectedModels}
        hasImage={false}
        prompt={prompt}
      />
    )

  if (results.length > 0) {
    return (
      <div className="min-h-screen p-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              ← Back to Dashboard
            </Button>
            <Button variant="ghost" onClick={handleStartOver}>
              Start Over
            </Button>
          </div>

          <Card className="relative">
            {revising && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-3">
                  <Loader />
                  <p className="text-sm text-muted">Revising...</p>
                </div>
              </div>
            )}

            <h2 className="mb-4 text-xl font-semibold">Results</h2>
            <p className="mb-6 text-sm text-muted max-w-[700px]">{prompt}</p>

            <ComparisonGrid
              results={results
                .map(toComparisonResult)
                .filter((r): r is ComparisonResult => r !== null)}
              onSaveResult={handleSaveResult}
              onReviseResult={handleReviseResult}
              savingStates={savingStates}
            />

            {results.some((r) => !r.imageUrl) && (
              <div className="p-4 mt-6 text-sm text-orange-600 border border-orange-200 rounded-lg bg-orange-50">
                Some models failed to generate. This can happen due to rate limits or model availability.
              </div>
            )}
          </Card>
        </div>

        {revisingImage && (
          <RevisionModal
            imageUrl={revisingImage.imageUrl}
            modelId={revisingImage.modelId}
            modelName={revisingImage.modelName}
            availableModels={MODELS}
            revisionCount={revisionCount}
            onClose={() => setRevisingImage(null)}
            onRevise={handleReviseSubmit}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="flex flex-col gap-6 mx-auto max-w-7xl md:flex-row">
        <div className="flex flex-col gap-4 md:w-1/3">
          <div>
            <h2 className="mb-1 text-xl font-semibold">Models</h2>
            <p className="text-sm text-muted">Choose as many models as you want 1–5</p>
          </div>
          <Card className="flex flex-col flex-1" animate={false}>
            <div className="grid flex-1 gap-4 grid-cols-1">
              {MODELS.map((model, index) => {
                const isSelected = selectedModels.includes(model.id)
                return (
                  <Card
                    key={model.id}
                    onClick={() => handleModelSelect(model.id)}
                    className={`cursor-pointer p-5 border ${
                      isSelected
                        ? 'border-primary bg-surface/80 shadow-elevated-gold'
                        : 'border-border bg-surface/60'
                    } animate-fade-in-up stagger-${(index % 6) + 1}`}
                  >
                    <h3 className={`font-semibold mb-1 ${isSelected ? 'text-primary' : 'text-text'}`}>
                      {model.name}
                    </h3>
                    <p className="text-xs text-muted">{model.description}</p>
                  </Card>
                )
              })}

              <Card
                onClick={() => setShowRequestForm(true)}
                className="p-5 text-center border border-dashed cursor-pointer border-primary/40 bg-surface/40 animate-fade-in-up"
              >
                <h3 className="mb-1 font-semibold text-primary">Request a Model</h3>
                <p className="text-sm text-muted">Tell us what you'd like next</p>
              </Card>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4 md:w-2/3">
          <div>
            <h2 className="mb-1 text-xl font-semibold">Prompt</h2>
            <p className="text-sm text-muted">Describe what you want to generate</p>
          </div>
          <Card className="flex flex-col flex-1" animate={false}>
            <PromptInput
              ref={promptRef}
              value={prompt}
              onChange={setPrompt}
              placeholder="A serene mountain landscape at sunset with vibrant colors..."
              label="Prompt"
              maxLength={1000}
              disabled={generating}
              showEnhanceButton={true}
            />

            <Button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim() || selectedModels.length === 0}
              className="w-full mt-4"
            >
              {selectedModels.length > 1
                ? `Compare ${selectedModels.length} Models`
                : 'Generate Image'}
            </Button>
          </Card>

          {error && (
            <div className="p-4 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
              {error}
            </div>
          )}
        </div>
      </div>

      {showRequestForm && <RequestModelForm onClose={() => setShowRequestForm(false)} />}

      {revisingImage && (
        <RevisionModal
          imageUrl={revisingImage.imageUrl}
          modelId={revisingImage.modelId}
          modelName={revisingImage.modelName}
          availableModels={MODELS}
          revisionCount={revisionCount}
          onClose={() => setRevisingImage(null)}
          onRevise={handleReviseSubmit}
        />
      )}
    </div>
  )
}