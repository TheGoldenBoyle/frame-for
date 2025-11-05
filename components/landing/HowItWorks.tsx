import { useState, useRef, useEffect } from "react"
import { useI18n } from '@/lib/i18n/context'

interface Step {
    id: number
    titleKey: string
    descKey: string
    image: string
}

const STEP_KEYS: Step[] = [
    {
        id: 1,
        titleKey: "howItWorksStep1Title",
        descKey: "howItWorksStep1Desc",
        image: "/images/models.png",
    },
    {
        id: 2,
        titleKey: "howItWorksStep2Title",
        descKey: "howItWorksStep2Desc",
        image: "/images/prompt-manager.png",
    },
    {
        id: 3,
        titleKey: "howItWorksStep3Title",
        descKey: "howItWorksStep3Desc",
        image: "/images/enhance.png",
    },
    {
        id: 4,
        titleKey: "howItWorksStep4Title",
        descKey: "howItWorksStep4Desc",
        image: "/images/compare.png",
    },
    {
        id: 5,
        titleKey: "howItWorksStep5Title",
        descKey: "howItWorksStep5Desc",
        image: "/images/revise.png",
    },
]

export default function HowItWorks() {
    const { t } = useI18n()
    const [expandedImage, setExpandedImage] = useState<string | null>(null)
    const [visibleSteps, setVisibleSteps] = useState<number[]>([])

    const stepRefs = useRef<(HTMLDivElement | null)[]>([])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute("data-index"))
                        if (!visibleSteps.includes(index)) {
                            setVisibleSteps((prev) => [...prev, index])
                        }
                    }
                })
            },
            { threshold: 0.2 }
        )

        stepRefs.current.forEach((ref) => ref && observer.observe(ref))

        return () => {
            stepRefs.current.forEach((ref) => ref && observer.unobserve(ref))
        }
    }, [visibleSteps])

    return (
        <>
            <div className="space-y-16 max-w-6xl mx-auto py-20">
                {STEP_KEYS.map((step, index) => {
                    const isEven = index % 2 === 0
                    const isVisible = visibleSteps.includes(index)
                    const title = t.landing[step.titleKey as keyof typeof t.landing] as string
                    const description = t.landing[step.descKey as keyof typeof t.landing] as string

                    return (
                        <div
                            key={step.id}
                            ref={(el) => {
                                stepRefs.current[index] = el
                            }}
                            data-index={index}
                            className={`flex flex-col md:flex-row ${isEven ? "" : "md:flex-row-reverse"
                                } items-center gap-8 transition-transform duration-700 ease-out ${isVisible
                                    ? isEven
                                        ? "animate-slide-in-left"
                                        : "animate-slide-in-right"
                                    : "opacity-0 translate-x-10"
                                }`}
                        >
                            <div className="md:w-1/2">
                                <h3 className="text-2xl font-bold mb-2">
                                    {step.id}. {title}
                                </h3>
                                <p className="text-muted">{description}</p>
                            </div>

                            <div
                                className="md:w-1/2 cursor-pointer"
                                onClick={() => setExpandedImage(step.image)}
                            >
                                <img
                                    src={step.image}
                                    alt={title}
                                    className="w-full rounded-xl shadow-elevated hover:animate-image-zoom"
                                />
                            </div>
                        </div>
                    )
                })}

            </div>

            {expandedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setExpandedImage(null)}
                >
                    <img
                        src={expandedImage}
                        alt="Expanded Step"
                        className="max-w-full max-h-full rounded-xl shadow-2xl animate-scale-in"
                    />
                </div>
            )}
        </>
    )
}