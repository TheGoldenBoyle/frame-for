import { ResultCard } from './ResultCard'

type ComparisonResult = {
    modelId: string
    modelName: string
    imageUrl: string
}

type ComparisonGridProps = {
    results: ComparisonResult[]
    originalImageUrl?: string
    onSaveResult?: (modelId: string) => void
    savingStates?: Record<string, boolean>
}

export function ComparisonGrid({
    results,
    originalImageUrl,
    onSaveResult,
    savingStates = {}
}: ComparisonGridProps) {
    if (results.length === 0) return null

    return (
        <div className={`grid gap-6 ${results.length === 1
                ? 'grid-cols-1 max-w-2xl mx-auto'
                : results.length === 2
                    ? 'grid-cols-1 md:grid-cols-2'
                    : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
            {results.map((result) => (
                <ResultCard
                    key={result.modelId}
                    imageUrl={result.imageUrl}
                    modelName={result.modelName}
                    originalImageUrl={originalImageUrl}
                    onSave={onSaveResult ? () => onSaveResult(result.modelId) : undefined}
                    saving={savingStates[result.modelId]}
                />
            ))}
        </div>
    )
}