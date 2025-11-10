"use client"

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { BeforeAfterSlider } from '@/components/BeforeAfterSlider'
import { Download, Edit3, Maximize2, X, Share2, Copy, Video } from 'lucide-react'
import { useShare } from '@/hooks/useShare'

type ResultCardProps = {
    imageUrl: string
    modelName: string
    prompt?: string
    originalImageUrl?: string
    playgroundPhotoId?: string
    onRevise?: () => void
}

export function ResultCard({
    imageUrl,
    modelName,
    prompt = '',
    originalImageUrl,
    playgroundPhotoId,
    onRevise,
}: ResultCardProps) {
    const router = useRouter()
    const { shareToX, downloadImage, copyImageToClipboard, isSharing } = useShare()
    const [showComparison, setShowComparison] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [showShareMenu, setShowShareMenu] = useState(false)
    const [copySuccess, setCopySuccess] = useState(false)

    // Check if we're mounted (client-side only)
    useEffect(() => {
        setMounted(true)
    }, [])

    // Handle ESC key to close fullscreen
    useEffect(() => {
        if (!isFullscreen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsFullscreen(false)
            }
        }

        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKeyDown)

        return () => {
            document.body.style.overflow = 'unset'
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [isFullscreen])

    // Close share menu when clicking outside
    useEffect(() => {
        if (!showShareMenu) return

        const handleClickOutside = () => setShowShareMenu(false)
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [showShareMenu])

    const handleDownload = async () => {
        const filename = `BildOro-${modelName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`
        await downloadImage(imageUrl, filename, false)
    }

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation()
        setShowShareMenu(!showShareMenu)
    }

    const handleShareToX = async (e: React.MouseEvent) => {
        e.stopPropagation()
        await shareToX({
            imageUrl,
            prompt,
            modelName,
            addWatermark: true,
        })
        setShowShareMenu(false)
    }

    const handleCopyImage = async (e: React.MouseEvent) => {
        e.stopPropagation()
        const result = await copyImageToClipboard(imageUrl)
        if (result.success) {
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        }
        setShowShareMenu(false)
    }

    const handleDownloadWithWatermark = async (e: React.MouseEvent) => {
        e.stopPropagation()
        const filename = `BildOro-${modelName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.jpg`
        await downloadImage(imageUrl, filename, true)
        setShowShareMenu(false)
    }

    const handleEdit = () => {
        // If we have a revision callback, use it
        if (onRevise) {
            onRevise()
        } 
        // Otherwise, navigate to playground with the image
        else if (playgroundPhotoId) {
            router.push(`/dashboard/playground?edit=${playgroundPhotoId}`)
        }
    }

    const handleGenerateVideo = () => {
        // Navigate to image-to-video page with this image
        const params = new URLSearchParams({
            imageUrl: encodeURIComponent(imageUrl),
            sourceType: playgroundPhotoId ? 'playground' : 'gallery',
        })
        if (playgroundPhotoId) {
            params.append('sourceId', playgroundPhotoId)
        }
        if (prompt) {
            params.append('prompt', prompt)
        }
        router.push(`/dashboard/image-to-video?${params.toString()}`)
    }

    const handleFullscreen = () => {
        setIsFullscreen(true)
    }

    const handleCloseFullscreen = () => {
        setIsFullscreen(false)
    }

    return (
        <>
            <div
                className="group relative border border-border rounded-xl bg-surface shadow-md hover:shadow-2xl transition-all duration-300 w-full"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Compact header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-surface/80 backdrop-blur-sm relative z-10">
                    <div className="font-semibold text-xs text-text flex items-center gap-2">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        {modelName}
                    </div>
                    {originalImageUrl && (
                        <button
                            onClick={() => setShowComparison(!showComparison)}
                            className="text-xs font-medium text-primary hover:text-primary-dark transition-colors px-2 py-1 rounded hover:bg-primary/10"
                        >
                            {showComparison ? 'Result' : 'Compare'}
                        </button>
                    )}
                </div>

                {/* Image / Comparison Container */}
                <div
                    className="relative w-full overflow-hidden bg-black/5"
                    style={{ aspectRatio: '1 / 1' }}
                >
                    {showComparison && originalImageUrl ? (
                        <div className="w-full h-full">
                            <BeforeAfterSlider
                                beforeImage={originalImageUrl}
                                afterImage={imageUrl}
                                beforeLabel="Original"
                                afterLabel="Generated"
                            />
                        </div>
                    ) : (
                        <div className="relative w-full h-full cursor-pointer group/image" onClick={handleFullscreen}>
                            <img
                                src={imageUrl}
                                alt={`Generated by ${modelName}`}
                                className={`object-cover w-full h-full transition-transform duration-700 ease-out ${
                                    isHovered ? 'scale-110' : 'scale-100'
                                }`}
                            />
                            
                            <div
                                className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-300 ${
                                    isHovered ? 'opacity-100' : 'opacity-0'
                                }`}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="bg-white/95 backdrop-blur-sm text-black px-4 py-2 rounded-full text-xs font-medium shadow-xl transform transition-transform duration-300 group-hover/image:scale-105">
                                        Click to enlarge
                                    </div>
                                </div>
                            </div>

                            {/* Hover Video Button Overlay */}
                            <div
                                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                                    isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                                }`}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleGenerateVideo()
                                    }}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-full font-semibold shadow-2xl transform hover:scale-105 transition-all"
                                >
                                    <Video className="size-5" />
                                    <span>Generate Video</span>
                                </button>
                            </div>

                            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* Compact action bar */}
                <div className="flex justify-between items-center gap-1 px-2 py-2 border-t border-border bg-surface/80 backdrop-blur-sm">
                    <button
                        onClick={handleFullscreen}
                        title="View Fullscreen"
                        className="flex-1 flex items-center justify-center gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg px-2 py-2 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        <Maximize2 className="size-4" />
                        <span className="text-xs font-medium hidden md:inline">View</span>
                    </button>
                    
                    <button
                        onClick={handleEdit}
                        title="Edit / Revise"
                        className="flex-1 flex items-center justify-center gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg px-2 py-2 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        <Edit3 className="size-4" />
                        <span className="text-xs font-medium hidden md:inline">Edit</span>
                    </button>

                    <button
                        onClick={handleGenerateVideo}
                        title="Generate Video"
                        className="flex-1 flex items-center justify-center gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg px-2 py-2 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        <Video className="size-4" />
                        <span className="text-xs font-medium hidden md:inline">Video</span>
                    </button>
                    
                    <button
                        onClick={handleDownload}
                        title="Download"
                        className="flex-1 flex items-center justify-center gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg px-2 py-2 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        <Download className="size-4" />
                        <span className="text-xs font-medium hidden md:inline">Download</span>
                    </button>
                    
                    <div className="relative flex-1">
                        <button
                            onClick={handleShare}
                            title="Share"
                            className="w-full flex items-center justify-center gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg px-2 py-2 transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                            <Share2 className="size-4" />
                            <span className="text-xs font-medium hidden md:inline">Share</span>
                        </button>

                        {/* Share dropdown menu */}
                        {showShareMenu && (
                            <div className="absolute bottom-full right-0 mb-2 bg-surface border border-border rounded-lg shadow-xl py-2 min-w-[180px] z-50">
                                <button
                                    onClick={handleShareToX}
                                    disabled={isSharing}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-primary/10 transition-colors flex items-center gap-2"
                                >
                                    <Share2 className="size-4" />
                                    Share to X
                                </button>
                                <button
                                    onClick={handleCopyImage}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-primary/10 transition-colors flex items-center gap-2"
                                >
                                    <Copy className="size-4" />
                                    {copySuccess ? '✓ Copied!' : 'Copy Image'}
                                </button>
                                <button
                                    onClick={handleDownloadWithWatermark}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-primary/10 transition-colors flex items-center gap-2"
                                >
                                    <Download className="size-4" />
                                    Download + Watermark
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Glow effect on hover */}
                <div
                    className={`absolute inset-0 rounded-xl transition-opacity duration-500 pointer-events-none ${
                        isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{
                        boxShadow: '0 0 60px rgba(212, 175, 55, 0.4), inset 0 0 40px rgba(212, 175, 55, 0.15)',
                    }}
                />
            </div>

            {/* Fullscreen Modal */}
            {mounted && isFullscreen && createPortal(
                <div
                    className="fixed inset-0 z-[9999] bg-black/98 flex items-center justify-center animate-fade-in"
                    onClick={handleCloseFullscreen}
                    style={{ margin: 0, padding: 0 }}
                >
                    <button
                        onClick={handleCloseFullscreen}
                        className="absolute top-4 right-4 md:top-6 md:right-6 text-white/90 hover:text-white transition-all bg-black/60 hover:bg-primary rounded-full p-2.5 md:p-3 backdrop-blur-sm z-50 hover:scale-110 active:scale-95"
                        title="Close (ESC)"
                    >
                        <X className="size-6 md:size-7" />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-8">
                        <img
                            src={imageUrl}
                            alt={`Generated by ${modelName}`}
                            className="max-w-full max-h-full w-auto h-auto object-contain animate-scale-in"
                            style={{ maxHeight: 'calc(100vh - 8rem)' }}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white px-4 md:px-6 py-2 md:py-3 rounded-full border border-white/20 shadow-2xl z-50">
                        <div className="flex items-center gap-2 md:gap-3">
                            <span className="inline-block w-1.5 md:w-2 h-1.5 md:h-2 rounded-full bg-primary animate-pulse"></span>
                            <span className="font-semibold text-sm md:text-base">{modelName}</span>
                        </div>
                    </div>

                    <div className="absolute top-4 left-4 md:top-6 md:left-6 flex gap-2 md:gap-3 z-50">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleEdit()
                                handleCloseFullscreen()
                            }}
                            className="bg-black/60 hover:bg-primary backdrop-blur-sm text-white rounded-full p-2.5 md:p-3 transition-all hover:scale-110 active:scale-95"
                            title="Edit / Revise"
                        >
                            <Edit3 className="size-4 md:size-5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleGenerateVideo()
                                handleCloseFullscreen()
                            }}
                            className="bg-black/60 hover:bg-primary backdrop-blur-sm text-white rounded-full p-2.5 md:p-3 transition-all hover:scale-110 active:scale-95 group/video"
                            title="Generate Video"
                        >
                            <Video className="size-4 md:size-5 group-hover/video:animate-pulse" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleDownload()
                            }}
                            className="bg-black/60 hover:bg-primary backdrop-blur-sm text-white rounded-full p-2.5 md:p-3 transition-all hover:scale-110 active:scale-95"
                            title="Download"
                        >
                            <Download className="size-4 md:size-5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                handleShare(e)
                            }}
                            className="bg-black/60 hover:bg-primary backdrop-blur-sm text-white rounded-full p-2.5 md:p-3 transition-all hover:scale-110 active:scale-95"
                            title="Share"
                        >
                            <Share2 className="size-4 md:size-5" />
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}