import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"
import { VideoGenerationResult } from "@/types/globals"
import { FormDataError, getString } from "@/lib/form-utils"
import { checkTokens, deductTokens } from "@/lib/tokens"
import { TOKEN_CONFIG } from "@/lib/config/tokens"

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN!,
})

const MODEL_DURATION_MAP: Record<string, { short: number; long: number }> = {
    "veo-3.1-fast": { short: 4, long: 8 },     
    "kling-2.5-turbo-pro": { short: 5, long: 10 },
    "wan-2.5": { short: 4, long: 8 },       
};

function getModelDuration(modelId: string, selectedDuration: "short" | "long") {
    const mapping = MODEL_DURATION_MAP[modelId]
    if (!mapping) return 5 // fallback
    return mapping[selectedDuration]
  }

type ReplicateModel = `${string}/${string}` | `${string}/${string}:${string}`

const VIDEO_MODEL_CONFIG: Record<string, { path: ReplicateModel; name: string; supportsAudio: boolean }> = {
	"veo-3.1-fast": {
		path: "google/veo-3.1-fast",
		name: "Veo 3.1 Fast",
		supportsAudio: true,
	},
	"kling-2.5-turbo-pro": {
		path: "kwaivgi/kling-v2.5-turbo-pro",
		name: "Kling 2.5 Turbo Pro",
		supportsAudio: false,
	},
	"wan-2.5": {
		path: "wan-video/wan-2.5-i2v-fast",
		name: "WAN 2.5",
		supportsAudio: false,
	},
}

async function generateVideoWithModel(
    modelId: string,
    modelPath: ReplicateModel,
    imageUrl: string,
    prompt: string,
    duration: number, 
    resolution: string,
    generateAudio: boolean
  ): Promise<string> {
    const aspectRatio = resolution === "1080p" ? "16:9" : "9:16"
  
    if (modelId === "veo-3.1-fast") {
      const output = await replicate.run(modelPath, {
        input: {
          prompt: prompt || "Bring this image to life with natural motion",
          reference_images: [{ value: imageUrl }],
          duration,
          aspect_ratio: aspectRatio,
          resolution: resolution === "1080p" ? "1080p" : "720p",
          generate_audio: generateAudio,
        },
      })
      if (typeof output === "string") return output
      if (Array.isArray(output)) return output[0]
      throw new Error("Unexpected output format from veo-3.1-fast")
    }
  
    if (modelId === "kling-2.5-turbo-pro") {
      const output = await replicate.run(modelPath, {
        input: {
          prompt: prompt || "Natural motion, cinematic camera movement",
          image: imageUrl,
          duration,
          aspect_ratio: aspectRatio,
          negative_prompt: "distorted, blurry, low quality, artifacts",
        },
      })
      if (typeof output === "string") return output
      if (Array.isArray(output)) return output[0]
      throw new Error("Unexpected output format from kling-2.5-turbo-pro")
    }
  
    if (modelId === "wan-2.5") {
      const output = await replicate.run(modelPath, {
        input: {
          image: imageUrl,
          prompt: prompt || "Smooth natural motion",
          duration,
          resolution: resolution === "1080p" ? "1080p" : "720p",
          negative_prompt: "distorted, blurry, static, frozen",
          enable_prompt_expansion: true,
        },
      })
      if (typeof output === "string") return output
      if (Array.isArray(output)) return output[0]
      throw new Error("Unexpected output format from wan-2.5")
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
        const selectedDuration = (formData.get("duration")?.toString() || "short") as "short" | "long"
		const imageUrl = getString(formData, "imageUrl")
		const prompt = formData.get("prompt")?.toString() || ""
		const modelIdsString = getString(formData, "modelIds")
		const modelIds = JSON.parse(modelIdsString) as string[]
		const resolution = formData.get("resolution")?.toString() || "720p"
		const generateAudio = formData.get("generateAudio")?.toString() === "true"
		const sourceType = formData.get("sourceType")?.toString() || "playground"
		const sourceId = formData.get("sourceId")?.toString() || null

		if (
			!Array.isArray(modelIds) ||
			modelIds.length === 0 ||
			modelIds.length > 3
		) {
			return NextResponse.json(
				{ error: "Select 1–3 models" },
				{ status: 400 }
			)
		}

		// Calculate token cost based on models selected
		let totalTokenCost = 0
		modelIds.forEach((modelId) => {
			if (modelId === "veo-3.1-fast") {
				totalTokenCost += TOKEN_CONFIG.COSTS.VIDEO_VEO_3_1
			} else if (modelId === "kling-2.5-turbo-pro") {
				totalTokenCost += TOKEN_CONFIG.COSTS.VIDEO_KLING_2_5
			} else if (modelId === "wan-2.5") {
				totalTokenCost += TOKEN_CONFIG.COSTS.VIDEO_WAN_2_5
			}
		})

		const hasTokens = await checkTokens(user.id, totalTokenCost)

		if (!hasTokens) {
			return NextResponse.json(
				{
					error: "INSUFFICIENT_TOKENS",
					message: `Out of tokens? DM ${TOKEN_CONFIG.CONTACT.handle} on ${TOKEN_CONFIG.CONTACT.platform}`,
					contactUrl: TOKEN_CONFIG.CONTACT.url,
					tokensNeeded: totalTokenCost,
				},
				{ status: 402 }
			)
		}

		const results = await Promise.all(
			modelIds.map(async (modelId) => {
				const config = VIDEO_MODEL_CONFIG[modelId]
				if (!config) {
					console.error(`Unknown video model: ${modelId}`)
					return {
						modelId,
						modelName: "Unknown",
						videoUrl: null,
						error: "Model not found"
					}
				}

				try {
					console.log(`🎬 Generating video with ${config.name}: "${prompt.substring(0, 100)}..."`)
					
                    const generatedUrl = await generateVideoWithModel(
                        modelId,
                        config.path,
                        imageUrl,
                        prompt,
                        getModelDuration(modelId, selectedDuration),
                        resolution,
                        generateAudio && config.supportsAudio
                    )
					
					// Fetch the generated video
					const response = await fetch(generatedUrl)
					if (!response.ok)
						throw new Error(
							`Failed to fetch generated video: ${response.statusText}`
						)

					const blob = await response.blob()
					const arrayBuffer = await blob.arrayBuffer()
					const buffer = Buffer.from(arrayBuffer)

					// Upload to Supabase storage
					const resultFileName = `${
						user.id
					}/video-result-${Date.now()}-${modelId}.mp4`

					const { data: resultUpload, error: resultError } =
						await supabase.storage
							.from("user-images")
							.upload(resultFileName, buffer, {
								contentType: "video/mp4",
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
						videoUrl: urlData.publicUrl,
					}
				} catch (error) {
					console.error(`❌ Failed to generate video with ${modelId}:`, error)
					
					// Extract meaningful error message
					let errorMessage = "Generation failed"
					if (error instanceof Error) {
						if (error.message.includes("NSFW")) {
							errorMessage = "NSFW content detected"
						} else if (error.message.includes("Task not found")) {
							errorMessage = "Model service unavailable - try again"
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
						videoUrl: null,
						error: errorMessage
					}
				}
			})
		)

		// Filter successful results
		const successfulResults = results.filter(r => r.videoUrl) as VideoGenerationResult[]

		// If ALL models failed, return error
		if (successfulResults.length === 0) {
			const errors = results.map(r => r.error).filter(Boolean)
			const errorMessage = errors.length > 0 
				? `All models failed. Common error: ${errors[0]}`
				: "Failed to generate videos for any model"
			
			return NextResponse.json(
				{ error: errorMessage, results },
				{ status: 500 }
			)
		}

		// Deduct tokens only for successful generations
		const tokensToDeduct = successfulResults.reduce((sum, result) => {
			if (result.modelId === "veo-3.1-fast") {
				return sum + TOKEN_CONFIG.COSTS.VIDEO_VEO_3_1
			} else if (result.modelId === "kling-2.5-turbo-pro") {
				return sum + TOKEN_CONFIG.COSTS.VIDEO_KLING_2_5
			} else if (result.modelId === "wan-2.5") {
				return sum + TOKEN_CONFIG.COSTS.VIDEO_WAN_2_5
			}
			return sum
		}, 0)

		await deductTokens(
			user.id,
			tokensToDeduct,
			`Video generation with ${successfulResults.length}/${modelIds.length} successful models`
		)

		// Calculate actual duration used (use the first model's duration)
		const actualDuration = getModelDuration(modelIds[0], selectedDuration)

		// Create database record
		const videoGeneration = await prisma.videoGeneration.create({
			data: {
				userId: user.id,
				sourceImageUrl: imageUrl,
				prompt: prompt || null,
				results: results as any,
				modelIds: modelIds,
				duration: actualDuration,
				resolution,
				generateAudio,
				sourceType,
				sourceId,
				tokensCost: tokensToDeduct,
				status: "completed",
			},
		})

		return NextResponse.json({
			success: true,
			results: results,
			videoGenerationId: videoGeneration.id,
			successCount: successfulResults.length,
			failureCount: results.length - successfulResults.length,
		})
	} catch (error) {
		console.error("Video generation error:", error)

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
						: "Video generation failed",
			},
			{ status: 500 }
		)
	}
}