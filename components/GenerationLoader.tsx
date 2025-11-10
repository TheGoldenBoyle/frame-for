import { useEffect, useState } from 'react'
import { Card } from './ui/Card'
import { Film } from 'lucide-react'

type GenerationLoaderProps = {
    modelCount?: number
    modelNames?: string[]
    hasImage?: boolean
    prompt?: string
    isRevision?: boolean
    isVideo?: boolean
    videoDuration?: "short" | "long"
}

const MODEL_DISPLAY_NAMES: Record<string, string> = {
    // Image models
    'nano-banana': 'Nano Banana',
    'flux-dev': 'Flux Dev',
    'flux-pro': 'Flux Pro',
    'flux-1.1-pro': 'FLUX 1.1 Pro',
    'stable-diffusion': 'Stable Diffusion',
    'imagen-4': 'Imagen 4',
    'seedream-4': 'Seedream 4',
    'ideogram-v3-turbo': 'Ideogram v3 Turbo',
    'recraft-v3': 'Recraft v3',
    // Video models
    'veo-3.1-fast': 'Veo 3.1 Fast',
    'kling-2.5-turbo-pro': 'Kling 2.5 Turbo Pro',
    'wan-2.5': 'WAN 2.5',
}

export function GenerationLoader({ 
    modelCount = 1, 
    modelNames = [],
    hasImage = false,
    prompt = '',
    isRevision = false,
    isVideo = false,
    videoDuration = "short"
}: GenerationLoaderProps) {
    const [loadingStep, setLoadingStep] = useState(0)
    const [progress, setProgress] = useState(0)

    const loadingSteps = isVideo
        ? [
            'Analyzing source image...',
            `Initializing ${modelCount > 1 ? modelNames.length + ' video models' : 'video model'}...`,
            'Understanding motion context...',
            'Calculating frame transitions...',
            'Generating keyframes...',
            'Interpolating motion...',
            'Rendering video frames...',
            'Processing temporal consistency...',
            'Applying motion blur...',
            'Optimizing video quality...',
            'Encoding final video...',
            'Almost done...'
          ]
        : isRevision
        ? [
            'Analyzing your changes...',
            'Initializing Nano Banana AI...',
            'Processing edit mask...',
            'Understanding modifications...',
            'Applying revisions...',
            'Refining details...',
            'Almost done...'
          ]
        : hasImage 
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
        // Video generation takes longer
        const stepDuration = isVideo ? 3000 : isRevision ? 1500 : 2000
        const progressInterval = isVideo ? 100 : 50

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
                // Video generation progresses slower
                const increment = isVideo ? Math.random() * 1.5 : Math.random() * 3
                const maxProgress = isVideo ? 85 : 90
                if (prev < maxProgress) {
                    return Math.min(prev + increment, maxProgress)
                }
                return prev
            })
        }, progressInterval)

        return () => {
            clearInterval(stepTimer)
            clearInterval(progressTimer)
        }
    }, [loadingSteps.length, isRevision, isVideo])

    const displayModelNames = isRevision 
        ? 'Nano Banana'
        : modelNames
            .map(id => MODEL_DISPLAY_NAMES[id] || id)
            .join(', ')

    const estimatedTime = isVideo 
        ? videoDuration === "long" 
            ? '90-180 seconds'
            : '60-120 seconds'
        : isRevision 
            ? '5-15 seconds'
            : '10-40 seconds'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <Card className="max-w-lg mx-4 w-full">
                <div className="space-y-6">
                    {/* Spinner with optional film icon for video */}
                    <div className="flex justify-center">
                        <div className="relative w-16 h-16">
                            {isVideo && (
                                <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <Film className="w-8 h-8 text-primary animate-pulse" />
                                </div>
                            )}
                            <div className="absolute inset-0 border-3 border-primary/15 rounded-full"></div>
                            <div 
                                className="absolute inset-0 border-3 border-transparent border-t-primary border-r-primary/50 rounded-full animate-spin"
                                style={{ animationDuration: isVideo ? '1.2s' : '0.8s' }}
                            ></div>
                        </div>
                    </div>

                    {/* Title and Models */}
                    <div className="text-center">
                        <h3 className="mb-2 text-xl font-bold text-text">
                            {isVideo
                                ? modelCount > 1 
                                    ? `Generating ${modelCount} Videos` 
                                    : 'Creating Your Video'
                                : isRevision 
                                    ? 'Revising Your Image'
                                    : modelCount > 1 
                                        ? `Generating ${modelCount} Images` 
                                        : 'Creating Your Image'
                            }
                        </h3>
                        {(modelNames.length > 0 || isRevision) && (
                            <p className="text-sm font-medium text-muted mb-1">
                                Using: {displayModelNames}
                            </p>
                        )}
                        {isVideo && videoDuration && (
                            <p className="text-xs text-muted mb-1">
                                Duration: {videoDuration}s video
                            </p>
                        )}
                        <p className="text-sm text-muted">{loadingSteps[loadingStep]}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 overflow-hidden rounded-full bg-background">
                        <div 
                            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {/* Progress Percentage for Video (takes longer) */}
                    {isVideo && (
                        <div className="text-center">
                            <span className="text-sm font-medium text-primary">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    )}

                    {/* Prompt Preview */}
                    {prompt && (
                        <div className="p-3 text-xs text-muted bg-surface/50 rounded-lg border border-border">
                            <span className="font-medium">
                                {isVideo ? 'Motion:' : isRevision ? 'Revision:' : 'Prompt:'}
                            </span> {prompt.slice(0, 100)}{prompt.length > 100 ? '...' : ''}
                        </div>
                    )}

                    {/* Info */}
                    <div className="space-y-2">
                        <p className="text-xs text-center text-muted">
                            Estimated time: {estimatedTime}
                        </p>
                        {isVideo && (
                            <p className="text-xs text-center text-muted">
                                💡 Video generation takes longer than images. 
                                {modelCount > 1 && ` Processing ${modelCount} models simultaneously.`}
                            </p>
                        )}
                    </div>

                    {/* Model Status Indicators (for multiple models) */}
                    {modelCount > 1 && modelNames.length > 0 && (
                        <div className="pt-4 border-t border-border">
                            <p className="text-xs font-medium text-muted mb-2 text-center">
                                {isVideo ? 'Video Models' : 'Image Models'} Processing:
                            </p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {modelNames.map((modelId, index) => (
                                    <div
                                        key={modelId}
                                        className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-2"
                                        style={{
                                            animationDelay: `${index * 0.2}s`
                                        }}
                                    >
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                        {MODEL_DISPLAY_NAMES[modelId] || modelId}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}