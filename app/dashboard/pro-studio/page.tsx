'use client'

import { useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'
import { GenerationLoader } from '@/components/GenerationLoader'
import { ChatInterface } from '@/components/pro-studio/ChatInterface'
import { GenerationControls } from '@/components/pro-studio/GenerationControls'
import { ResultsGrid } from '@/components/pro-studio/ResultGrid'

const TOKENS_PER_IMAGE = 3

type Result = {
    index: number
    imageUrl: string | null
    error?: string
}

export default function ProStudioPage() {
    const router = useRouter()
    const { user } = useAuth()
    const [prompt, setPrompt] = useState('')
    const [imageCount, setImageCount] = useState(1)
    const [generating, setGenerating] = useState(false)
    const [results, setResults] = useState<Result[]>([])
    const [batchId, setBatchId] = useState<string | null>(null)
    const [error, setError] = useState<string | ReactNode | null>(null)
    const [loading, setLoading] = useState(false)

    const handlePromptSelect = (selectedPrompt: string) => {
        setPrompt(selectedPrompt)
    }

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt')
            return
        }
    
        setGenerating(true)
        setError(null)
        setResults([])
        setBatchId(null)
    
        try {
            const response = await fetch('/api/pro-studio/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt.trim(),
                    imageCount,
                }),
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
                throw new Error(data.error || 'Generation failed')
            }
    
            setResults(data.results || [])
            setBatchId(data.batchId)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong')
        } finally {
            setGenerating(false)
        }
    }

    const handleRevisionComplete = () => {
        window.location.reload()
    }

    const handleStartOver = () => {
        setPrompt('')
        setImageCount(1)
        setResults([])
        setBatchId(null)
        setError(null)
    }

    if (loading) {
        return <Loader fullScreen />
    }

    if (generating) {
        return (
            <GenerationLoader
                modelCount={imageCount}
                modelNames={['flux-1.1-pro']}
                hasImage={false}
                prompt={prompt}
            />
        )
    }

    if (results.length > 0 && batchId) {
        return (
            <div className="min-h-screen p-4 md:p-8">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between mb-8">
                        <Button variant="ghost" onClick={() => router.push('/dashboard')}>
                            Dashboard
                        </Button>
                        <Button variant="ghost" onClick={handleStartOver}>
                            Start Over
                        </Button>
                    </div>

                    <ResultsGrid
                        results={results}
                        batchId={batchId}
                        prompt={prompt}
                        onRevisionComplete={handleRevisionComplete}
                    />
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen">
            <div className="flex items-center justify-between flex-shrink-0 mb-6 md:mb-8">
                <div>
                    <h1 className="mb-1 text-2xl font-bold md:mb-2 md:text-3xl">Pro Studio</h1>
                    <p className="text-sm md:text-base text-muted">
                        Hyper-realistic generation with AI-powered prompt assistance
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
                <div>
                    <ChatInterface
                        onPromptSelect={handlePromptSelect}
                        disabled={generating}
                    />
                </div>

                <div className="lg:sticky lg:top-6">
                    <GenerationControls
                        imageCount={imageCount}
                        onImageCountChange={setImageCount}
                        prompt={prompt}
                        onPromptChange={setPrompt}
                        onGenerate={handleGenerate}
                        generating={generating}
                        tokensPerImage={TOKENS_PER_IMAGE}
                    />
                </div>
            </div>

            {error && (
                <div className="flex-shrink-0 p-4 mt-6 text-sm text-red-600 border border-red-200 rounded-lg bg-red-50">
                    {error}
                </div>
            )}
        </div>
    )
}