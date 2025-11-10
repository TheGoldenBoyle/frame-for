'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loader } from '@/components/ui/Loader'
import { GenerationLoader } from '@/components/GenerationLoader'
import { VideoGenerationResult } from '@/types/globals'
import { motion } from 'framer-motion'
import { Film, Sparkles, Zap, ArrowLeft, Download } from 'lucide-react'
import { TOKEN_CONFIG } from '@/lib/config/tokens'
import { useTokens } from '@/hooks/useTokens'

type VideoModel = {
	id: string
	name: string
	description: string
	icon: React.ReactNode
	costPerVideo: number
	badge?: string
}

const VIDEO_MODELS: VideoModel[] = [
	{
		id: 'veo-3.1-fast',
		name: 'Veo 3.1 Fast',
		description: 'Premium quality with audio support',
		icon: <Sparkles className="w-5 h-5" />,
		costPerVideo: TOKEN_CONFIG.COSTS.VIDEO_VEO_3_1,
		badge: 'Best',
	},
	{
		id: 'kling-2.5-turbo-pro',
		name: 'Kling 2.5 Turbo Pro',
		description: 'Cinematic depth & smooth motion',
		icon: <Film className="w-5 h-5" />,
		costPerVideo: TOKEN_CONFIG.COSTS.VIDEO_KLING_2_5,
	},
	{
		id: 'wan-2.5',
		name: 'WAN 2.5',
		description: 'Fast & cost-effective',
		icon: <Zap className="w-5 h-5" />,
		costPerVideo: TOKEN_CONFIG.COSTS.VIDEO_WAN_2_5,
		badge: 'Budget',
	},
]

export default function ImageToVideoPage() {
	const router = useRouter()
	const searchParams = useSearchParams()
	let { tokens } = useTokens()

	const [sourceImageUrl, setSourceImageUrl] = useState<string>('')
	const [sourceType, setSourceType] = useState<string>('playground')
	const [sourceId, setSourceId] = useState<string | null>(null)
	const [prompt, setPrompt] = useState('')
	const [selectedModels, setSelectedModels] = useState<string[]>([])
	const [duration, setDuration] = useState<"short" | "long">("short")
	const [resolution, setResolution] = useState<'720p' | '1080p'>('720p')
	const [generateAudio, setGenerateAudio] = useState(false)
	const [generating, setGenerating] = useState(false)
	const [results, setResults] = useState<VideoGenerationResult[]>([])
	const [error, setError] = useState<string | null>(null)

	// Load image from URL params
	useEffect(() => {
		const imageUrl = searchParams.get('imageUrl')
		const type = searchParams.get('sourceType')
		const id = searchParams.get('sourceId')

		if (imageUrl) {
			setSourceImageUrl(decodeURIComponent(imageUrl))
			setSourceType(type || 'playground')
			setSourceId(id)
		} else {
			// Redirect back if no image provided
			router.push('/dashboard/gallery')
		}
	}, [searchParams, router])

	const toggleModel = (modelId: string) => {
		setSelectedModels((prev) =>
			prev.includes(modelId)
				? prev.filter((id) => id !== modelId)
				: prev.length < 3
					? [...prev, modelId]
					: prev
		)
	}

	const calculateTotalCost = () => {
		return selectedModels.reduce((total, modelId) => {
			const model = VIDEO_MODELS.find((m) => m.id === modelId)
			return total + (model?.costPerVideo || 0)
		}, 0)
	}

	const handleGenerate = async () => {
		if (selectedModels.length === 0) {
			setError('Please select at least one model')
			return
		}

		const totalCost = calculateTotalCost()
		if (!tokens || tokens < totalCost) {
			setError(`Insufficient tokens. Need ${totalCost}, have ${tokens || 0}`)
			return
		}

		setGenerating(true)
		setError(null)
		setResults([])

		try {
			const formData = new FormData()
			formData.append('imageUrl', sourceImageUrl)
			formData.append('prompt', prompt)
			formData.append('modelIds', JSON.stringify(selectedModels))
			formData.append('duration', duration.toString())
			formData.append('resolution', resolution)
			formData.append('generateAudio', generateAudio.toString())
			formData.append('sourceType', sourceType)
			if (sourceId) formData.append('sourceId', sourceId)

			const response = await fetch('/api/video/generate', {
				method: 'POST',
				body: formData,
			})

			const data = await response.json()

			if (!response.ok) {
				if (data.error === 'INSUFFICIENT_TOKENS') {
					setError(data.message)
				} else {
					setError(data.error || 'Failed to generate videos')
				}
				return
			}

			setResults(data.results || [])

			// Refresh token balance
			if (!!tokens) {
				tokens -= data.tokensUsed || totalCost
			}
		} catch (err) {
			console.error('Generation error:', err)
			setError('Something went wrong. Please try again.')
		} finally {
			setGenerating(false)
		}
	}

	const downloadVideo = async (videoUrl: string, modelName: string) => {
		try {
			const response = await fetch(videoUrl)
			const blob = await response.blob()
			const url = window.URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			a.download = `BildOro-Video-${modelName.replace(/\s+/g, '-')}-${Date.now()}.mp4`
			document.body.appendChild(a)
			a.click()
			window.URL.revokeObjectURL(url)
			document.body.removeChild(a)
		} catch (error) {
			console.error('Download failed:', error)
		}
	}

	if (!sourceImageUrl) {
		return <Loader fullScreen />
	}

	return (
		<div className="min-h-screen p-4 md:p-8">
			{/* Generation Loader Overlay */}
			{generating && (
				<GenerationLoader
					modelCount={selectedModels.length}
					modelNames={selectedModels}
					isVideo={true}
					videoDuration={duration}
					prompt={prompt}
				/>
			)}

			<div className="mx-auto max-w-6xl">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="mb-6"
				>
					<Button
						onClick={() => router.back()}
						variant="ghost"
						className="mb-4 flex items-center gap-2"
					>
						<ArrowLeft size={18} />
						Back
					</Button>
					<h1 className="text-3xl font-bold text-text">Image to Video</h1>
					<p className="text-muted mt-2">
						Transform your image into a dynamic video with AI
					</p>
				</motion.div>

				<div className="grid gap-6 lg:grid-cols-2">
					{/* Left: Image Preview & Controls */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.1 }}
					>
						<Card className="p-6">
							<h2 className="text-xl font-semibold mb-4">Source Image</h2>
							<div className="relative aspect-square rounded-lg overflow-hidden bg-black/5 mb-6">
								<img
									src={sourceImageUrl}
									alt="Source"
									className="w-full h-full object-cover"
								/>
							</div>

							{/* Motion Prompt */}
							<div className="mb-4">
								<label className="block text-sm font-medium text-text mb-2">
									Motion Prompt (Optional)
								</label>
								<textarea
									value={prompt}
									onChange={(e) => setPrompt(e.target.value)}
									placeholder="Describe how you want the image to move... (e.g., 'Gentle camera pan from left to right with subtle zoom')"
									className="w-full px-4 py-3 rounded-lg border border-border bg-surface text-text placeholder-muted resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
									rows={3}
								/>
							</div>

							{/* Duration & Resolution */}
							<div className="grid grid-cols-2 gap-4 mb-4">
								<div>
									<label className="block text-sm font-medium text-text mb-2">Duration</label>
									<select
										value={duration}
										onChange={(e) => setDuration(e.target.value as 'short' | 'long')}
										className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-primary"
									>
										<option value="short">Short</option>
										<option value="long">Long</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-text mb-2">
										Resolution
									</label>
									<select
										value={resolution}
										onChange={(e) => setResolution(e.target.value as '720p' | '1080p')}
										className="w-full px-4 py-2 rounded-lg border border-border bg-surface text-text focus:ring-2 focus:ring-primary"
									>
										<option value="720p">720p</option>
										<option value="1080p">1080p</option>
									</select>
								</div>
							</div>

							{/* Audio Toggle */}
							<label className="flex items-center gap-2 cursor-pointer mb-6">
								<input
									type="checkbox"
									checked={generateAudio}
									onChange={(e) => setGenerateAudio(e.target.checked)}
									className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
								/>
								<span className="text-sm text-text">
									Generate Audio (Veo 3.1 only)
								</span>
							</label>
						</Card>
					</motion.div>

					{/* Right: Model Selection & Results */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}
					>
						<Card className="p-6">
							<h2 className="text-xl font-semibold mb-4">
								Select Models (up to 3)
							</h2>

							{/* Model Selection Grid */}
							<div className="space-y-3 mb-6">
								{VIDEO_MODELS.map((model) => (
									<motion.button
										key={model.id}
										onClick={() => toggleModel(model.id)}
										className={`w-full p-4 rounded-lg border-2 transition-all text-left ${selectedModels.includes(model.id)
												? 'border-primary bg-primary/10'
												: 'border-border bg-surface hover:border-primary/50'
											}`}
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<div className="flex items-start justify-between">
											<div className="flex items-start gap-3">
												<div className="mt-0.5">{model.icon}</div>
												<div>
													<div className="flex items-center gap-2">
														<h3 className="font-semibold text-text">
															{model.name}
														</h3>
														{model.badge && (
															<span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
																{model.badge}
															</span>
														)}
													</div>
													<p className="text-sm text-muted mt-1">
														{model.description}
													</p>
												</div>
											</div>
											<div className="text-right">
												<span className="text-sm font-medium text-primary">
													{model.costPerVideo} tokens
												</span>
											</div>
										</div>
									</motion.button>
								))}
							</div>

							{/* Token Cost Summary */}
							<div className="p-4 rounded-lg bg-surface/50 border border-border mb-4">
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-muted">Selected models:</span>
									<span className="font-medium text-text">
										{selectedModels.length}
									</span>
								</div>
								<div className="flex items-center justify-between mb-2">
									<span className="text-sm text-muted">Total cost:</span>
									<span className="font-semibold text-primary">
										{calculateTotalCost()} tokens
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted">Your balance:</span>
									<span className="font-medium text-text">
										{tokens || 0} tokens
									</span>
								</div>
							</div>

							{/* Error Display */}
							{error && (
								<div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600">
									{error}
								</div>
							)}

							{/* Generate Button */}
							<Button
								onClick={handleGenerate}
								disabled={generating || selectedModels.length === 0}
								className="w-full"
							>
								{generating ? (
									<>
										Generating Videos...
									</>
								) : (
									<>
										<Film className="mr-2" size={18} />
										Generate Video{selectedModels.length > 1 ? 's' : ''}
									</>
								)}
							</Button>
						</Card>

						{/* Results */}
						{results.length > 0 && (
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								className="mt-6"
							>
								<Card className="p-6">
									<h2 className="text-xl font-semibold mb-4">Generated Videos</h2>
									<div className="space-y-4">
										{results.map((result, index) => (
											<div
												key={result.modelId}
												className="p-4 rounded-lg border border-border bg-surface"
											>
												<div className="flex items-center justify-between mb-2">
													<span className="font-semibold text-text">
														{result.modelName}
													</span>
													{result.error && (
														<span className="text-xs text-red-500">
															{result.error}
														</span>
													)}
												</div>
												{result.videoUrl ? (
													<>
														<video
															src={result.videoUrl}
															controls
															className="w-full rounded-lg mb-2"
															loop
														/>
														<Button
															onClick={() =>
																downloadVideo(
																	result.videoUrl!,
																	result.modelName
																)
															}
															variant="ghost"
															className="w-full flex items-center justify-center gap-2"
														>
															<Download size={16} />
															Download
														</Button>
													</>
												) : (
													<div className="text-sm text-muted">
														{result.error || 'Failed to generate'}
													</div>
												)}
											</div>
										))}
									</div>
								</Card>
							</motion.div>
						)}
					</motion.div>
				</div>
			</div>
		</div>
	)
}