import { useEffect, useState } from 'react'
import { Card } from './ui/Card'

type GenerationLoaderProps = {
    message?: string
    modelCount?: number
}

const LOADING_STEPS = [
    { message: 'Uploading images...', duration: 2000 },
    { message: 'Initializing AI model...', duration: 3000 },
    { message: 'Analyzing composition...', duration: 4000 },
    { message: 'Extracting features...', duration: 5000 },
    { message: 'Enhancing quality...', duration: 6000 },
    { message: 'Applying final touches...', duration: 8000 },
    { message: 'Almost there...', duration: 10000 },
]

export function GenerationLoader({ message, modelCount = 1 }: GenerationLoaderProps) {
    const [loadingStep, setLoadingStep] = useState(LOADING_STEPS[0].message)

    useEffect(() => {
        let currentStep = 0
        const startTime = Date.now()

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime

            while (
                currentStep < LOADING_STEPS.length - 1 &&
                elapsed >= LOADING_STEPS[currentStep].duration
            ) {
                currentStep++
            }

            if (currentStep < LOADING_STEPS.length) {
                setLoadingStep(LOADING_STEPS[currentStep].message)
            }
        }, 500)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <Card className="max-w-md mx-4">
                <div className="space-y-6 text-center">
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 border-4 rounded-full border-border"></div>
                        <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-primary animate-spin"></div>
                    </div>
                    <div>
                        <h3 className="mb-2 text-xl font-bold text-text">
                            {modelCount > 1 ? `Generating ${modelCount} Images` : 'Creating Your Image'}
                        </h3>
                        <p className="text-muted">{message || loadingStep}</p>
                    </div>
                    <div className="w-full h-2 overflow-hidden rounded-full bg-border">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary-dark animate-pulse"></div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
