import { useState, useRef, useEffect } from 'react'
import { X, Wand2, Loader } from 'lucide-react'

type RevisionModalProps = {
    imageUrl: string
    modelId: string
    modelName: string
    availableModels: Array<{ id: string; name: string }>
    revisionCount: number
    onClose: () => void
    onRevise: (prompt: string, modelIds: string[], maskData: string | null) => Promise<void>
}

export function RevisionModal({
    imageUrl,
    modelId,
    modelName,
    availableModels,
    revisionCount,
    onClose,
    onRevise
}: RevisionModalProps) {
    const [prompt, setPrompt] = useState('')
    const [isRevising, setIsRevising] = useState(false)
    const [drawMode, setDrawMode] = useState(false)
    const [isDrawing, setIsDrawing] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)
    const [maskData, setMaskData] = useState<string | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const image = imageRef.current
        if (!canvas || !image) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
        }
        img.src = imageUrl
    }, [imageUrl])

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!drawMode) return
        setIsDrawing(true)
        draw(e)
    }

    const stopDrawing = () => {
        setIsDrawing(false)
        const canvas = canvasRef.current
        if (!canvas) return
        setMaskData(canvas.toDataURL())
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !drawMode) return

        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height

        let clientX: number
        let clientY: number

        if ('touches' in e) {
            clientX = e.touches[0].clientX
            clientY = e.touches[0].clientY
        } else {
            clientX = e.clientX
            clientY = e.clientY
        }

        const x = (clientX - rect.left) * scaleX
        const y = (clientY - rect.top) * scaleY

        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)'
        ctx.lineWidth = 20
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        ctx.beginPath()
        ctx.arc(x, y, 10, 0, Math.PI * 2)
        ctx.fill()
    }

    const clearMask = () => {
        const canvas = canvasRef.current
        const image = imageRef.current
        if (!canvas || !image) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)
            setMaskData(null)
        }
        img.src = imageUrl
    }

    const handleSubmit = async () => {
        if (!prompt.trim()) return

        setIsRevising(true)
        try {
            await onRevise(prompt.trim(), [modelId], maskData)
            onClose()
        } catch (error) {
            console.error('Revision failed:', error)
        } finally {
            setIsRevising(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="relative w-full max-w-4xl overflow-hidden rounded-lg bg-background">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-text">Revise Image</h2>
                    <button
                        onClick={onClose}
                        className="p-2 transition-colors rounded-lg hover:bg-surface"
                    >
                        <X className="w-5 h-5 text-muted" />
                    </button>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
                    <div className="relative">
                        <img
                            ref={imageRef}
                            src={imageUrl}
                            alt="Original"
                            className="hidden"
                        />
                        <canvas
                            ref={canvasRef}
                            className="w-full rounded-lg"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            style={{ 
                                cursor: drawMode ? 'crosshair' : 'default',
                                touchAction: 'none'
                            }}
                        />
                        
                        {drawMode && (
                            <div className="absolute flex gap-2 top-2 right-2">
                                <button
                                    onClick={clearMask}
                                    className="px-3 py-1 text-sm transition-colors rounded-lg bg-surface hover:bg-border"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={() => setDrawMode(false)}
                                    className="px-3 py-1 text-sm transition-colors rounded-lg bg-primary text-primary-foreground hover:opacity-90"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>

                    {!drawMode && (
                        <div className="relative w-full">
                            <button
                            onClick={() => setDrawMode(true)}
                            className="w-full px-4 py-2 text-sm transition-colors border rounded-lg border-border hover:bg-surface relative"
                            >
                            Draw Focus Area (Optional)
                            <span className="absolute top-0 right-2 -translate-y-1/2 px-4 py-2 text-xs font-bold bg-primary text-black rounded-full">
                                BETA
                            </span>
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="block mb-2 text-sm font-medium text-text">
                            Revision Instructions
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Make the background more vibrant..."
                            className="w-full px-4 py-3 border rounded-lg resize-none bg-surface border-border text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={3}
                            disabled={isRevising}
                        />
                        <p className="mt-2 text-xs text-muted">
                            Revisions powered by nano-banana • {revisionCount < 2 ? '0.5 tokens (first 2 revisions)' : '1 token per revision'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 p-4 border-t border-border">
                    <button
                        onClick={onClose}
                        disabled={isRevising}
                        className="flex-1 px-4 py-2 transition-colors border rounded-lg border-border hover:bg-surface disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!prompt.trim() || isRevising}
                        className="flex items-center justify-center flex-1 gap-2 px-4 py-2 transition-colors rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                        {isRevising ? (
                            <>
                                <Loader className="w-4 h-4 animate-spin" />
                                Revising...
                            </>
                        ) : (
                            <>
                                <Wand2 className="w-4 h-4" />
                                Revise
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}