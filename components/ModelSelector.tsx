import { Zap, Clock } from 'lucide-react'

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
            <label className="block mb-3 text-sm font-medium text-text">
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
                                    ? 'border-primary bg-primary/10'
                                    : canSelect
                                        ? 'border-border hover:border-primary/50 bg-surface'
                                        : 'border-border opacity-50 cursor-not-allowed bg-surface'
                                }`}
                        >
                            {model.badge && (
                                <div className="absolute px-2 py-1 text-xs font-medium text-white bg-primary rounded-full top-2 right-2">
                                    {model.badge}
                                </div>
                            )}

                            {isSelected && (
                                <div className="absolute flex items-center justify-center w-6 h-6 text-sm font-bold text-white rounded-full bg-primary top-2 left-2">
                                    {selectedModels.indexOf(model.id) + 1}
                                </div>
                            )}

                            <div className="mt-6 mb-2 font-bold text-text">{model.name}</div>
                            <div className="mb-2 text-xs text-muted">{model.provider}</div>
                            <div className="text-sm text-muted">{model.description}</div>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}