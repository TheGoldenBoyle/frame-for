'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Loader } from '@/components/ui/Loader'
import { ResultCard } from "@/components/ResultCard"
import { motion, useMotionValue, animate } from 'framer-motion'
import { LayoutGrid, Film, Download, Maximize2, Edit3 } from 'lucide-react'
import { useShare } from '@/hooks/useShare'

type PlaygroundResult = {
	modelId: string
	modelName: string
	imageUrl: string | null
	error?: string
}

type PlaygroundPhoto = {
	id: string
	prompt: string
	results: PlaygroundResult[]
	createdAt: string
}

type ViewMode = 'grid' | 'cinematic'

type FlattenedImage = {
	modelId: string
	modelName: string
	imageUrl: string
	prompt: string
	createdAt: string
	photoId: string
}

export default function GalleryPage() {
	const router = useRouter()
	const { user } = useAuth()
	const [playgroundPhotos, setPlaygroundPhotos] = useState<PlaygroundPhoto[]>([])
	const [loading, setLoading] = useState(true)
	const [viewMode, setViewMode] = useState<ViewMode>('grid')
	const [activeIndex, setActiveIndex] = useState(0)
	const x = useMotionValue(0)

	const { isSharing, downloadImage } = useShare()

	// Flatten all results into a single array for the slider
	const allImages: FlattenedImage[] = playgroundPhotos.flatMap(photo =>
		photo.results
			.filter(r => r.imageUrl)
			.map(result => ({
				modelId: result.modelId,
				modelName: result.modelName,
				imageUrl: result.imageUrl!,
				prompt: photo.prompt,
				createdAt: photo.createdAt,
				photoId: photo.id
			}))
	)

	// Create infinite loop by tripling the array
	const infiniteImages = [...allImages, ...allImages, ...allImages]

	// Use viewport width for cards
	const CARD_WIDTH = typeof window !== 'undefined' ? window.innerWidth * 0.7 : 800
	const CARD_GAP = typeof window !== 'undefined' ? window.innerWidth * 0.05 : 50

	useEffect(() => {
		if (!user) return

		const fetchPlaygroundPhotos = async () => {
			try {
				const response = await fetch('/api/playground/photos')
				const data = await response.json()
				setPlaygroundPhotos(data.photos || [])
			} catch (error) {
				console.error('Failed to fetch photos:', error)
			} finally {
				setLoading(false)
			}
		}

		fetchPlaygroundPhotos()
	}, [user])

	// Initialize position when images load
	useEffect(() => {
		if (allImages.length > 0 && viewMode === 'cinematic') {
			const initialOffset = -allImages.length * (CARD_WIDTH + CARD_GAP)
			x.set(initialOffset)
			setActiveIndex(0)
		}
	}, [allImages.length, viewMode])

	const handleDragEnd = () => {
		const currentX = x.get()
		const itemWidth = CARD_WIDTH + CARD_GAP

		const index = Math.round(-currentX / itemWidth)
		const targetX = -index * itemWidth

		animate(x, targetX, {
			type: 'spring',
			stiffness: 300,
			damping: 30,
		})

		const totalItems = allImages.length
		if (index >= totalItems * 2) {
			setTimeout(() => {
				x.set(-(index - totalItems) * itemWidth)
				setActiveIndex((index - totalItems) % totalItems)
			}, 300)
		} else if (index < totalItems) {
			setTimeout(() => {
				x.set(-(index + totalItems) * itemWidth)
				setActiveIndex((index + totalItems) % totalItems)
			}, 300)
		} else {
			setActiveIndex(index % totalItems)
		}
	}

	const navigateToCard = (direction: 'prev' | 'next') => {
		const currentX = x.get()
		const itemWidth = CARD_WIDTH + CARD_GAP
		const currentIndex = Math.round(-currentX / itemWidth)
		const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
		const targetX = -newIndex * itemWidth

		animate(x, targetX, {
			type: 'spring',
			stiffness: 300,
			damping: 30,
		})

		const totalItems = allImages.length
		setActiveIndex(((newIndex % totalItems) + totalItems) % totalItems)
	}

	if (loading) {
		return <Loader fullScreen />
	}

	const hasPhotos = playgroundPhotos.length > 0

	const getGridClass = (count: number) => {
		if (count === 1) return 'grid-cols-1 max-w-3xl mx-auto'
		if (count === 2) return 'grid-cols-1 lg:grid-cols-2'
		if (count === 3) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
		if (count === 4) return 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-4'
		return 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4'
	}

	return (
		<div className="min-h-screen">
			{viewMode === 'grid' && (
				<div className="p-4 md:p-8">
					<div className="mx-auto max-w-8xl">
						{hasPhotos && (
							<motion.div
								initial={{ opacity: 0, y: -20 }}
								animate={{ opacity: 1, y: 0 }}
								className="mb-6 flex justify-end gap-2"
							>
								<Button
									onClick={() => setViewMode('grid')}
									variant={viewMode === 'grid' ? 'primary' : 'ghost'}
									className="flex items-center gap-2"
								>
									<LayoutGrid size={18} />
									Grid
								</Button>
								<Button
									onClick={() => setViewMode('cinematic')}
									variant={viewMode !== 'grid' ? 'ghost' : 'primary'}
									className="flex items-center gap-2"
								>
									<Film size={18} />
									Cinematic
								</Button>
							</motion.div>
						)}

						{!hasPhotos ? (
							<Card>
								<div className="py-12 text-center">
									<p className="mb-4 text-muted">No photos yet</p>
									<p className="text-sm text-muted">
										Start creating to see your work here
									</p>
								</div>
							</Card>
						) : (
							<div className="space-y-8">
								{playgroundPhotos.map((photo) => {
									const validResults = photo.results.filter(r => r.imageUrl)
									return (
										<Card key={photo.id} className="p-6">
											<div className="mb-6">
												<p className="text-sm text-muted">
													{new Date(photo.createdAt).toLocaleDateString()}
												</p>
												<p className="mt-2 font-medium text-text">{photo.prompt}</p>
											</div>

											<div className={`grid ${getGridClass(validResults.length)} gap-4 lg:gap-6`}>
												{validResults.map((result, index) => (
													<div
														key={result.modelId}
														className="animate-scale-in opacity-0"
														style={{
															animationDelay: `${index * 0.08}s`,
															animationFillMode: 'forwards',
														}}
													>
														<ResultCard
															imageUrl={result.imageUrl!}
															modelName={result.modelName}
															prompt={photo.prompt} // ✅ Added
															playgroundPhotoId={photo.id} // ✅ Added
														/>
													</div>
												))}
											</div>
										</Card>
									)
								})}
							</div>
						)}
					</div>
				</div>
			)}

			{viewMode === 'cinematic' && hasPhotos && (
				<div className="relative h-screen w-screen overflow-hidden bg-background">
					{/* Header Bar */}
					<div className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-surface/95 backdrop-blur-xl px-6 py-4">
						<div className="mx-auto flex max-w-8xl items-center justify-between">
							<div className="flex-1 min-w-0">
								<h3 className="text-lg font-semibold text-text truncate">
									{allImages[activeIndex]?.prompt}
								</h3>
								<p className="text-sm text-muted mt-1">
									{allImages[activeIndex]?.modelName} • {new Date(allImages[activeIndex]?.createdAt).toLocaleDateString()}
								</p>
							</div>
							<div className="flex items-center gap-2 ml-4">
								<Button
									onClick={() => setViewMode('grid')}
									variant="ghost"
									className="flex items-center gap-2"
								>
									<LayoutGrid size={18} />
									<span className="hidden sm:inline">Grid</span>
								</Button>

								{/* Edit Button */}
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={() => {
										const image = allImages[activeIndex]
										router.push(`/dashboard/playground?edit=${image.photoId}`)
									}}
									className="rounded-lg bg-surface p-2 hover:bg-primary/10 transition-colors"
									title="Edit in Playground"
								>
									<Edit3 size={18} className="text-text" />
								</motion.button>

								{/* Download Button */}
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									onClick={() => {
										const image = allImages[activeIndex]
										downloadImage(
											image.imageUrl,
											`BildOro-${image.modelName}-${image.photoId}.png`,
											true
										)
									}}
									disabled={isSharing}
									className={`rounded-lg bg-surface p-2 hover:bg-primary/10 transition-colors ${
										isSharing ? 'opacity-50 cursor-not-allowed' : ''
									}`}
									title="Download"
								>
									<Download size={18} className="text-text" />
								</motion.button>

								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="rounded-lg bg-surface p-2 hover:bg-primary/10 transition-colors"
									title="Fullscreen"
								>
									<Maximize2 size={18} className="text-text" />
								</motion.button>
							</div>
						</div>
					</div>

					{/* Navigation Arrows */}
					<motion.button
						whileHover={{ scale: 1.1, x: -5 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => navigateToCard('prev')}
						className="fixed left-6 top-1/2 z-40 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 backdrop-blur-md border border-border shadow-xl hover:bg-primary hover:text-white transition-all"
						aria-label="Previous image"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
						</svg>
					</motion.button>

					<motion.button
						whileHover={{ scale: 1.1, x: 5 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => navigateToCard('next')}
						className="fixed right-6 top-1/2 z-40 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 backdrop-blur-md border border-border shadow-xl hover:bg-primary hover:text-white transition-all"
						aria-label="Next image"
					>
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-6 w-6">
							<path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
						</svg>
					</motion.button>

					{/* Slider */}
					<div className="absolute inset-0 pt-24 pb-20 overflow-hidden">
						<motion.div
							className="flex h-full items-center"
							style={{
								x,
								paddingLeft: `${(typeof window !== 'undefined' ? window.innerWidth : 1000) * 0.15}px`
							}}
							drag="x"
							dragConstraints={{ left: -Infinity, right: 0 }}
							dragElastic={0.1}
							onDragEnd={handleDragEnd}
							dragTransition={{ bounceStiffness: 300, bounceDamping: 30 }}
						>
							{infiniteImages.map((image, index) => {
								const itemWidth = CARD_WIDTH + CARD_GAP
								const position = -index * itemWidth
								const currentX = x.get()
								const distance = Math.abs(currentX - position)

								const scale = distance < itemWidth * 0.5 ? 1 : 0.85
								const opacity = distance < itemWidth * 1.5 ? 1 : 0.3

								return (
									<motion.div
										key={`${image.photoId}-${image.modelId}-${index}`}
										className="flex-shrink-0 px-4"
										style={{
											width: CARD_WIDTH,
											marginRight: CARD_GAP,
										}}
										animate={{ scale, opacity }}
										transition={{ type: 'spring', stiffness: 300, damping: 30 }}
									>
										<motion.div
											className="relative h-full overflow-hidden rounded-2xl bg-surface border-2 border-border shadow-2xl cursor-grab active:cursor-grabbing"
											whileHover={{ y: -12 }}
											transition={{ duration: 0.2 }}
											onClick={() => router.push(`/dashboard/playground?edit=${image.photoId}`)}
										>
											<div className="h-full overflow-hidden">
												<img
													src={image.imageUrl}
													alt={image.prompt}
													className="h-full w-full object-cover"
													draggable={false}
												/>
											</div>
											<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
											<div className="absolute bottom-0 left-0 right-0 p-6">
												<p className="text-base font-semibold text-white drop-shadow-lg">
													{image.modelName}
												</p>
												<p className="text-sm text-white/80 mt-1 drop-shadow-lg line-clamp-2">
													{image.prompt}
												</p>
											</div>
										</motion.div>
									</motion.div>
								)
							})}
						</motion.div>
					</div>

					{/* Progress Bar */}
					<div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-xl px-6 py-6">
						<div className="mx-auto max-w-4xl">
							<div className="mb-4 text-center">
								<span className="text-sm font-medium text-text">
									{activeIndex + 1} / {allImages.length}
								</span>
							</div>

							<div className="flex justify-center gap-2">
								{allImages.map((_, index) => (
									<motion.button
										key={index}
										onClick={() => {
											const targetX = -(allImages.length + index) * (CARD_WIDTH + CARD_GAP)
											animate(x, targetX, {
												type: 'spring',
												stiffness: 300,
												damping: 30,
											})
											setActiveIndex(index)
										}}
										className="relative h-2 overflow-hidden rounded-full bg-border transition-all"
										animate={{
											width: index === activeIndex ? '40px' : '8px',
											backgroundColor: index === activeIndex ? 'var(--color-primary)' : 'var(--color-border)'
										}}
										transition={{ duration: 0.3 }}
										whileHover={{ scale: 1.3 }}
									/>
								))}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}