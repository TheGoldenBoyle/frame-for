import { ResultCard } from './ResultCard'
import { ComparisonResult } from '@/types/globals'

type ComparisonGridProps = {
    results: ComparisonResult[]
    originalImageUrl?: string
    onSaveResult?: (modelId: string) => void
    onReviseResult?: (modelId: string) => void
    onStartFresh?: () => void
    savingStates?: Record<string, boolean>
}

export function ComparisonGrid({
    results,
    originalImageUrl,
    onSaveResult,
    onReviseResult,
    savingStates = {},
}: ComparisonGridProps) {
    if (results.length === 0) return null

    const validResults = results.filter((result) => result.imageUrl)
    const resultCount = validResults.length

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
            {validResults.map((result, index) => (
                <div
                    key={result.modelId}
                    className="animate-scale-in opacity-0 w-full"
                    style={{
                        animationDelay: `${index * 0.08}s`,
                        animationFillMode: 'forwards',
                    }}
                >
                    <ResultCard
                        imageUrl={result.imageUrl}
                        modelName={result.modelName}
                        originalImageUrl={originalImageUrl}
                        onSave={onSaveResult ? () => onSaveResult(result.modelId) : undefined}
                        onRevise={onReviseResult ? () => onReviseResult(result.modelId) : undefined}
                        saving={savingStates[result.modelId]}
                    />
                </div>
            ))}
        </div>
    )
}