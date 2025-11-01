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

    // Define grid classes safely (Tailwind cannot parse dynamic col numbers)
    let gridCols = ''
    if (results.length === 1) gridCols = 'grid-cols-1'
    else if (results.length === 2) gridCols = 'grid-cols-2'
    else if (results.length === 3) gridCols = 'grid-cols-3'
    else if (results.length === 4) gridCols = 'grid-cols-4'
    else gridCols = 'grid-cols-5'

    return (
        <div className="space-y-6">
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

            {/* Smart Responsive Grid */}
            <div
                className={`grid gap-6 ${gridCols} auto-rows-auto items-start justify-items-center`}
            >
                {results
                    .filter((result) => result.imageUrl)
                    .map((result) => (
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
