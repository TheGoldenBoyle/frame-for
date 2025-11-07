import { useState } from "react"

interface ShareOptions {
	imageUrl: string
	prompt: string
	modelName: string
	addWatermark?: boolean
}

interface ShareResult {
	success: boolean
	error?: string
}

export function useShare() {
	const [isSharing, setIsSharing] = useState(false)

	const addWatermarkToImage = async (imageUrl: string): Promise<string> => {
		return new Promise((resolve, reject) => {
			const img = new Image()
			img.crossOrigin = "anonymous"

			img.onload = () => {
				const canvas = document.createElement("canvas")
				const ctx = canvas.getContext("2d")

				if (!ctx) {
					reject(new Error("Failed to get canvas context"))
					return
				}

				canvas.width = img.width
				canvas.height = img.height

				// Draw the original image
				ctx.drawImage(img, 0, 0)

				// Add watermark
				const fontSize = Math.max(img.width * 0.03, 16)
				ctx.font = `${fontSize}px sans-serif`
				ctx.fillStyle = "rgba(212, 175, 55, 0.7)"
				ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"
				ctx.lineWidth = 2

				const watermarkText = "BildOro.com"
				const padding = fontSize * 0.5
				const x =
					img.width - ctx.measureText(watermarkText).width - padding
				const y = img.height - padding

				// Add text shadow effect
				ctx.strokeText(watermarkText, x, y)
				ctx.fillText(watermarkText, x, y)

				// Convert to blob
				canvas.toBlob((blob) => {
					if (blob) {
						const url = URL.createObjectURL(blob)
						resolve(url)
					} else {
						reject(new Error("Failed to create blob"))
					}
				}, "image/png")
			}

			img.onerror = () => {
				reject(new Error("Failed to load image"))
			}

			img.src = imageUrl
		})
	}

	const shareToX = async ({
		imageUrl,
		prompt,
		modelName,
		addWatermark = true,
	}: ShareOptions): Promise<ShareResult> => {
		setIsSharing(true)

		try {
			let finalImageUrl = imageUrl

			// Add watermark if requested
			if (addWatermark) {
				try {
					finalImageUrl = await addWatermarkToImage(imageUrl)
				} catch (error) {
					console.warn(
						"Failed to add watermark, using original image:",
						error
					)
				}
			}

			// Create tweet text
			const tweetText = `${prompt.slice(0, 200)}${
				prompt.length > 200 ? "..." : ""
			}\n\nGenerated with ${modelName} on BildOro.com`

			// Twitter Web Intent URL
			const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
				tweetText
			)}&url=${encodeURIComponent("https://bildoro.com")}`

			// Open in new window
			window.open(twitterUrl, "_blank", "width=550,height=420")

			setIsSharing(false)
			return { success: true }
		} catch (error) {
			setIsSharing(false)
			return {
				success: false,
				error: error instanceof Error ? error.message : "Share failed",
			}
		}
	}

	const downloadImage = async (
		imageUrl: string,
		filename: string,
		addWatermark = false
	): Promise<ShareResult> => {
		try {
			let finalImageUrl = imageUrl

			if (addWatermark) {
				try {
					finalImageUrl = await addWatermarkToImage(imageUrl)
				} catch (error) {
					console.warn(
						"Failed to add watermark, downloading original:",
						error
					)
				}
			}

			const response = await fetch(finalImageUrl)
			const blob = await response.blob()
			const url = URL.createObjectURL(blob)

			const a = document.createElement("a")
			a.href = url
			a.download = filename
			a.click()

			URL.revokeObjectURL(url)
			if (finalImageUrl !== imageUrl) {
				URL.revokeObjectURL(finalImageUrl)
			}

			return { success: true }
		} catch (error) {
			return {
				success: false,
				error:
					error instanceof Error ? error.message : "Download failed",
			}
		}
	}

	const copyImageToClipboard = async (
		imageUrl: string
	): Promise<ShareResult> => {
		try {
			const response = await fetch(imageUrl)
			const blob = await response.blob()

			await navigator.clipboard.write([
				new ClipboardItem({ [blob.type]: blob }),
			])

			return { success: true }
		} catch (error) {
			return {
				success: false,
				error: error instanceof Error ? error.message : "Copy failed",
			}
		}
	}

	return {
		isSharing,
		shareToX,
		downloadImage,
		copyImageToClipboard,
	}
}
