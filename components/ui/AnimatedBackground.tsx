'use client'

import { useEffect, useRef } from 'react'

interface AnimatedBackgroundProps {
    intensity?: 'low' | 'medium' | 'high'
    className?: string
}

interface LineType {
    x: number
    y: number
    addedX: number
    addedY: number
    rad: number
    lightInputMultiplier: number
    color: string
    cumulativeTime: number
    time: number
    targetTime: number
    reset: () => void
    beginPhase: () => void
    step: () => void
}

export function AnimatedBackground({
    intensity = 'low',
    className = ''
}: AnimatedBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationFrameRef = useRef<number | undefined>(undefined)
    const linesRef = useRef<LineType[]>([])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d', {
            alpha: true,
            desynchronized: true
        })
        if (!ctx) return

        // Performance optimization: reduce particle count on mobile
        const isMobile = window.innerWidth < 768
        const intensityMap = {
            low: isMobile ? 15 : 30,
            medium: isMobile ? 25 : 45,
            high: isMobile ? 35 : 60
        }

        let w = canvas.width = window.innerWidth
        let h = canvas.height = window.innerHeight

        // Detect if user prefers dark mode
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches ||
            document.documentElement.classList.contains('dark')

        const opts = {
            len: 20,
            count: intensityMap[intensity],
            baseTime: 10,
            addedTime: 10,
            dieChance: 0.05,
            spawnChance: 1,
            sparkChance: 0.1,
            sparkDist: 10,
            sparkSize: 2,

            // Using your primary gold color (#d4af37)
            color: 'hsl(hue,sat%,light%)',
            baseLight: isDarkMode ? 60 : 55,
            addedLight: isDarkMode ? 15 : 20,
            baseSaturation: isDarkMode ? 85 : 75,
            shadowToTimePropMult: isDarkMode ? 6 : 8,
            baseLightInputMultiplier: 0.015,
            addedLightInputMultiplier: 0.025,

            cx: w / 2,
            cy: h / 2,
            repaintAlpha: 0.04, // Very subtle fade for trails
            hueChange: 0.02,
            baseHue: 43 // Gold hue
        }

        let tick = 0
        const lines: LineType[] = []
        let dieX = w / 2 / opts.len
        let dieY = h / 2 / opts.len
        const baseRad = Math.PI * 2 / 6

        class Line implements LineType {
            x = 0
            y = 0
            addedX = 0
            addedY = 0
            rad = 0
            lightInputMultiplier = 0
            color = ''
            cumulativeTime = 0
            time = 0
            targetTime = 0

            constructor() {
                this.reset()
            }

            reset() {
                this.x = 0
                this.y = 0
                this.addedX = 0
                this.addedY = 0
                this.rad = 0
                this.lightInputMultiplier = opts.baseLightInputMultiplier +
                    opts.addedLightInputMultiplier * Math.random()
                this.color = opts.color
                    .replace('hue', String(opts.baseHue + tick * opts.hueChange))
                    .replace('sat', String(opts.baseSaturation))
                this.cumulativeTime = 0
                this.beginPhase()
            }

            beginPhase() {
                this.x += this.addedX
                this.y += this.addedY
                this.time = 0
                this.targetTime = (opts.baseTime + opts.addedTime * Math.random()) | 0
                this.rad += baseRad * (Math.random() < 0.5 ? 1 : -1)
                this.addedX = Math.cos(this.rad)
                this.addedY = Math.sin(this.rad)

                if (
                    Math.random() < opts.dieChance ||
                    this.x > dieX ||
                    this.x < -dieX ||
                    this.y > dieY ||
                    this.y < -dieY
                ) {
                    this.reset()
                }
            }

            step() {
                if (!ctx) return

                ++this.time
                ++this.cumulativeTime

                if (this.time >= this.targetTime) {
                    this.beginPhase()
                }

                const prop = this.time / this.targetTime
                const wave = Math.sin(prop * Math.PI / 2)
                const x = this.addedX * wave
                const y = this.addedY * wave

                ctx.shadowBlur = prop * opts.shadowToTimePropMult
                ctx.fillStyle = ctx.shadowColor = this.color.replace(
                    'light',
                    String(opts.baseLight + opts.addedLight * Math.sin(this.cumulativeTime * this.lightInputMultiplier))
                )

                ctx.fillRect(
                    opts.cx + (this.x + x) * opts.len,
                    opts.cy + (this.y + y) * opts.len,
                    2,
                    2
                )

                if (Math.random() < opts.sparkChance) {
                    ctx.fillRect(
                        opts.cx + (this.x + x) * opts.len +
                        Math.random() * opts.sparkDist * (Math.random() < 0.5 ? 1 : -1) -
                        opts.sparkSize / 2,
                        opts.cy + (this.y + y) * opts.len +
                        Math.random() * opts.sparkDist * (Math.random() < 0.5 ? 1 : -1) -
                        opts.sparkSize / 2,
                        opts.sparkSize,
                        opts.sparkSize
                    )
                }
            }
        }

        // Clear canvas completely
        ctx.clearRect(0, 0, w, h)

        function loop() {
            if (!ctx) return

            animationFrameRef.current = window.requestAnimationFrame(loop)
            ++tick

            // Use subtle transparent overlay instead of clearing - creates trails
            ctx.globalCompositeOperation = 'source-over'
            ctx.fillStyle = `rgba(0, 0, 0, ${opts.repaintAlpha})`
            ctx.fillRect(0, 0, w, h)

            ctx.globalCompositeOperation = 'lighter'
            ctx.shadowBlur = 0

            if (lines.length < opts.count && Math.random() < opts.spawnChance) {
                lines.push(new Line())
            }

            // Render all lines
            for (let i = 0; i < lines.length; i++) {
                lines[i].step()
            }
        }

        const handleResize = () => {
            if (!ctx) return

            w = canvas.width = window.innerWidth
            h = canvas.height = window.innerHeight
            ctx.clearRect(0, 0, w, h)

            opts.cx = w / 2
            opts.cy = h / 2

            dieX = w / 2 / opts.len
            dieY = h / 2 / opts.len
        }

        // Store lines reference for cleanup
        linesRef.current = lines

        // Start animation
        loop()

        // Add resize listener with debounce for performance
        let resizeTimeout: NodeJS.Timeout
        const debouncedResize = () => {
            clearTimeout(resizeTimeout)
            resizeTimeout = setTimeout(handleResize, 150)
        }
        window.addEventListener('resize', debouncedResize)

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current)
            }
            window.removeEventListener('resize', debouncedResize)
            clearTimeout(resizeTimeout)
            linesRef.current = []
        }
    }, [intensity])

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 pointer-events-none ${className}`}
            style={{
                opacity: 0.6
            }}
        />
    )
}