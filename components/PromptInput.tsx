import { useState } from 'react'

type PromptInputProps = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    maxLength?: number
    disabled?: boolean
    label?: string
}

export function PromptInput({
    value,
    onChange,
    placeholder = 'Describe the image you want to create...',
    maxLength = 1000,
    disabled = false,
    label = 'Prompt'
}: PromptInputProps) {
    const [isFocused, setIsFocused] = useState(false)
    const charCount = value.length
    const isNearLimit = charCount > maxLength * 0.8

    return (
        <div>
            <label className="block mb-2 text-sm font-medium">
                {label}
            </label>
            <div className="relative">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    maxLength={maxLength}
                    disabled={disabled}
                    className={`w-full px-4 py-3 rounded-lg border resize-none transition-all min-h-[120px] ${isFocused
                            ? 'border-blue-500 ring-2 ring-blue-100'
                            : 'border-stone-300'
                        } ${disabled ? 'bg-stone-50 cursor-not-allowed' : ''} focus:outline-none`}
                />
                <div
                    className={`absolute bottom-3 right-3 text-xs transition-colors ${isNearLimit ? 'text-orange-500 font-medium' : 'text-stone-400'
                        }`}
                >
                    {charCount}/{maxLength}
                </div>
            </div>
        </div>
    )
}