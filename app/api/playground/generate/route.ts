import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"
import { PlaygroundResult } from "@/types/globals"

import { FormDataError, getOptionalFile, getString } from "@/lib/form-utils"
import { checkTokens, deductTokens } from "@/lib/tokens"
import { TOKEN_CONFIG } from "@/lib/config/tokens"

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN!,
})

type ReplicateModel = `${string}/${string}` | `${string}/${string}:${string}`

const MODEL_CONFIG: Record<string, { path: ReplicateModel; name: string }> = {
	"nano-banana": {
		path: "google/nano-banana",
		name: "Nano Banana",
	},
	"flux-1.1-pro": {
		path: "black-forest-labs/flux-1.1-pro",
		name: "FLUX 1.1 Pro",
	},
	"imagen-4": {
		path: "google/imagen-4",
		name: "Imagen 4",
	},
	"seedream-4": {
		path: "bytedance/seedream-4",
		name: "Seedream 4",
	},
	"ideogram-v3-turbo": {
		path: "ideogram-ai/ideogram-v3-turbo",
		name: "Ideogram v3 Turbo",
	},
	"recraft-v3": {
		path: "recraft-ai/recraft-v3",
		name: "Recraft v3",
	},
}

async function generateWithModel(
	modelId: string,
	modelPath: ReplicateModel,
	prompt: string,
	imageUrl?: string
): Promise<string> {
	if (modelId === "nano-banana") {
		if (!imageUrl) {
			throw new Error("Nano Banana requires an input image")
		}

		const output = (await replicate.run(modelPath, {
			input: {
				prompt,
				image_input: [imageUrl],
			},
		})) as { url: () => string }

		return output.url()
	}

	if (modelId === "flux-1.1-pro") {
		const input: Record<string, any> = {
			prompt,
			prompt_upsampling: true,
		}

		if (imageUrl) {
			const imageResponse = await fetch(imageUrl)
			if (!imageResponse.ok) {
				throw new Error(
					`Failed to fetch image: ${imageResponse.statusText}`
				)
			}
			const imageBlob = await imageResponse.blob()
			input.image = imageBlob
		}

		const output = await replicate.run(modelPath, { input })

		if (typeof output === "string") return output
		if (
			output &&
			typeof output === "object" &&
			"url" in output &&
			typeof output.url === "function"
		)
			return output.url()
		if (Array.isArray(output) && output.length > 0) return output[0]
		throw new Error("Unexpected output format from flux-1.1-pro")
	}

	if (modelId === "imagen-4") {
		const output = await replicate.run(modelPath, {
			input: {
				prompt,
				aspect_ratio: "1:1",
				safety_filter_level: "block_medium_and_above",
			},
		})

		if (typeof output === "string") return output
		if (
			output &&
			typeof output === "object" &&
			"url" in output &&
			typeof output.url === "function"
		)
			return output.url()
		if (Array.isArray(output) && output.length > 0) return output[0]
		throw new Error("Unexpected output format from imagen-4")
	}

	if (modelId === "seedream-4") {
		const output = await replicate.run(modelPath, {
			input: {
				prompt,
				aspect_ratio: "1:1",
			},
		})

		if (Array.isArray(output) && output.length > 0) {
			const first = output[0]
			if (typeof first === "string") return first
			if (
				first &&
				typeof first === "object" &&
				"url" in first &&
				typeof first.url === "function"
			)
				return first.url()
		}
		if (typeof output === "string") return output
		throw new Error("Unexpected output format from seedream-4")
	}

	if (modelId === "ideogram-v3-turbo") {
		const output = await replicate.run(modelPath, {
			input: {
				prompt,
				aspect_ratio: "1:1",
			},
		})

		if (typeof output === "string") return output
		if (
			output &&
			typeof output === "object" &&
			"url" in output &&
			typeof output.url === "function"
		)
			return output.url()
		if (Array.isArray(output) && output.length > 0) return output[0]
		throw new Error("Unexpected output format from ideogram-v3-turbo")
	}

	if (modelId === "recraft-v3") {
		const output = await replicate.run(modelPath, {
			input: {
				prompt,
				size: "1024x1024",
			},
		})

		if (typeof output === "string") return output
		if (
			output &&
			typeof output === "object" &&
			"url" in output &&
			typeof output.url === "function"
		)
			return output.url()
		if (Array.isArray(output) && output.length > 0) return output[0]
		throw new Error("Unexpected output format from recraft-v3")
	}

	throw new Error(`Unknown model: ${modelId}`)
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

		const formData = await request.formData()

		const prompt = getString(formData, "prompt")
		const modelIdsString = getString(formData, "modelIds")
		const imageFile = getOptionalFile(formData, "image")

		const modelIds = JSON.parse(modelIdsString) as string[]

		if (
			!Array.isArray(modelIds) ||
			modelIds.length === 0 ||
			modelIds.length > 3
		) {
			return NextResponse.json(
				{ error: "Select 1-3 models" },
				{ status: 400 }
			)
		}

		const tokensNeeded =
			modelIds.length * TOKEN_CONFIG.COSTS.PLAYGROUND_PER_MODEL
		const hasTokens = await checkTokens(user.id, tokensNeeded)

		if (!hasTokens) {
			return NextResponse.json(
				{
					error: "INSUFFICIENT_TOKENS",
					message: `Out of tokens? DM ${TOKEN_CONFIG.CONTACT.handle} on ${TOKEN_CONFIG.CONTACT.platform}`,
					contactUrl: TOKEN_CONFIG.CONTACT.url,
					tokensNeeded,
					tokensPerModel: TOKEN_CONFIG.COSTS.PLAYGROUND_PER_MODEL,
				},
				{ status: 402 }
			)
		}

		let uploadedImageUrl: string | undefined

		if (imageFile) {
			const fileName = `${user.id}/playground-${Date.now()}-${
				imageFile.name
			}`

			const { data: uploadData, error: uploadError } =
				await supabase.storage
					.from("user-images")
					.upload(fileName, imageFile, {
						contentType: imageFile.type,
						upsert: false,
					})

			if (uploadError) {
				throw new Error(`Upload failed: ${uploadError.message}`)
			}

			const { data: urlData } = supabase.storage
				.from("user-images")
				.getPublicUrl(uploadData.path)

			uploadedImageUrl = urlData.publicUrl
		}

		const results: PlaygroundResult[] = []

		for (const modelId of modelIds) {
			const config = MODEL_CONFIG[modelId]
			if (!config) {
				console.error(`Unknown model: ${modelId}`)
				continue
			}

			try {
				const generatedUrl = await generateWithModel(
					modelId,
					config.path,
					prompt,
					uploadedImageUrl
				)

				const response = await fetch(generatedUrl)
				if (!response.ok) {
					throw new Error(
						`Failed to fetch generated image: ${response.statusText}`
					)
				}

				const blob = await response.blob()
				const arrayBuffer = await blob.arrayBuffer()
				const buffer = Buffer.from(arrayBuffer)

				const resultFileName = `${
					user.id
				}/playground-result-${Date.now()}-${modelId}.webp`
				const { data: resultUpload, error: resultError } =
					await supabase.storage
						.from("user-images")
						.upload(resultFileName, buffer, {
							contentType: "image/webp",
							upsert: false,
						})

				if (resultError) {
					console.error(`Upload error for ${modelId}:`, resultError)
					continue
				}

				const { data: resultUrlData } = supabase.storage
					.from("user-images")
					.getPublicUrl(resultUpload.path)

				const explicitUrl = `${
					process.env.NEXT_PUBLIC_SUPABASE_URL
				}/storage/v1/object/public/user-images/${resultUpload.path.replace(
					"user-images/",
					""
				)}`

				results.push({
					modelId,
					modelName: config.name,
					imageUrl: explicitUrl,
				})
			} catch (error) {
				console.error(`Failed to generate with ${modelId}:`, error)
				// Optionally, you can choose to add failed models to results array
				// results.push({
				//   modelId,
				//   modelName: config.name,
				//   imageUrl: null,
				// })
			}
		}

		// Only proceed if at least one model succeeded
		if (results.length === 0) {
			return NextResponse.json(
				{ error: "Failed to generate images for any model" },
				{ status: 500 }
			)
		}

		await deductTokens(
			user.id,
			tokensNeeded,
			`Playground generation with ${modelIds.length} models`
		)

		const playgroundPhoto = await prisma.playgroundPhoto.create({
			data: {
				userId: user.id,
				prompt,
				originalUrl: uploadedImageUrl || null,
				results: results as any,
				tokensCost: tokensNeeded,
			},
		})

		return NextResponse.json({
			success: true,
			results,
			playgroundPhotoId: playgroundPhoto.id,
		})
	} catch (error) {
		console.error("Playground generation error:", error)

		if (error instanceof Error && error.message === "INSUFFICIENT_TOKENS") {
			return NextResponse.json(
				{
					error: "INSUFFICIENT_TOKENS",
					message: `Out of tokens? DM ${TOKEN_CONFIG.CONTACT.handle} on ${TOKEN_CONFIG.CONTACT.platform}`,
					contactUrl: TOKEN_CONFIG.CONTACT.url,
				},
				{ status: 402 }
			)
		}

		if (error instanceof FormDataError) {
			return NextResponse.json({ error: error.message }, { status: 400 })
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
