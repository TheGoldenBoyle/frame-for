import { ResultCard } from './ResultCard'
import { ComparisonResult } from '@/types/globals'
import { Button } from './ui/Button'
import { RotateCcw } from 'lucide-react'

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
    onStartFresh,
    savingStates = {},
}: ComparisonGridProps) {
    if (results.length === 0) return null

    const validResults = results.filter((result) => result.imageUrl)

    // Responsive grid that adapts to screen size and result count
    const getGridClass = () => {
        const count = validResults.length
        if (count === 1) return 'grid-cols-1 max-w-3xl mx-auto'
        if (count === 2) return 'grid-cols-1 md:grid-cols-2'
        if (count === 3) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
        if (count === 4) return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
    }

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                {onStartFresh && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onStartFresh}
                        className="flex items-center gap-2"
                    >
                        <RotateCcw className="h-4 w-4" />
                        <span>Start Fresh</span>
                    </Button>
                )}
            </div>

            {/* Responsive Grid - maximizes image size */}
            <div className={`grid gap-4 md:gap-6 ${getGridClass()} w-full`}>
                {validResults.map((result) => (
                    <ResultCard
                        key={result.modelId}
                        imageUrl={result.imageUrl}
                        modelName={result.modelName}
                        originalImageUrl={originalImageUrl}
                        onSave={onSaveResult ? () => onSaveResult(result.modelId) : undefined}
                        onRevise={onReviseResult ? () => onReviseResult(result.modelId) : undefined}
                        saving={savingStates[result.modelId]}
                    />
                ))}
            </div>
        </div>
    )
}