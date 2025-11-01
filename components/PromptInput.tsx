import { useState, forwardRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'

type PromptInputProps = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    maxLength?: number
    disabled?: boolean
    label?: string
    className?: string
    showEnhanceButton?: boolean
}

export const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(
    function PromptInput(
        {
            value,
            onChange,
            placeholder = 'Describe the image you want to create...',
            maxLength = 1000,
            disabled = false,
            label = 'Prompt',
            className = '',
            showEnhanceButton = true
        },
        ref
    ) {
        const [isFocused, setIsFocused] = useState(false)
        const [enhancing, setEnhancing] = useState(false)
        const [enhancementCount, setEnhancementCount] = useState(0)

        const charCount = value.length
        const isNearLimit = charCount > maxLength * 0.8
        const canEnhance = value.trim().length > 0 && enhancementCount < 3

        const handleEnhance = async () => {
            if (!canEnhance || enhancing) return

            setEnhancing(true)

            try {
                const response = await fetch('/api/playground/enhance-prompt', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: value.trim(),
                        enhancementCount
                    })
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Enhancement failed')
                }

                // Smooth update with a slight delay for effect
                setTimeout(() => {
                    onChange(data.enhancedPrompt)
                    setEnhancementCount(data.enhancementCount)
                }, 100)
            } catch (error) {
                console.error('Enhancement error:', error)
                alert(error instanceof Error ? error.message : 'Failed to enhance prompt')
            } finally {
                setEnhancing(false)
            }
        }

        return (
            <div className={`flex flex-col flex-1 ${className}`}>
                <label className="block mb-2 text-sm font-medium text-text">
                    {label}
                </label>
                <div className="relative flex flex-col flex-1 gap-3">
                    <div className="relative flex-1">
                        <textarea
                            ref={ref}
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder={placeholder}
                            maxLength={maxLength}
                            disabled={disabled || enhancing}
                            className={`w-full h-full min-h-[200px] px-4 py-3 rounded-lg border resize-none transition-all bg-surface text-text placeholder:text-muted ${isFocused
                                    ? 'border-primary ring-2 ring-primary/20'
                                    : 'border-border'
                                } ${disabled || enhancing ? 'opacity-60 cursor-not-allowed' : ''} focus:outline-none`}
                        />
                        <div
                            className={`absolute bottom-3 right-3 text-xs transition-colors ${isNearLimit ? 'text-orange-500 font-medium' : 'text-muted'
                                }`}
                        >
                            {charCount}/{maxLength}
                        </div>
                    </div>

                    {value.match(/\[PLACEHOLDER:[^\]]+\]/g) && (
                        <div className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-surface/50 border border-border">
                            <span style={{ color: '#d4af37' }}>💡</span>
                            <span className="text-muted">
                                Replace{' '}
                                <span style={{ color: '#d4af37', fontWeight: '600' }}>
                                    [PLACEHOLDER]
                                </span>
                                {' '}fields with your specific details
                            </span>
                        </div>
                    )}

                    {showEnhanceButton && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={handleEnhance}
                                disabled={!canEnhance || enhancing || disabled}
                                className="flex justify-center items-center gap-2"
                            >
                                {enhancing ? (
                                    <>
                                        <div className="w-3 h-3">
                                            <Loader size="sm" />
                                        </div>
                                        <span>Enhancing...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                                            />
                                        </svg>
                                        <span>Enhance with AI</span>
                                        {enhancementCount > 0 && (
                                            <span className="text-xs text-muted">
                                                ({enhancementCount}/3)
                                            </span>
                                        )}
                                    </>
                                )}
                            </Button>

                            {canEnhance && !enhancing && (
                                <span className="text-xs font-medium" style={{ color: '#d4af37' }}>
                                    Free • Recommended!
                                </span>
                            )}

                            {enhancementCount >= 3 && (
                                <span className="text-xs text-muted">
                                    Max enhancements reached
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )
    }
)