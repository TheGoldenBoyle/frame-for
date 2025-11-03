'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

import { PromptInput } from '@/components/PromptInput'
import { GenerationLoader } from '@/components/GenerationLoader'
import { ComparisonGrid } from '@/components/ComparisonGrid'
import { RevisionModal } from '@/components/RevisionModal'
import { RequestModelForm } from '@/components/RequestModelForm'
import { SystemPromptManager } from '@/components/SystemPromptManager'

import { useAuth } from '@/hooks/useAuth'
import { useTokens } from '@/hooks/useTokens'

import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'
import { Card } from '@/components/ui/Card'
import { Coins, Sparkles } from 'lucide-react'

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
    const { tokens, isLoading: tokensLoading, calculateCost, hasEnoughTokens } = useTokens()
    const promptRef = useRef<HTMLTextAreaElement>(null)
    const resultsRef = useRef<HTMLDivElement>(null)

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
    const [showSystemPromptManager, setShowSystemPromptManager] = useState(false)
    const [revisingImage, setRevisingImage] = useState<{
        imageUrl: string
        modelId: string
        modelName: string
    } | null>(null)

    // Scroll to results when they update
    useEffect(() => {
        if (results.length > 0 && resultsRef.current) {
            setTimeout(() => {
                resultsRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }, 100)
        }
    }, [results.length])

    // ---------- Model Selection ----------
    const handleModelSelect = (modelId: string) => {
        setSelectedModels((prev) =>
            prev.includes(modelId)
                ? prev.filter((id) => id !== modelId)
                : [...prev, modelId]
        )
    }

    // ---------- Generate ----------
    const handleGenerate = async () => {
        if (!prompt.trim()) return setError('Please enter a prompt')
        if (selectedModels.length === 0) return setError('Please select at least one model')

        setGenerating(true)
        setError(null)
        setResults([])

        try {
            let finalPrompt = prompt.trim()

            // Auto-fill placeholders if needed
            if (finalPrompt.includes('[PLACEHOLDER:')) {
                const enhanceResponse = await fetch('/api/playground/enhance-prompt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: finalPrompt, autoFill: true }),
                })
                if (enhanceResponse.ok) {
                    const enhanceData = await enhanceResponse.json()
                    finalPrompt = enhanceData.enhancedPrompt
                }
            }

            const formData = new FormData()
            formData.append('prompt', finalPrompt)
            formData.append('modelIds', JSON.stringify(selectedModels))

            const response = await fetch('/api/playground/generate', {
                method: 'POST',
                body: formData
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

    // ---------- Save / Revise ----------
    const handleSaveResult = async (modelId: string) => {
        if (!playgroundPhotoId) return
        setSavingStates((prev) => ({ ...prev, [modelId]: true }))
        try {
            const res = await fetch('/api/playground/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playgroundPhotoId, modelId }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Save failed')
            alert('Saved to playground gallery!')
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Save failed')
        } finally {
            setSavingStates((prev) => ({ ...prev, [modelId]: false }))
        }
    }

    const handleReviseResult = (modelId: string) => {
        const result = results.find((r) => r.modelId === modelId)
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
            let finalPrompt = revisionPrompt.trim()

            // Auto-fill placeholders in revisions too
            if (finalPrompt.includes('[PLACEHOLDER:')) {
                const enhanceResponse = await fetch('/api/playground/enhance-prompt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: finalPrompt, autoFill: true }),
                })
                if (enhanceResponse.ok) {
                    const enhanceData = await enhanceResponse.json()
                    finalPrompt = enhanceData.enhancedPrompt
                }
            }

            const res = await fetch('/api/playground/revise', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageUrl: revisingImage.imageUrl,
                    modelId: revisingImage.modelId,
                    prompt: finalPrompt,
                    playgroundPhotoId,
                    maskData
                }),
            })
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Revision failed')
            }

            if (data.results && data.results.length > 0) {
                setResults(data.results.map((r: any) => ({
                    ...r,
                    imageUrl: `${r.imageUrl}?v=${Date.now()}`
                })))
                setRevisionCount((prev) => prev + 1)
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

    // ---------- Focus Input ----------
    useEffect(() => {
        if (!loading && !generating && results.length === 0 && promptRef.current) {
            promptRef.current.focus()
        }
    }, [loading, generating, results.length])

    // ---------- Render ----------
    if (loading) return <Loader fullScreen />
    if (generating)
        return <GenerationLoader
            modelCount={selectedModels.length}
            modelNames={selectedModels}
            hasImage={false}
            prompt={prompt}
            isRevision={false}
        />
    if (revising)
        return <GenerationLoader
            modelCount={1}
            modelNames={['nano-banana']}
            hasImage={true}
            prompt={prompt}
            isRevision={true}
        />

    return (
        <div className="py-4 lg:py-10">
            <div className="flex flex-col gap-6 mx-auto max-w-7xl md:flex-row">
                {/* ---------- Left Panel: Models ---------- */}
                <div className="flex flex-col gap-4 md:w-1/3">
                    <div>
                        <h2 className="mb-1 text-xl font-semibold">Models</h2>
                        <p className="text-sm text-muted line-clamp-1">Choose 1–5 models to generate your images</p>
                    </div>
                    <Card className="flex flex-col flex-1 p-4" animate={false}>
                        <div className="grid gap-4 grid-cols-1">
                            {MODELS.map((model) => {
                                const isSelected = selectedModels.includes(model.id)
                                return (
                                    <Card
                                        key={model.id}
                                        onClick={() => handleModelSelect(model.id)}
                                        className={`cursor-pointer p-4 border ${isSelected
                                                ? 'border-primary bg-surface/80 shadow-elevated-gold'
                                                : 'border-border bg-surface/60'
                                            }`}
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
                                className="p-4 text-center border border-dashed cursor-pointer border-primary/40 bg-surface/40"
                            >
                                <h3 className="mb-1 font-semibold text-primary">Request a Model</h3>
                                <p className="text-sm text-muted">Tell us what you'd like next</p>
                            </Card>
                        </div>
                    </Card>
                </div>

                {/* ---------- Right Panel: Prompt & Generation ---------- */}
                <div className="flex flex-col gap-4 md:w-2/3">
                    {!tokensLoading && selectedModels.length > 0 && !hasEnoughTokens(calculateCost('PLAYGROUND_PER_MODEL', selectedModels.length)) && (
                        <div className="p-4 text-sm font-medium text-red-800 border border-red-200 rounded-lg bg-red-50">
                            ⚠️ Not enough tokens. You need {calculateCost('PLAYGROUND_PER_MODEL', selectedModels.length)} tokens but only have {tokens}.
                        </div>
                    )}

                    {/* Prompt Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="mb-1 text-xl font-semibold">Prompt</h2>
                            <p className="text-sm text-muted">Describe what you want to generate</p>
                        </div>
                        <div className="flex gap-2 items-center">
                            {!tokensLoading && (
                                <>
                                    <span className={`text-sm font-medium ${!hasEnoughTokens(calculateCost('PLAYGROUND_PER_MODEL', selectedModels.length)) && selectedModels.length > 0
                                            ? 'text-red-500'
                                            : 'text-muted'
                                        }`}>
                                        {tokens - calculateCost('PLAYGROUND_PER_MODEL', selectedModels.length)}
                                    </span>
                                    <Coins className={`w-4 h-4 ${selectedModels.length > 0 && !hasEnoughTokens(calculateCost('PLAYGROUND_PER_MODEL', selectedModels.length))
                                            ? 'text-red-500'
                                            : 'text-primary'
                                        }`} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* Prompt Card */}
                    <Card className="flex flex-col flex-1 p-4" animate={false}>
                        <>
                            <PromptInput
                                ref={promptRef}
                                value={prompt}
                                onChange={setPrompt}
                                placeholder="Describe your vision: photorealistic portraits, professional logos, UI mockups, illustrations, advertisements, fashion shots, food photography, architectural renders, packaging designs, editorial layouts, brand materials, and more."
                                label="Prompt"
                                maxLength={1000}
                                disabled={generating}
                                showEnhanceButton={true}
                            />

                            {/* System Prompt Button */}
                            <div className="flex flex-col py-2 items-center justify-center gap-2 lg:flex-row">

                                <Button
                                    variant="ghost"
                                    onClick={() => setShowSystemPromptManager(true)}
                                    className="flex items-center justify-center gap-2 w-full"
                                >
                                    Manage System Prompt
                                </Button>

                                {/* Generate Button */}
                                <Button
                                    onClick={handleGenerate}
                                    disabled={
                                        generating ||
                                        !prompt.trim() ||
                                        selectedModels.length === 0 ||
                                        !hasEnoughTokens(calculateCost('PLAYGROUND_PER_MODEL', selectedModels.length))
                                    }
                                    className="w-full"
                                >
                                    {!hasEnoughTokens(calculateCost('PLAYGROUND_PER_MODEL', selectedModels.length)) && selectedModels.length > 0
                                        ? `Not enough tokens (need ${calculateCost('PLAYGROUND_PER_MODEL', selectedModels.length)})`
                                        : selectedModels.length > 1
                                            ? `Compare ${selectedModels.length} Models (${calculateCost('PLAYGROUND_PER_MODEL', selectedModels.length)} tokens)`
                                            : selectedModels.length === 1
                                                ? `Generate Image (${calculateCost('PLAYGROUND_PER_MODEL', selectedModels.length)} token)`
                                                : 'Generate Image'}
                                </Button>

                            </div>

                            {error && (
                                <div className="p-4 mt-2 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                                    {error}
                                </div>
                            )}
                        </>
                    </Card>
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

            {showSystemPromptManager && (
                <SystemPromptManager
                    onClose={() => setShowSystemPromptManager(false)}
                />
            )}

            {/* Comparison Grid */}
            {results.length > 0 && (
                <div ref={resultsRef} className="max-w-8xl mx-auto mt-6 grid gap-6 lg:grid-cols-[1fr_3fr] xl:grid-cols-[1fr_4fr] p-4">
                    {/* Left Panel / Summary */}
                    <div className="space-y-6">
                        <Card className="p-4 shadow-sm border" animate={false}>
                            <h2 className="text-lg font-semibold mb-4">Prompt</h2>
                            <p className="text-sm text-muted leading-relaxed">{prompt}</p>
                        </Card>

                        <Card className="p-4 shadow-sm border" animate={false}>
                            <h2 className="text-lg font-semibold mb-4">Session Info</h2>
                            <ul className="text-sm space-y-2 text-muted">
                                <li>Total Models: {results.length}</li>
                                <li>Successful: {results.filter(r => r.imageUrl).length}</li>
                                <li>Failed: {results.filter(r => !r.imageUrl).length}</li>
                            </ul>
                        </Card>
                    </div>

                    {/* Right Panel / Main Grid */}
                    <Card className="p-4 shadow-sm border" animate={false}>
                        <ComparisonGrid
                            results={results
                                .map(toComparisonResult)
                                .filter((r): r is ComparisonResult => r !== null)}
                            onSaveResult={handleSaveResult}
                            onReviseResult={handleReviseResult}
                            savingStates={savingStates}
                        />

                        {results.some((r) => !r.imageUrl) && (
                            <div className="p-4 mt-6 text-sm text-orange-700 border border-orange-200 rounded-lg bg-orange-50">
                                Some models failed to generate. This can happen due to rate limits or model availability.
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    )
}