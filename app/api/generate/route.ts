import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"
import { FormDataError, getFiles, getOptionalString, getString } from "@/lib/form-utils"
import { checkTokens, deductTokens } from "@/lib/tokens"
import { TOKEN_CONFIG } from "@/lib/config/tokens"

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN!,
})

type ReplicateModel = `${string}/${string}` | `${string}/${string}:${string}`

type ModelConfig = {
	primary: ReplicateModel
	fallback: ReplicateModel
}

const MODEL_MAP: Record<string, ModelConfig> = {
	professional: {
		primary: "black-forest-labs/flux-kontext-pro",
		fallback: "google/nano-banana",
	},
	enhance: {
		primary: "flux-kontext-apps/restore-image",
		fallback: "google/nano-banana",
	},
	background: {
		primary: "google/nano-banana",
		fallback: "google/nano-banana",
	},
	combine: {
		primary: "google/nano-banana",
		fallback: "google/nano-banana",
	},
	memorial: {
		primary: "google/nano-banana",
		fallback: "google/nano-banana",
	},
	family: {
		primary: "google/nano-banana",
		fallback: "google/nano-banana",
	},
}

const SINGLE_IMAGE_PRESETS = {
	professional: "Professional executive portrait in modern corporate style. Subject positioned center frame with confident expression. Premium studio lighting with soft key light and subtle rim lighting for dimension. Neutral sophisticated background suggesting success and authority. Sharp focus on eyes and facial features. Magazine-quality professional headshot. Contemporary business aesthetic with polished refined look.",
	enhance: "ultra high quality, maximum detail, photorealistic, professional photography",
	background: "Change the background setting while keeping the person identical. CRITICAL: The person's face, body, clothing, and pose must remain EXACTLY as in the original photo - do not modify the person in any way. Only replace the background with: {background}. Seamless, natural composition.",
}

const MULTI_IMAGE_PRESETS = {
	combine: "Combine all people from the separate input images into one cohesive photograph. CRITICAL: Each person's facial features, skin tone, eye color, facial structure, and body proportions must be IDENTICAL to their original photos - do not alter, blend, or morph any faces. Position all people naturally together in the frame. Only the people from the input images should appear - do not add extra people.",
	memorial: "Combine all people from the separate input images into one peaceful memorial photograph. CRITICAL: Preserve each person's exact facial features, skin tone, and appearance from their original photos - do not change faces. Position subjects together with respectful, elegant composition. Soft natural lighting, serene atmosphere.",
	family: "Combine all people from the separate input images into one warm family portrait. CRITICAL: Keep each person's facial features and appearance identical to their original photos - do not modify faces. Position everyone together naturally. Bright lighting, joyful atmosphere, candid professional style.",
}

type SinglePreset = keyof typeof SINGLE_IMAGE_PRESETS
type MultiPreset = keyof typeof MULTI_IMAGE_PRESETS

function buildPrompt(
	preset: string,
	imageCount: number,
	usePrimary: boolean,
	bgStyle?: string,
	additionalDetails?: string
): string {
	let basePrompt: string

	if (imageCount === 1) {
		basePrompt = SINGLE_IMAGE_PRESETS[preset as SinglePreset] || SINGLE_IMAGE_PRESETS.enhance
		if (preset === 'background' && bgStyle) {
			basePrompt = basePrompt.replace('{background}', bgStyle)
		}
	} else {
		basePrompt = MULTI_IMAGE_PRESETS[preset as MultiPreset] || MULTI_IMAGE_PRESETS.combine
		if (bgStyle) {
			basePrompt += ` Background setting: ${bgStyle}.`
		}
	}

	if (additionalDetails && additionalDetails.trim()) {
		basePrompt += ` Additional requirements: ${additionalDetails.trim()}`
	}

	return basePrompt
}

async function generateWithModel(
	modelPath: ReplicateModel,
	prompt: string,
	imageUrls: string[],
	preset: string
): Promise<string> {
	if (modelPath === "flux-kontext-apps/restore-image") {
		const imageResponse = await fetch(imageUrls[0])
		if (!imageResponse.ok) {
			throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
		}
		const imageBlob = await imageResponse.blob()
		
		const output = await replicate.run(modelPath, {
			input: {
				input_image: imageBlob,
				output_format: "png",
			},
		})

		if (typeof output === 'string') return output
		if (output && typeof output === 'object' && 'url' in output && typeof output.url === 'function') return output.url()
		if (Array.isArray(output) && output.length > 0) return output[0]
		throw new Error('Unexpected output format from restore-image')
	}

	if (modelPath === "black-forest-labs/flux-kontext-pro") {
		const imageResponse = await fetch(imageUrls[0])
		if (!imageResponse.ok) {
			throw new Error(`Failed to fetch image: ${imageResponse.statusText}`)
		}
		const imageBlob = await imageResponse.blob()
		
		const output = await replicate.run(modelPath, {
			input: {
				prompt: prompt,
				image: imageBlob,
				aspect_ratio: "1:1",
				output_format: "webp",
				output_quality: 100,
			},
		})

		if (typeof output === 'string') return output
		if (output && typeof output === 'object' && 'url' in output && typeof output.url === 'function') return output.url()
		if (Array.isArray(output) && output.length > 0) return output[0]
		throw new Error('Unexpected output format from flux-kontext-pro')
	}

	const output = await replicate.run(modelPath, {
		input: {
			prompt,
			image_input: imageUrls,
		},
	}) as { url: () => string }

	return output.url()
}

export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient()

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser()

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const hasTokens = await checkTokens(user.id, TOKEN_CONFIG.COSTS.GENERATE)
		if (!hasTokens) {
			return NextResponse.json(
				{ 
					error: "INSUFFICIENT_TOKENS",
					message: `Out of tokens? DM ${TOKEN_CONFIG.CONTACT.handle} on ${TOKEN_CONFIG.CONTACT.platform}`,
					contactUrl: TOKEN_CONFIG.CONTACT.url
				},
				{ status: 402 }
			)
		}

		const formData = await request.formData()
		
		const preset = getString(formData, "preset")
		const images = getFiles(formData, "images")
		const bgStyle = getOptionalString(formData, "bgStyle")
		const additionalDetails = getOptionalString(formData, "additionalDetails")

		if (images.length === 0 || images.length > 3) {
			return NextResponse.json(
				{ error: "Please upload 1-3 photos" },
				{ status: 400 }
			)
		}

		const uploadedUrls: string[] = []

		for (let i = 0; i < images.length; i++) {
			const file = images[i]
			const fileName = `${user.id}/${Date.now()}-${i}-${file.name}`

			const { data: uploadData, error: uploadError } =
				await supabase.storage.from("photos").upload(fileName, file, {
					contentType: file.type,
					upsert: false,
				})

			if (uploadError) {
				throw new Error(`Upload failed: ${uploadError.message}`)
			}

			const { data: urlData } = supabase.storage
				.from("photos")
				.getPublicUrl(uploadData.path)

			uploadedUrls.push(urlData.publicUrl)
		}

		const modelConfig = MODEL_MAP[preset] || MODEL_MAP.combine
		let generatedImageUrl: string

		try {
			const primaryPrompt = buildPrompt(
				preset,
				images.length,
				true,
				bgStyle,
				additionalDetails
			)

			generatedImageUrl = await generateWithModel(
				modelConfig.primary,
				primaryPrompt,
				uploadedUrls,
				preset
			)
		} catch (primaryError) {
			console.error(`Primary model ${modelConfig.primary} failed, falling back to ${modelConfig.fallback}:`, primaryError)
			
			const fallbackPrompt = buildPrompt(
				preset,
				images.length,
				false,
				bgStyle,
				additionalDetails
			)

			generatedImageUrl = await generateWithModel(
				modelConfig.fallback,
				fallbackPrompt,
				uploadedUrls,
				preset
			)
		}

		const response = await fetch(generatedImageUrl)
		const blob = await response.blob()
		const arrayBuffer = await blob.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		const resultFileName = `${user.id}/generated-${Date.now()}.webp`
		const { data: resultUpload, error: resultError } =
			await supabase.storage
				.from("photos")
				.upload(resultFileName, buffer, {
					contentType: "image/webp",
					upsert: false,
				})

		if (resultError) {
			throw new Error(`Result upload failed: ${resultError.message}`)
		}

		const { data: resultUrlData } = supabase.storage
			.from("photos")
			.getPublicUrl(resultUpload.path)

		await deductTokens(user.id, TOKEN_CONFIG.COSTS.GENERATE, `Generated image with preset: ${preset}`)

		const photo = await prisma.photo.create({
			data: {
				userId: user.id,
				originalUrls: uploadedUrls,
				generatedUrl: resultUrlData.publicUrl,
				preset: preset.toLowerCase(),
				isWatermarked: true,
				tokensCost: TOKEN_CONFIG.COSTS.GENERATE
			},
		})

		return NextResponse.json({
			success: true,
			imageUrl: resultUrlData.publicUrl,
			photoId: photo.id,
		})
	} catch (error) {
		console.error("Generation error:", error)
		
		if (error instanceof Error && error.message === 'INSUFFICIENT_TOKENS') {
			return NextResponse.json(
				{ 
					error: "INSUFFICIENT_TOKENS",
					message: `Out of tokens? DM ${TOKEN_CONFIG.CONTACT.handle} on ${TOKEN_CONFIG.CONTACT.platform}`,
					contactUrl: TOKEN_CONFIG.CONTACT.url
				},
				{ status: 402 }
			)
		}
		
		if (error instanceof FormDataError) {
			return NextResponse.json(
				{ error: error.message },
				{ status: 400 }
			)
		}

		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Generation failed",
			},
			{ status: 500 }
		)
	}
}