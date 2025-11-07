import { ResultCard } from './ResultCard'
import { ErrorCard } from '@/components/ui/ErrorCard'

// Use the PlaygroundResult type which includes error
type PlaygroundResult = {
    modelId: string
    modelName: string
    imageUrl: string | null
    error?: string
}

type ComparisonGridProps = {
    results: PlaygroundResult[]
    prompt?: string
    playgroundPhotoId?: string
    originalImageUrl?: string
    onReviseResult?: (modelId: string) => void
    onRetryModel?: (modelId: string) => void
}

export function ComparisonGrid({
    results,
    prompt,
    playgroundPhotoId,
    originalImageUrl,
    onReviseResult,
    onRetryModel,
}: ComparisonGridProps) {
    if (results.length === 0) return null

    const resultCount = results.length

    // Optimized grid layout for maximum image size
    const getGridClass = () => {
        if (resultCount === 1) return 'grid-cols-1 max-w-3xl mx-auto'
        if (resultCount === 2) return 'grid-cols-1 lg:grid-cols-2'
        if (resultCount === 3) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
        if (resultCount === 4) return 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-4'
        // 5 results
        return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
    }

    return (
        <div className={`grid ${getGridClass()} gap-3 sm:gap-4 lg:gap-6 w-full`}>
            {results.map((result, index) => (
                <div
                    key={result.modelId}
                    className="animate-scale-in opacity-0 w-full"
                    style={{
                        animationDelay: `${index * 0.08}s`,
                        animationFillMode: 'forwards',
                    }}
                >
                    {result.imageUrl ? (
                        <ResultCard
                            imageUrl={result.imageUrl}
                            modelName={result.modelName}
                            prompt={prompt}
                            playgroundPhotoId={playgroundPhotoId}
                            originalImageUrl={originalImageUrl}
                            onRevise={onReviseResult ? () => onReviseResult(result.modelId) : undefined}
                        />
                    ) : (
                        <ErrorCard
                            modelName={result.modelName}
                            error={result.error || 'Unknown error'}
                            onRetry={onRetryModel ? () => onRetryModel(result.modelId) : undefined}
                        />
                    )}
                </div>
            ))}
        </div>
    )
}