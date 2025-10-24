import { useEffect, useState } from 'react'
import { Card } from './ui/Card'

type GenerationLoaderProps = {
    modelCount?: number
    modelNames?: string[]
    hasImage?: boolean
    prompt?: string
}

const MODEL_DISPLAY_NAMES: Record<string, string> = {
    'nano-banana': 'Nano Banana',
    'flux-dev': 'Flux Dev',
    'flux-pro': 'Flux Pro',
    'stable-diffusion': 'Stable Diffusion',
    // Add more as needed
}

export function GenerationLoader({ 
    modelCount = 1, 
    modelNames = [],
    hasImage = false,
    prompt = ''
}: GenerationLoaderProps) {
    const [loadingStep, setLoadingStep] = useState(0)
    const [progress, setProgress] = useState(0)

    const loadingSteps = hasImage 
        ? [
            'Uploading your image...',
            `Initializing ${modelCount > 1 ? modelNames.length + ' AI models' : 'AI model'}...`,
            'Analyzing image composition...',
            'Extracting visual features...',
            'Processing prompt...',
            'Generating variations...',
            'Enhancing quality...',
            'Applying final touches...',
            'Almost there...'
          ]
        : [
            'Processing your prompt...',
            `Initializing ${modelCount > 1 ? modelNames.length + ' AI models' : 'AI model'}...`,
            'Understanding context...',
            'Building composition...',
            'Rendering details...',
            'Enhancing quality...',
            'Applying final touches...',
            'Almost there...'
          ]

    useEffect(() => {
        const stepDuration = 2000
        const progressInterval = 50

        const stepTimer = setInterval(() => {
            setLoadingStep((prev) => {
                if (prev < loadingSteps.length - 1) {
                    return prev + 1
                }
                return prev
            })
        }, stepDuration)

        const progressTimer = setInterval(() => {
            setProgress((prev) => {
                const increment = Math.random() * 3
                if (prev < 90) {
                    return Math.min(prev + increment, 90)
                }
                return prev
            })
        }, progressInterval)

        return () => {
            clearInterval(stepTimer)
            clearInterval(progressTimer)
        }
    }, [loadingSteps.length])

    const displayModelNames = modelNames
        .map(id => MODEL_DISPLAY_NAMES[id] || id)
        .join(', ')

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <Card className="max-w-lg mx-4 w-full">
                <div className="space-y-6">
                    {/* Spinner */}
                    <div className="flex justify-center">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-3 border-primary/15 rounded-full"></div>
                            <div 
                                className="absolute inset-0 border-3 border-transparent border-t-primary border-r-primary/50 rounded-full animate-spin"
                                style={{ animationDuration: '0.8s' }}
                            ></div>
                        </div>
                    </div>

                    {/* Title and Models */}
                    <div className="text-center">
                        <h3 className="mb-2 text-xl font-bold text-text">
                            {modelCount > 1 ? `Generating ${modelCount} Images` : 'Creating Your Image'}
                        </h3>
                        {modelNames.length > 0 && (
                            <p className="text-sm font-medium text-muted mb-1">
                                Using: {displayModelNames}
                            </p>
                        )}
                        <p className="text-sm text-muted">{loadingSteps[loadingStep]}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 overflow-hidden rounded-full bg-border">
                        <div 
                            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {/* Prompt Preview */}
                    {prompt && (
                        <div className="p-3 text-xs text-muted bg-surface rounded-lg border border-border">
                            <span className="font-medium">Prompt:</span> {prompt.slice(0, 100)}{prompt.length > 100 ? '...' : ''}
                        </div>
                    )}

                    {/* Info */}
                    <p className="text-xs text-center text-muted">
                        This may take 10-40 seconds depending on model complexity
                    </p>
                </div>
            </Card>
        </div>
    )
}