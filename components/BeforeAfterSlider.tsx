import { useState, useRef, useEffect } from 'react'

type BeforeAfterSliderProps = {
    beforeImage: string
    afterImage: string
    beforeLabel?: string
    afterLabel?: string
    className?: string
}

export function BeforeAfterSlider({
    beforeImage,
    afterImage,
    beforeLabel = 'Before',
    afterLabel = 'After'
}: BeforeAfterSliderProps) {
    const [sliderPosition, setSliderPosition] = useState(50)
    const [isDragging, setIsDragging] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMove = (clientX: number) => {
        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const x = clientX - rect.left
        const percentage = (x / rect.width) * 100

        setSliderPosition(Math.max(0, Math.min(100, percentage)))
    }

    const handleMouseDown = () => {
        setIsDragging(true)
    }

    const handleMouseUp = () => {
        setIsDragging(false)
    }

    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return
        handleMove(e.clientX)
    }

    const handleTouchMove = (e: TouchEvent) => {
        if (!isDragging) return
        handleMove(e.touches[0].clientX)
    }

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            document.addEventListener('touchmove', handleTouchMove)
            document.addEventListener('touchend', handleMouseUp)
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('touchmove', handleTouchMove)
            document.removeEventListener('touchend', handleMouseUp)
        }
    }, [isDragging])

    return (
        <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-lg select-none"
            style={{ aspectRatio: '1/1' }}
        >
            <div className="absolute inset-0">
                <img
                    src={beforeImage}
                    alt={beforeLabel}
                    className="object-cover w-full h-full"
                    draggable={false}
                />
                <div className="absolute px-3 py-1 text-xs font-medium text-white rounded-full top-4 left-4 bg-black/50">
                    {beforeLabel}
                </div>
            </div>

            <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
                <img
                    src={afterImage}
                    alt={afterLabel}
                    className="object-cover w-full h-full"
                    draggable={false}
                />
                <div className="absolute px-3 py-1 text-xs font-medium text-white rounded-full top-4 right-4 bg-black/50">
                    {afterLabel}
                </div>
            </div>

            <div
                className="absolute top-0 bottom-0 w-1 cursor-ew-resize bg-white/80"
                style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
            >
                <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full shadow-lg bg-surface">
                        <svg
                            className="w-6 h-6 text-text"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}