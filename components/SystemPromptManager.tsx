'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { X, Sparkles, RotateCcw } from 'lucide-react'

type SystemPromptTemplate = {
    id: string
    name: string
    promptTemplate: string
    isDefault: boolean
    isActive: boolean
}

type SystemPromptManagerProps = {
    onClose: () => void
}

const EXAMPLE_TEMPLATES = [
    {
        name: 'Marketing Agency',
        template: `Generate a professional, clean marketing asset for {USER_PROMPT}.

Brand Style: Modern, minimalist, corporate
Colors: Blue (#0066CC), White, Light Gray
Guidelines:
- Ample white space
- Clean typography
- Professional photography style
- Suitable for presentations and social media`
    },
    {
        name: 'E-commerce Product',
        template: `Create a product photography image for {USER_PROMPT}.

Style: Natural, lifestyle photography
Background: Neutral or white
Lighting: Soft, even lighting
Guidelines:
- Show product clearly
- Warm, inviting tones
- Organic, earthy aesthetic
- Lifestyle context when appropriate`
    },
    {
        name: 'Cyberpunk Theme',
        template: `Generate a cyberpunk-style image of {USER_PROMPT}.

Style: Neon-lit, dystopian future
Colors: Purple, cyan, magenta neon glow
Mood: Dark, high-tech, urban
Guidelines:
- Rain-slicked streets
- Holographic elements
- Futuristic technology
- Atmospheric fog/haze`
    }
]

export function SystemPromptManager({ onClose }: SystemPromptManagerProps) {
    const [activePrompt, setActivePrompt] = useState<SystemPromptTemplate | null>(null)
    const [customPrompt, setCustomPrompt] = useState('')
    const [customName, setCustomName] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [showExamples, setShowExamples] = useState(false)

    // Load current active prompt
    useEffect(() => {
        fetchActivePrompt()
    }, [])

    const fetchActivePrompt = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/playground/system-prompt')
            if (res.ok) {
                const data = await res.json()
                setActivePrompt(data)
                if (!data.isDefault) {
                    setCustomPrompt(data.promptTemplate)
                    setCustomName(data.name)
                }
            }
        } catch (error) {
            console.error('Failed to fetch system prompt:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveCustom = async () => {
        if (!customPrompt.trim() || !customName.trim()) {
            alert('Please enter both name and template')
            return
        }

        if (!customPrompt.includes('{USER_PROMPT}')) {
            alert('Template must include {USER_PROMPT} placeholder')
            return
        }

        setSaving(true)
        try {
            const res = await fetch('/api/playground/system-prompt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: customName,
                    promptTemplate: customPrompt
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to save')
            }

            const savedPrompt = await res.json()
            setActivePrompt(savedPrompt)
            alert('✅ Custom system prompt saved!')
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    const handleResetToDefault = async () => {
        if (!confirm('Reset to default system prompt?')) return

        setSaving(true)
        try {
            const res = await fetch('/api/playground/system-prompt', {
                method: 'DELETE'
            })

            if (!res.ok) {
                throw new Error('Failed to reset')
            }

            const defaultPrompt = await res.json()
            setActivePrompt(defaultPrompt)
            setCustomPrompt('')
            setCustomName('')
            alert('✅ Reset to default system prompt!')
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Failed to reset')
        } finally {
            setSaving(false)
        }
    }

    const handleUseExample = (example: typeof EXAMPLE_TEMPLATES[0]) => {
        setCustomName(example.name)
        setCustomPrompt(example.template)
        setShowExamples(false)
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-3xl p-6">
                    <p className="text-center text-muted">Loading...</p>
                </Card>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-4xl p-6 my-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">System Prompt Manager</h2>
                        <p className="text-sm text-muted">
                            Customize how AI interprets your prompts. Add brand guidelines, style preferences, or company info.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-surface rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Current Active Prompt */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <h3 className="font-semibold">Currently Active</h3>
                        {activePrompt?.isDefault && (
                            <span className="text-xs px-2 py-0.5 rounded bg-muted/20 text-muted">
                                Default
                            </span>
                        )}
                    </div>
                    <div className="p-4 bg-surface/60 rounded-lg border border-border">
                        <p className="text-sm font-medium mb-2">{activePrompt?.name}</p>
                        <p className="text-xs text-muted whitespace-pre-wrap font-mono">
                            {activePrompt?.promptTemplate}
                        </p>
                    </div>
                </div>

                {/* Custom Prompt Editor */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Create Custom System Prompt</h3>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowExamples(!showExamples)}
                        >
                            {showExamples ? 'Hide' : 'Show'} Examples
                        </Button>
                    </div>

                    {/* Examples */}
                    {showExamples && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {EXAMPLE_TEMPLATES.map((example) => (
                                <Card
                                    key={example.name}
                                    className="p-4 cursor-pointer hover:border-primary transition-colors"
                                    onClick={() => handleUseExample(example)}
                                >
                                    <h4 className="font-medium text-sm mb-2">{example.name}</h4>
                                    <p className="text-xs text-muted line-clamp-3">
                                        {example.template}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Template Name
                        </label>
                        <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="e.g., My Brand Style"
                            className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Template Input */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            System Prompt Template
                            <span className="text-muted ml-2 font-normal">
                                (must include <code className="bg-muted/20 px-1 rounded">{'{USER_PROMPT}'}</code>)
                            </span>
                        </label>
                        <textarea
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            placeholder={`Generate a high-quality image for {USER_PROMPT}.

Add your brand guidelines, style preferences, colors, etc.

Example:
- Brand colors: Blue, White
- Style: Modern, minimalist
- Always include professional lighting`}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm min-h-[300px] resize-none"
                        />
                        <p className="text-xs text-muted mt-2">
                            The <code className="bg-muted/20 px-1 rounded">{'{USER_PROMPT}'}</code> placeholder will be replaced with the user's actual prompt.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-4">
                        <Button
                            onClick={handleSaveCustom}
                            disabled={saving || !customPrompt.trim() || !customName.trim()}
                            className="flex-1"
                        >
                            {saving ? 'Saving...' : 'Save & Activate'}
                        </Button>

                        {!activePrompt?.isDefault && (
                            <Button
                                variant="ghost"
                                onClick={handleResetToDefault}
                                disabled={saving}
                                className=""
                            >

                                Reset to Default
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    )
}