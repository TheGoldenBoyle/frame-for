type Model = {
    id: string
    name: string
    provider: string
    path: string
    description: string
    badge?: string
    speed: 'fast' | 'medium' | 'slow'
}

type ModelSelectorProps = {
    selectedModels: string[]
    onSelect: (modelId: string) => void
    maxSelection?: number
    disabled?: boolean
}

const MODELS: Model[] = [
    {
        id: 'nano-banana',
        name: 'Nano Banana',
        provider: 'Google',
        path: 'google/nano-banana',
        description: 'Latest Gemini 2.5 editing model',
        badge: 'Best for Editing',
        speed: 'fast'
    },
    {
        id: 'flux-1.1-pro',
        name: 'FLUX 1.1 Pro',
        provider: 'Black Forest Labs',
        path: 'black-forest-labs/flux-1.1-pro',
        description: 'Fastest FLUX, excellent quality',
        badge: 'Fastest',
        speed: 'fast'
    },
    {
        id: 'imagen-4',
        name: 'Imagen 4',
        provider: 'Google',
        path: 'google/imagen-4',
        description: 'Google flagship model',
        badge: 'High Quality',
        speed: 'medium'
    },
    {
        id: 'seedream-4',
        name: 'Seedream 4',
        provider: 'ByteDance',
        path: 'bytedance/seedream-4',
        description: 'Up to 4K resolution',
        badge: '4K Support',
        speed: 'medium'
    },
    {
        id: 'ideogram-v3-turbo',
        name: 'Ideogram v3 Turbo',
        provider: 'Ideogram',
        path: 'ideogram-ai/ideogram-v3-turbo',
        description: 'Great text rendering',
        badge: 'Best Text',
        speed: 'fast'
    },
    {
        id: 'recraft-v3',
        name: 'Recraft v3',
        provider: 'Recraft',
        path: 'recraft-ai/recraft-v3',
        description: 'SOTA benchmarks',
        badge: 'Most Versatile',
        speed: 'medium'
    }
]

export function ModelSelector({
    selectedModels,
    onSelect,
    maxSelection = 3,
    disabled = false
}: ModelSelectorProps) {
    const handleSelect = (modelId: string) => {
        if (disabled) return

        if (selectedModels.includes(modelId)) {
            onSelect(modelId)
        } else if (selectedModels.length < maxSelection) {
            onSelect(modelId)
        }
    }

    return (
        <div>
            <label className="block mb-3 text-sm font-medium">
                Select Model{maxSelection > 1 ? `s (up to ${maxSelection})` : ''}
            </label>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {MODELS.map((model) => {
                    const isSelected = selectedModels.includes(model.id)
                    const canSelect = selectedModels.length < maxSelection || isSelected

                    return (
                        <button
                            key={model.id}
                            onClick={() => handleSelect(model.id)}
                            disabled={disabled || !canSelect}
                            className={`p-4 text-left border-2 rounded-lg transition-all relative ${isSelected
                                    ? 'border-blue-500 bg-blue-50'
                                    : canSelect
                                        ? 'border-stone-200 hover:border-stone-300'
                                        : 'border-stone-100 opacity-50 cursor-not-allowed'
                                }`}
                        >
                            {model.badge && (
                                <div className="absolute px-2 py-0.5 text-xs font-medium text-white bg-blue-500 rounded-full top-2 right-2">
                                    {model.badge}
                                </div>
                            )}

                            {isSelected && (
                                <div className="absolute flex items-center justify-center w-6 h-6 text-sm font-bold text-white bg-blue-500 rounded-full top-2 left-2">
                                    {selectedModels.indexOf(model.id) + 1}
                                </div>
                            )}

                            <div className="mt-6 mb-2 font-bold">{model.name}</div>
                            <div className="mb-2 text-xs text-stone-500">{model.provider}</div>
                            <div className="text-sm text-stone-600">{model.description}</div>

                            <div className="flex items-center gap-2 mt-3">
                                <div className={`px-2 py-0.5 text-xs rounded-full ${model.speed === 'fast'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {model.speed === 'fast' ? '⚡ Fast' : '🐢 Medium'}
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export { MODELS }
export type { Model }