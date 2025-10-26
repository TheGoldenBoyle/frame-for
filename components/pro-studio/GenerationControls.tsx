'use client'

import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

type GenerationControlsProps = {
    imageCount: number
    onImageCountChange: (count: number) => void
    prompt: string
    onPromptChange: (prompt: string) => void
    onGenerate: () => void
    generating: boolean
    tokensPerImage: number
}

export function GenerationControls({
    imageCount,
    onImageCountChange,
    prompt,
    onPromptChange,
    onGenerate,
    generating,
    tokensPerImage
}: GenerationControlsProps) {
    const totalTokens = imageCount * tokensPerImage

    return (
        <Card>
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium mb-3">
                        Final Prompt
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => onPromptChange(e.target.value)}
                        placeholder="Enter your prompt or use the AI assistant to generate one..."
                        disabled={generating}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-3">
                        Number of Images
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((count) => (
                            <button
                                key={count}
                                onClick={() => onImageCountChange(count)}
                                disabled={generating}
                                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${imageCount === count
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border hover:border-primary/50'
                                    }`}
                            >
                                {count}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-lg">
                    <div>
                        <p className="text-sm font-medium">Token Cost</p>
                        <p className="text-xs text-muted">
                            {tokensPerImage} tokens per image
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-primary">{totalTokens}</p>
                        <p className="text-xs text-muted">tokens total</p>
                    </div>
                </div>

                <Button
                    onClick={onGenerate}
                    disabled={!prompt.trim() || generating}
                    className="w-full"
                    size="lg"
                >
                    {generating ? 'Generating...' : `Generate ${imageCount} Image${imageCount > 1 ? 's' : ''}`}
                </Button>
            </div>
        </Card>
    )
}