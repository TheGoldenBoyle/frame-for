'use client'

import { useState, useEffect, forwardRef } from 'react'

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
  mode?: string // for fetching default/user prompt
  onManagePrompts?: () => void
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
      mode = 'expand',
      onManagePrompts,
    },
    ref
  ) => {
    const [enhancing, setEnhancing] = useState(false)
    const [enhanceOptionsVisible, setEnhanceOptionsVisible] = useState(false)
    const [enhancedResult, setEnhancedResult] = useState<EnhancedResult | null>(null)
    const [loadingPrompt, setLoadingPrompt] = useState(true)

    // Fetch default or user override on mount
    useEffect(() => {
      const fetchPrompt = async () => {
        try {
          const res = await fetch(`/api/playground/prompts?mode=${mode}`)
          if (!res.ok) throw new Error('Failed to fetch prompt')
          const data = await res.json()
          if (data?.systemPrompt) onChange(data.systemPrompt)
        } catch (err) {
          console.error('Prompt fetch error:', err)
        } finally {
          setLoadingPrompt(false)
        }
      }
      fetchPrompt()
    }, [mode, onChange])

    const handleEnhanceClick = () => setEnhanceOptionsVisible(true)

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
        onChange(data.enhancedPrompt)
      } catch (err: any) {
        console.error(err)
        alert(err?.message || 'Failed to enhance prompt')
      } finally {
        setEnhancing(false)
        setEnhanceOptionsVisible(false)
      }
    }

    return (
      <div className="flex flex-col gap-3">
        <label className="text-sm font-semibold">{label}</label>

        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled || loadingPrompt}
          className="w-full min-h-[150px] p-3 border rounded-lg resize-none bg-gray-900 text-white border-primary focus:ring-2 focus:ring-primary focus:border-primary"
        />

        <div className="flex items-center gap-2">
          {showEnhanceButton && (
            <button
              onClick={handleEnhanceClick}
              disabled={enhancing || value.trim().length === 0 || loadingPrompt}
              className="px-3 py-1.5 rounded bg-primary text-white hover:bg-primary/90 disabled:opacity-50"
            >
              {enhancing ? 'Enhancing...' : 'Enhance'}
            </button>
          )}

          {onManagePrompts && (
            <button
              onClick={onManagePrompts}
              className="px-3 py-1.5 rounded border border-primary text-primary hover:bg-primary/10"
            >
              Manage Prompts
            </button>
          )}
        </div>

        {/* Inline enhancement options */}
        {enhanceOptionsVisible && (
          <div className="flex flex-wrap gap-2 mt-2 bg-gray-800 p-2 rounded">
            {ENHANCE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className="px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm"
                onClick={() => handleEnhanceOption(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {/* Preview of enhanced prompt */}
        {enhancedResult && (
          <div className="mt-2 p-2 border rounded bg-gray-800">
            <p className="text-xs text-gray-400 mb-1">Enhanced Preview:</p>
            <div className="text-white text-sm">{enhancedResult.enhanced}</div>
          </div>
        )}
      </div>
    )
  }
)
PromptInput.displayName = 'PromptInput'
