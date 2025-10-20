import { useState, forwardRef } from 'react'

type PromptInputProps = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    maxLength?: number
    disabled?: boolean
    label?: string
}

export const PromptInput = forwardRef<HTMLTextAreaElement, PromptInputProps>(
    function PromptInput(
        {
            value,
            onChange,
            placeholder = 'Describe the image you want to create...',
            maxLength = 1000,
            disabled = false,
            label = 'Prompt'
        },
        ref
    ) {
        const [isFocused, setIsFocused] = useState(false)
        const charCount = value.length
        const isNearLimit = charCount > maxLength * 0.8

        return (
            <div className=''>
                <label className="block mb-2 text-sm font-medium text-text">
                    {label}
                </label>
                <div className="relative">
                    <textarea
                        ref={ref}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        maxLength={maxLength}
                        disabled={disabled}
                        className={`w-full px-4 py-3 rounded-lg border resize-none transition-all min-h-[120px] bg-surface text-text placeholder:text-muted ${isFocused
                                ? 'border-primary ring-2 ring-primary/20'
                                : 'border-border'
                            } ${disabled ? 'opacity-60 cursor-not-allowed' : ''} focus:outline-none`}
                    />
                    <div
                        className={`absolute bottom-3 right-3 text-xs transition-colors ${isNearLimit ? 'text-orange-500 font-medium' : 'text-muted'
                            }`}
                    >
                        {charCount}/{maxLength}
                    </div>
                </div>
            </div>
        )
    }
)