import { AlertCircle, RefreshCw } from 'lucide-react'

type ErrorCardProps = {
    modelName: string
    error: string
    onRetry?: () => void
}

export function ErrorCard({ modelName, error, onRetry }: ErrorCardProps) {
    return (
        <div className="group relative border-2 border-red-200 rounded-xl bg-red-50/50 shadow-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-red-200 bg-red-100/50 backdrop-blur-sm">
                <div className="font-semibold text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="size-4" />
                    {modelName}
                </div>
                <span className="text-xs text-red-600">Failed</span>
            </div>

            {/* Error Content */}
            <div
                className="relative w-full overflow-hidden bg-red-50/30"
                style={{ aspectRatio: '1 / 1' }}
            >
                <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                    <AlertCircle className="size-12 text-red-400 mb-4" />
                    <p className="text-sm font-medium text-red-700 mb-2">
                        Generation Failed
                    </p>
                    <p className="text-xs text-red-600 max-w-[250px]">
                        {error}
                    </p>
                    {onRetry && (
                        <button
                            onClick={onRetry}
                            className="mt-4 flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            <RefreshCw className="size-3" />
                            Try Again
                        </button>
                    )}
                </div>
            </div>

            {/* Footer with error details */}
            <div className="flex items-center justify-center px-3 py-2 border-t border-red-200 bg-red-100/50">
                <p className="text-xs text-red-600">
                    {error.includes('NSFW') && '🔒 Content filtered by model'}
                    {error.includes('rate limit') && '⏱️ Too many requests'}
                    {error.includes('timeout') && '⏰ Request took too long'}
                    {!error.includes('NSFW') && !error.includes('rate limit') && !error.includes('timeout') && '⚠️ Error occurred'}
                </p>
            </div>
        </div>
    )
}