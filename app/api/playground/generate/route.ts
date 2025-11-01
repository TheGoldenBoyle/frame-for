import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"
import { PlaygroundResult } from "@/types/globals"
import { FormDataError, getString } from "@/lib/form-utils"
import { checkTokens, deductTokens } from "@/lib/tokens"
import { TOKEN_CONFIG } from "@/lib/config/tokens"

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN!,
})

type ReplicateModel = `${string}/${string}` | `${string}/${string}:${string}`

const MODEL_CONFIG: Record<string, { path: ReplicateModel; name: string }> = {
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
	prompt: string
): Promise<string> {
	if (modelId === "flux-1.1-pro") {
		const output = await replicate.run(modelPath, {
			input: { prompt, prompt_upsampling: true },
		})
		if (typeof output === "string") return output
		if (Array.isArray(output)) return output[0]
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
		if (Array.isArray(output)) return output[0]
		throw new Error("Unexpected output format from imagen-4")
	}

	if (modelId === "seedream-4") {
		const output = await replicate.run(modelPath, {
			input: { prompt, aspect_ratio: "1:1" },
		})
		if (Array.isArray(output) && output.length > 0) {
			if (typeof output[0] === "string") return output[0]
		}
		throw new Error("Unexpected output format from seedream-4")
	}

	if (modelId === "ideogram-v3-turbo") {
		const output = await replicate.run(modelPath, {
			input: { prompt, aspect_ratio: "1:1" },
		})
		if (typeof output === "string") return output
		if (Array.isArray(output)) return output[0]
		throw new Error("Unexpected output format from ideogram-v3-turbo")
	}

	if (modelId === "recraft-v3") {
		const output = await replicate.run(modelPath, {
			input: { prompt, size: "1024x1024" },
		})
		if (typeof output === "string") return output
		if (Array.isArray(output)) return output[0]
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
		const modelIds = JSON.parse(modelIdsString) as string[]

		if (!Array.isArray(modelIds) || modelIds.length === 0 || modelIds.length > 5) {
			return NextResponse.json({ error: "Select 1–5 models" }, { status: 400 })
		}

		const tokensNeeded = modelIds.length * TOKEN_CONFIG.COSTS.PLAYGROUND_PER_MODEL
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

		// 🧠 Parallel model generation
		const results = await Promise.all(
			modelIds.map(async (modelId) => {
				const config = MODEL_CONFIG[modelId]
				if (!config) {
					console.error(`Unknown model: ${modelId}`)
					return null
				}

				try {
					const generatedUrl = await generateWithModel(modelId, config.path, prompt)
					const response = await fetch(generatedUrl)
					if (!response.ok)
						throw new Error(`Failed to fetch generated image: ${response.statusText}`)

					const blob = await response.blob()
					const arrayBuffer = await blob.arrayBuffer()
					const buffer = Buffer.from(arrayBuffer)

					const resultFileName = `${user.id}/playground-result-${Date.now()}-${modelId}.webp`

					const { data: resultUpload, error: resultError } = await supabase.storage
						.from("user-images")
						.upload(resultFileName, buffer, {
							contentType: "image/webp",
							upsert: false,
						})

					if (resultError) throw resultError

					const { data: urlData } = supabase.storage
						.from("user-images")
						.getPublicUrl(resultUpload.path)

					return {
						modelId,
						modelName: config.name,
						imageUrl: urlData.publicUrl,
					}
				} catch (error) {
					console.error(`Failed to generate with ${modelId}:`, error)
					return null
				}
			})
		)

		const filteredResults = results.filter(Boolean) as PlaygroundResult[]

		if (filteredResults.length === 0) {
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
				originalUrl: null,
				results: filteredResults as any,
				tokensCost: tokensNeeded,
			},
		})

		return NextResponse.json({
			success: true,
			results: filteredResults,
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
				error: error instanceof Error ? error.message : "Generation failed",
			},
			{ status: 500 }
		)
	}
}
