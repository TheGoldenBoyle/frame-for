'use client'

import { useState, forwardRef } from 'react'
import { Button } from '@/components/ui/Button'

type EnhancementMode = 'minimal' | 'polish' | 'expand' | 'technical' | 'creative'

const ENHANCE_OPTIONS: { value: EnhancementMode; label: string }[] = [
    { value: 'minimal', label: 'Minimal' },
    { value: 'polish', label: 'Polish' },
    { value: 'expand', label: 'Expand' },
    { value: 'technical', label: 'Technical' },
    { value: 'creative', label: 'Creative' },
]

type PromptInputProps = {
    value: string
    onChange: (val: string) => void
    label?: string
    placeholder?: string
    maxLength?: number
    disabled?: boolean
    showEnhanceButton?: boolean
}

type EnhancedResult = {
    original: string
    enhanced: string
}

export const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(
    (
        {
            value,
            onChange,
            label = 'Prompt',
            placeholder = 'Type your prompt here...',
            maxLength = 1000,
            disabled = false,
            showEnhanceButton = true,
        },
        ref
    ) => {
        const [enhancing, setEnhancing] = useState(false)
        const [enhanceOptionsVisible, setEnhanceOptionsVisible] = useState(false)
        const [enhancedResult, setEnhancedResult] = useState<EnhancedResult | null>(null)

        const handleEnhanceClick = () => setEnhanceOptionsVisible(!enhanceOptionsVisible)

        const handleEnhanceOption = async (mode: EnhancementMode) => {
            setEnhancing(true)
            try {
                const res = await fetch('/api/playground/enhance-prompt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: value, mode }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Enhancement failed')
                setEnhancedResult({ original: value, enhanced: data.enhancedPrompt })
            } catch (err: any) {
                console.error(err)
                alert(err?.message || 'Failed to enhance prompt')
            } finally {
                setEnhancing(false)
                setEnhanceOptionsVisible(false)
            }
        }

        const handleReplaceInput = () => {
            if (enhancedResult) {
                onChange(enhancedResult.enhanced)
                setEnhancedResult(null)
            }
        }

        return (
            <div className="flex flex-col gap-4">
                {label && <label className="text-sm font-semibold text-text">{label}</label>}

                <textarea
                    ref={ref}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    disabled={disabled}
                    className="w-full min-h-[250px] p-3 border border-border rounded-lg resize-none bg-surface text-text placeholder:text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary/40 focus:outline-none transition-all"
                />

                <div className="flex items-center justify-between text-xs text-muted flex-wrap">
                    <span>{value.length} / {maxLength} characters</span>

  
                    <div className="flex flex-col md:justify-between md:flex-row md:items-center gap-2 w-full md:w-auto">
                        {!enhancedResult && (
                            <p className="text-sm text-muted italic md:text-center">
                                Free — recommended AI enhancement
                            </p>
                        )}


                        {showEnhanceButton && (
                            <Button
                                onClick={handleEnhanceClick}
                                size="sm"
                                variant="secondary"
                                disabled={enhancing || value.trim().length === 0}
                            >
                                {enhancing ? 'Enhancing...' : enhanceOptionsVisible ? 'Hide Options' : 'Enhance'}
                            </Button>
                        )}
                    </div>


                </div>


                {enhanceOptionsVisible && (
                    <div className="flex flex-wrap gap-2 p-3 border border-border rounded-lg bg-surface/60">
                        <p className="w-full text-xs font-medium text-muted mb-1">
                            Choose enhancement style:
                        </p>
                        {ENHANCE_OPTIONS.map((opt) => (
                            <Button
                                key={opt.value}
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEnhanceOption(opt.value)}
                                disabled={enhancing}
                            >
                                {opt.label}
                            </Button>
                        ))}
                    </div>
                )}

                {enhancedResult && (
                    <div className="group relative flex flex-col gap-3 p-4 border border-border rounded-lg bg-surface/70 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-border/80">
                        <div className="overflow-y-auto max-h-[180px] pr-1">
                            <p className="text-xs font-medium text-muted mb-1 flex items-center gap-1.5">
                                ✨ <span>Enhanced Suggestion:</span>
                            </p>
                            <div className="text-sm text-text whitespace-pre-wrap leading-relaxed">
                                {enhancedResult.enhanced}
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEnhancedResult(null)}
                            >
                                Dismiss
                            </Button>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleReplaceInput}
                            >
                                Replace Input
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        )
    }
)

PromptInput.displayName = 'PromptInput'
