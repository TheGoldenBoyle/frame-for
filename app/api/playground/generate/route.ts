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

function applySystemPrompt(
	systemPromptTemplate: string,
	userPrompt: string
): string {
	return systemPromptTemplate.replace("{USER_PROMPT}", userPrompt)
}

// Helper to get active system prompt for user
async function getActiveSystemPrompt(userId: string): Promise<string> {
	// Try to get user's active custom prompt
	let activePrompt = await prisma.systemPromptTemplate.findFirst({
		where: {
			userId: userId,
			isActive: true,
		},
	})

	// If no user override, get default
	if (!activePrompt) {
		activePrompt = await prisma.systemPromptTemplate.findFirst({
			where: {
				isDefault: true,
				userId: null,
			},
		})
	}

	return activePrompt?.promptTemplate || "{USER_PROMPT}"
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

		if (
			!Array.isArray(modelIds) ||
			modelIds.length === 0 ||
			modelIds.length > 5
		) {
			return NextResponse.json(
				{ error: "Select 1–5 models" },
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

		const systemPromptTemplate = await getActiveSystemPrompt(user.id)
		const finalPrompt = applySystemPrompt(systemPromptTemplate, prompt)
		
		const results = await Promise.all(
			modelIds.map(async (modelId) => {
				const config = MODEL_CONFIG[modelId]
				if (!config) {
					console.error(`Unknown model: ${modelId}`)
					return {
						modelId,
						modelName: "Unknown",
						imageUrl: null,
						error: "Model not found"
					}
				}

				try {
					console.log(`🔤 Sending to ${config.name}: "${finalPrompt.substring(0, 100)}..."`)
					
					const generatedUrl = await generateWithModel(
						modelId,
						config.path,
						finalPrompt
					)
					
					const response = await fetch(generatedUrl)
					if (!response.ok)
						throw new Error(
							`Failed to fetch generated image: ${response.statusText}`
						)

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

					if (resultError) throw resultError

					const { data: urlData } = supabase.storage
						.from("user-images")
						.getPublicUrl(resultUpload.path)

					console.log(`✅ ${config.name} generated successfully`)

					return {
						modelId,
						modelName: config.name,
						imageUrl: urlData.publicUrl,
					}
				} catch (error) {
					console.error(`❌ Failed to generate with ${modelId}:`, error)
					
					// Extract meaningful error message
					let errorMessage = "Generation failed"
					if (error instanceof Error) {
						if (error.message.includes("NSFW")) {
							errorMessage = "NSFW content detected"
						} else if (error.message.includes("Task not found")) {
							errorMessage = "Model service unavailable - try again"  // ✅ Add this
						} else if (error.message.includes("rate limit")) {
							errorMessage = "Rate limited"
						} else if (error.message.includes("timeout")) {
							errorMessage = "Request timed out"
						} else {
							errorMessage = error.message.substring(0, 100)
						}
					}
					
					return {
						modelId,
						modelName: config.name,
						imageUrl: null,
						error: errorMessage
					}
				}
			})
		)

		// Filter to get successful results
		const successfulResults = results.filter(r => r.imageUrl) as PlaygroundResult[]

		// If ALL models failed, return error with details
		if (successfulResults.length === 0) {
			const errors = results.map(r => r.error).filter(Boolean)
			const errorMessage = errors.length > 0 
				? `All models failed. Common error: ${errors[0]}`
				: "Failed to generate images for any model"
			
			return NextResponse.json(
				{ error: errorMessage, results },
				{ status: 500 }
			)
		}

		// Deduct tokens only for successful generations
		const tokensToDeduct = successfulResults.length * TOKEN_CONFIG.COSTS.PLAYGROUND_PER_MODEL
		await deductTokens(
			user.id,
			tokensToDeduct,
			`Playground generation with ${successfulResults.length}/${modelIds.length} successful models`
		)

		const playgroundPhoto = await prisma.playgroundPhoto.create({
			data: {
				userId: user.id,
				prompt,
				originalUrl: null,
				results: results as any, // Include both successful and failed results
				tokensCost: tokensToDeduct,
			},
		})

		// Return all results (including failures) so UI can show which ones failed
		return NextResponse.json({
			success: true,
			results: results,
			playgroundPhotoId: playgroundPhoto.id,
			successCount: successfulResults.length,
			failureCount: results.length - successfulResults.length,
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