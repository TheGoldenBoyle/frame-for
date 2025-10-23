'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/ImageUpload'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { GenerationLoader } from '@/components/GenerationLoader'
import { PromptInput } from '@/components/PromptInput'
import { useAuth } from '@/hooks/useAuth'
import { useI18n } from '@/lib/i18n/context'

type PresetConfig = {
    id: string
    label: string
    description: string
}

const SINGLE_IMAGE_PRESETS: PresetConfig[] = [
    {
        id: 'professional',
        label: 'Professional Portrait',
        description: 'LinkedIn-style headshot',
    },
    {
        id: 'enhance',
        label: 'Enhance Quality',
        description: 'Improve clarity and sharpness',
    },
    {
        id: 'background',
        label: 'Change Background',
        description: 'New setting, same person',
    },
]

const MULTI_IMAGE_PRESETS: PresetConfig[] = [
    {
        id: 'combine',
        label: 'Combine People',
        description: 'Bring everyone together',
    },
    {
        id: 'memorial',
        label: 'Memorial',
        description: 'Peaceful, elegant composition',
    },
    {
        id: 'family',
        label: 'Family Portrait',
        description: 'Warm, joyful gathering',
    },
]

const BG_STYLES = [
    { value: '', label: 'Keep original' },
    { value: 'beach', label: 'Beach/Ocean' },
    { value: 'garden', label: 'Garden/Nature' },
    { value: 'studio', label: 'Studio/Clean' },
    { value: 'home', label: 'Home/Indoor' },
    { value: 'park', label: 'Park/Outdoor' },
    { value: 'custom', label: 'Custom...' },
]

export default function StudioPage() {
    const router = useRouter()
    const { user } = useAuth()
    const { t } = useI18n()
    const [tokens, setTokens] = useState(3)
    const [files, setFiles] = useState<File[]>([])
    const [preset, setPreset] = useState<string | null>(null)
    const [bgStyle, setBgStyle] = useState('')
    const [customBg, setCustomBg] = useState('')
    const [additionalDetails, setAdditionalDetails] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [photoId, setPhotoId] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [showRevision, setShowRevision] = useState(false)
    const [revisionPrompt, setRevisionPrompt] = useState('')
    const [revising, setRevising] = useState(false)

    useEffect(() => {
        async function fetchTokenBalance() {
            try {
                const response = await fetch('/api/tokens')
                const data = await response.json()
                setTokens(data.tokens)
            } catch (error) {
                console.error('Failed to fetch token balance')
            }
        }
        fetchTokenBalance()
    }, [])

    const availablePresets = files.length === 1 ? SINGLE_IMAGE_PRESETS : MULTI_IMAGE_PRESETS
    const showBackgroundOptions = files.length === 1 && preset === 'background'
    const showBackgroundForMulti = files.length > 1

    const handleFilesChange = (newFiles: File[]) => {
        setFiles(newFiles)
        setPreset(null)
        setError(null)
    }

    const handleGenerate = async () => {
        if (tokens === 0) {
            setError('Out of tokens. Please purchase more in the Dashboard.')
            return
        }

        if (files.length === 0) {
            setError('Please upload at least one photo')
            return
        }

        if (!preset) {
            setError('Please select a style')
            return
        }

        if (showBackgroundOptions && bgStyle === 'custom' && !customBg.trim()) {
            setError('Please enter custom background details')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const formData = new FormData()
            files.forEach((file) => {
                formData.append('images', file)
            })
            formData.append('preset', preset)

            const finalBg = bgStyle === 'custom' ? customBg.trim() : bgStyle
            if (finalBg) {
                formData.append('bgStyle', finalBg)
            }

            if (additionalDetails.trim()) {
                formData.append('additionalDetails', additionalDetails.trim())
            }

            const response = await fetch('/api/studio/generate', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Generation failed')
            }

            setResult(data.imageUrl)
            setPhotoId(data.photoId)

            // Deduct token
            await fetch('/api/tokens/deduct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: 1 })
            })
            setTokens(prev => prev - 1)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleRevise = async () => {
        if (!revisionPrompt.trim() || !photoId) return

        setRevising(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('photoId', photoId)
            formData.append('revisionPrompt', revisionPrompt.trim())

            const response = await fetch('/api/revise', {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Revision failed')
            }

            setResult(data.imageUrl)
            setShowRevision(false)
            setRevisionPrompt('')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setRevising(false)
        }
    }

    const handleStartOver = () => {
        setResult(null)
        setPhotoId(null)
        setShowRevision(false)
        setRevisionPrompt('')
        setFiles([])
        setPreset(null)
        setBgStyle('')
        setCustomBg('')
        setAdditionalDetails('')
        setError(null)
    }

    if (loading) {
        return <GenerationLoader modelCount={1} />
    }

    if (result) {
        return (
            <div className="min-h-screen p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                            ← Back to Dashboard
                        </Button>
                        <div className="text-sm font-medium">
                            Tokens: {tokens}
                        </div>
                    </div>

                    <Card>
                        <h2 className="mb-6 text-2xl font-bold text-center">Your Generated Image</h2>
                        <div className="relative overflow-hidden rounded-lg bg-stone-100">
                            <img
                                src={result}
                                alt="Generated"
                                className="w-full h-auto"
                            />
                        </div>

                        <div className="flex gap-4 mt-6">
                            <Button
                                onClick={() => setShowRevision(!showRevision)}
                                className="flex-1"
                                variant="ghost"
                                disabled={tokens === 0}
                            >
                                {showRevision ? 'Cancel Edit' : 'Quick Edit'}
                            </Button>
                            <Button
                                onClick={handleStartOver}
                                className="flex-1"
                            >
                                Start Over
                            </Button>
                        </div>

                        {showRevision && (
                            <div className="mt-6 space-y-4">
                                <PromptInput
                                    value={revisionPrompt}
                                    onChange={setRevisionPrompt}
                                    placeholder="Example: make grandma bigger, add more flowers, change to sunset lighting"
                                    label="What would you like to change?"
                                    disabled={revising || tokens === 0}
                                />
                                {tokens === 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                        <p className="text-yellow-700">
                                            Out of tokens. Purchase more in the Dashboard to continue editing.
                                        </p>
                                    </div>
                                )}
                                {error && (
                                    <div className="p-4 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                                        {error}
                                    </div>
                                )}
                                <Button
                                    onClick={handleRevise}
                                    disabled={revising || !revisionPrompt.trim() || tokens === 0}
                                    className="w-full"
                                >
                                    {revising ? 'Revising...' : 'Apply Changes'}
                                </Button>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                        ← Back to Dashboard
                    </Button>
                    <div className="text-sm font-medium">
                        Tokens: {tokens}
                    </div>
                </div>

                {tokens === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-4">
                        <p className="text-yellow-700">
                            You're out of tokens. Purchase more in the Dashboard to continue generating images.
                        </p>
                    </div>
                )}

                <Card>
                    <h1 className="mb-2 text-3xl font-bold text-center">BildOro Studio</h1>
                    <p className="mb-8 text-center text-stone-500">
                        Create your perfect image
                    </p>

                    <div className="space-y-6">
                        <div>
                            <label className="block mb-3 text-sm font-medium">
                                Upload Photo{files.length !== 1 ? 's' : ''} (1-3 images)
                            </label>
                            <ImageUpload
                                onImagesChange={handleFilesChange}
                                maxImages={3}
                                disabled={tokens === 0}
                            />
                            {files.length === 0 && (
                                <p className="mt-2 text-sm text-stone-500">
                                    Upload 1 image for enhancements, or 2-3 to combine people
                                </p>
                            )}
                        </div>

                        {files.length > 0 && (
                            <>
                                <div>
                                    <label className="block mb-3 text-sm font-medium">Choose Style</label>
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                                        {availablePresets.map((p) => (
                                            <button
                                                key={p.id}
                                                onClick={() => setPreset(p.id)}
                                                className={`p-4 text-left border-2 rounded-lg transition-all ${preset === p.id
                                                    ? 'border-x-primary text-x-primary'
                                                    : 'border-transparent hover:border-stone-300 text-stone-700'
                                                    }`}
                                                disabled={tokens === 0}
                                            >
                                                <div className="font-medium">{p.label}</div>
                                                <div className="mt-1 text-sm text-stone-500">{p.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {(showBackgroundOptions || showBackgroundForMulti) && (
                                    <div>
                                        <label className="block mb-3 text-sm font-medium">
                                            {showBackgroundOptions ? 'Background' : 'Background (Optional)'}
                                        </label>
                                        <select
                                            value={bgStyle}
                                            onChange={(e) => {
                                                setBgStyle(e.target.value)
                                                if (e.target.value !== 'custom') {
                                                    setCustomBg('')
                                                }
                                            }}
                                            className="w-full px-4 py-3 border rounded-lg border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                                            disabled={tokens === 0}
                                        >
                                            {BG_STYLES.map((style) => (
                                                <option key={style.value} value={style.value}>
                                                    {style.label}
                                                </option>
                                            ))}
                                        </select>

                                        {bgStyle === 'custom' && (
                                            <input
                                                type="text"
                                                value={customBg}
                                                onChange={(e) => setCustomBg(e.target.value)}
                                                placeholder="Describe your background (e.g., mountain sunset, office space)"
                                                className="w-full px-4 py-3 mt-3 border rounded-lg border-stone-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                disabled={tokens === 0}
                                            />
                                        )}
                                    </div>
                                )}

                                <PromptInput
                                    value={additionalDetails}
                                    onChange={setAdditionalDetails}
                                    placeholder="Example: make grandma bigger, add soft lighting, vintage feel"
                                    label="Any Other Details? (Optional)"
                                    disabled={tokens === 0}
                                />

                                {error && (
                                    <div className="p-4 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                                        {error}
                                    </div>
                                )}

                                <Button
                                    onClick={handleGenerate}
                                    disabled={loading || files.length === 0 || !preset || tokens === 0}
                                    className="w-full"
                                >
                                    {tokens === 0 ? 'Out of Tokens' : 'Generate Image'}
                                </Button>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}