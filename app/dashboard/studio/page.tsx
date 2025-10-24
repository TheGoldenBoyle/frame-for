// 'use client'

// import { useState, useRef } from 'react'
// import { useRouter } from 'next/navigation'

// import { ImageUpload } from '@/components/ImageUpload'
// import { PromptInput } from '@/components/PromptInput'
// import { ModelSelector } from '@/components/ModelSelector'
// import { GenerationLoader } from '@/components/GenerationLoader'
// import { ComparisonGrid } from '@/components/ComparisonGrid'
// import { useAuth } from '@/hooks/useAuth'

// import { Button } from '@/components/ui/Button'
// import { Card } from '@/components/ui/Card'

// const TRANSFORMATION_PRESETS = [
//     {
//         id: 'restore',
//         name: 'Restore Image',
//         description: 'Enhance and improve image quality',
//         requiresImage: true
//     },
//     {
//         id: 'text-to-image',
//         name: 'Text to Image',
//         description: 'Generate image from text prompt',
//         requiresImage: false
//     },
//     {
//         id: 'combine-people',
//         name: 'Combine People',
//         description: 'Create a group photo from multiple images',
//         requiresImage: true,
//         minImages: 2
//     },
//     {
//         id: 'background-change',
//         name: 'Background Change',
//         description: 'Replace image background',
//         requiresImage: true
//     }
// ]

// export default function ImageToImagePage() {
//     const router = useRouter()
//     const { user } = useAuth()
//     const promptRef = useRef<HTMLTextAreaElement>(null)

//     const [image1, setImage1] = useState<File | null>(null)
//     const [image2, setImage2] = useState<File | null>(null)
//     const [prompt, setPrompt] = useState('')
//     const [selectedModels, setSelectedModels] = useState<string[]>(['nano-banana'])
//     const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
//     const [loading, setLoading] = useState(false)
//     const [results, setResults] = useState<any[]>([])
//     const [error, setError] = useState<string | null>(null)

//     const handleGenerate = async () => {
//         // Validation based on preset requirements
//         const preset = TRANSFORMATION_PRESETS.find(p => p.id === selectedPreset)
        
//         if (preset?.requiresImage && !image1) {
//             setError(`${preset.name} requires at least one input image`)
//             return
//         }

//         if (preset?.id === 'combine-people' && (!image1 || !image2)) {
//             setError('Combining people requires two images')
//             return
//         }

//         setLoading(true)
//         setError(null)

//         const formData = new FormData()
//         formData.append('prompt', prompt)
//         formData.append('preset', selectedPreset || '')
//         formData.append('modelIds', JSON.stringify(selectedModels))
        
//         if (image1) formData.append('image1', image1)
//         if (image2) formData.append('image2', image2)

//         try {
//             const response = await fetch('/api/image-transformation', {
//                 method: 'POST',
//                 body: formData
//             })

//             const data = await response.json()

//             if (!response.ok) {
//                 throw new Error(data.error || 'Generation failed')
//             }

//             setResults(data.results)
//         } catch (err) {
//             setError(err instanceof Error ? err.message : 'Something went wrong')
//         } finally {
//             setLoading(false)
//         }
//     }

//     const handleStartOver = () => {
//         setImage1(null)
//         setImage2(null)
//         setPrompt('')
//         setSelectedModels(['nano-banana'])
//         setSelectedPreset(null)
//         setResults([])
//         setError(null)
//     }

//     if (loading) {
//         return <GenerationLoader modelCount={selectedModels.length} />
//     }

//     if (results.length > 0) {
//         return (
//             <div className="min-h-screen p-4">
//                 <ComparisonGrid 
//                     results={results}
//                     originalImages={[image1, image2].filter(Boolean).map(img => URL.createObjectURL(img!))}
//                     onStartOver={handleStartOver}
//                 />
//             </div>
//         )
//     }

//     return (
//         <div className="max-w-4xl mx-auto p-4">
//             <h1 className="text-3xl font-bold mb-6">Image Transformation</h1>

//             {/* Preset Selection */}
//             <Card className="mb-6">
//                 <div>
//                     <label className="block mb-3 text-sm font-medium text-text">
//                         Select Transformation Type
//                     </label>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                         {TRANSFORMATION_PRESETS.map((preset) => (
//                             <button
//                                 key={preset.id}
//                                 onClick={() => setSelectedPreset(preset.id)}
//                                 className={`p-4 border-2 rounded-lg text-left
//                                     ${selectedPreset === preset.id 
//                                         ? 'border-primary bg-primary/10' 
//                                         : 'border-border hover:border-primary/50'
//                                     }`}
//                             >
//                                 <div className="font-bold">{preset.name}</div>
//                                 <div className="text-sm text-muted">{preset.description}</div>
//                                 {preset.requiresImage && (
//                                     <span className="block mt-2 text-xs text-orange-600">
//                                         Requires input image
//                                     </span>
//                                 )}
//                             </button>
//                         ))}
//                     </div>
//                 </div>
//             </Card>

//             {/* Image Uploads */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//                 <Card>
//                     <ImageUpload 
//                         onImagesChange={(files) => setImage1(files[0] || null)}
//                         maxImages={1}
//                         label="Image 1 (Optional)"
//                     />
//                 </Card>
//                 <Card>
//                     <ImageUpload 
//                         onImagesChange={(files) => setImage2(files[0] || null)}
//                         maxImages={1}
//                         label="Image 2 (Optional)"
//                     />
//                 </Card>
//             </div>

//             {/* Model Selection */}
//             <Card className="mb-6">
//                 <ModelSelector
//                     selectedModels={selectedModels}
//                     onSelect={(modelId) => 
//                         setSelectedModels(prev => 
//                             prev.includes(modelId) 
//                                 ? prev.filter(m => m !== modelId)
//                                 : [...prev, modelId]
//                         )
//                     }
//                     maxSelection={3}
//                     hasImage={!!image1 || !!image2}
//                 />
//             </Card>

//             {/* Prompt Input */}
//             <Card className="mb-6">
//                 <PromptInput 
//                     ref={promptRef}
//                     value={prompt}
//                     onChange={setPrompt}
//                     placeholder="Optional: Describe your desired transformation"
//                     label="Transformation Details"
//                 />
//             </Card>

//             {error && (
//                 <div className="text-red-500 mt-4">
//                     {error}
//                 </div>
//             )}

//             <Button 
//                 onClick={handleGenerate}
//                 disabled={loading || !selectedPreset}
//                 className="w-full mt-6"
//             >
//                 Generate Transformation
//             </Button>
//         </div>
//     )
// }