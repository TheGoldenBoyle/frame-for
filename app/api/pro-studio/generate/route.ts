import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"
import { checkTokens, deductTokens } from "@/lib/tokens"
import { TOKEN_CONFIG } from "@/lib/config/tokens"

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN!,
})

type ReplicateModel = `${string}/${string}` | `${string}/${string}:${string}`

const HYPERREALISTIC_MODELS: Record<
	string,
	{ path: ReplicateModel; name: string }
> = {
	"flux-1.1-pro": {
		path: "black-forest-labs/flux-1.1-pro",
		name: "FLUX 1.1 Pro",
	},
}

async function generateImage(
	modelPath: ReplicateModel,
	prompt: string
): Promise<string> {
	const output = await replicate.run(modelPath, {
		input: {
			prompt,
			prompt_upsampling: true,
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
	throw new Error("Unexpected output format")
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

		const body = await request.json()
		const {
			prompt,
			imageCount = 1,
			modelId = "flux-1.1-pro",
			chatHistory,
		} = body

		if (!prompt || typeof prompt !== "string") {
			return NextResponse.json(
				{ error: "Prompt is required" },
				{ status: 400 }
			)
		}

		if (imageCount < 1 || imageCount > 6) {
			return NextResponse.json(
				{ error: "Image count must be between 1 and 6" },
				{ status: 400 }
			)
		}

		const tokensNeeded =
			imageCount * TOKEN_CONFIG.COSTS.PRO_STUDIO_PER_IMAGE
		const hasTokens = await checkTokens(user.id, tokensNeeded)

		if (!hasTokens) {
			return NextResponse.json(
				{
					error: "INSUFFICIENT_TOKENS",
					message: `Out of tokens? DM ${TOKEN_CONFIG.CONTACT.handle} on ${TOKEN_CONFIG.CONTACT.platform}`,
					contactUrl: TOKEN_CONFIG.CONTACT.url,
					tokensNeeded,
				},
				{ status: 402 }
			)
		}

		const modelConfig = HYPERREALISTIC_MODELS[modelId]
		if (!modelConfig) {
			return NextResponse.json(
				{ error: "Invalid model" },
				{ status: 400 }
			)
		}

		const results = []

		for (let i = 0; i < imageCount; i++) {
			try {
				const generatedUrl = await generateImage(
					modelConfig.path,
					prompt
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

				const fileName = `${user.id}/pro-studio-${Date.now()}-${i}.webp`

				const { data: uploadData, error: uploadError } =
					await supabase.storage
						.from("user-images")
						.upload(fileName, buffer, {
							contentType: "image/webp",
							upsert: false,
						})

				if (uploadError) {
					console.error(`Upload error for image ${i}:`, uploadError)
					continue
				}

				const { data: urlData } = supabase.storage
					.from("user-images")
					.getPublicUrl(uploadData.path)

				results.push({
					index: i,
					imageUrl: urlData.publicUrl,
				})
			} catch (error) {
				console.error(`Failed to generate image ${i}:`, error)
				results.push({
					index: i,
					imageUrl: null,
					error: "Generation failed",
				})
			}
		}

		const successfulResults = results.filter((r) => r.imageUrl)

		if (successfulResults.length === 0) {
			return NextResponse.json(
				{ error: "Failed to generate any images" },
				{ status: 500 }
			)
		}

		await deductTokens(
			user.id,
			tokensNeeded,
			`Pro Studio generation: ${imageCount} images`
		)

		const batch = await prisma.proStudioBatch.create({
			data: {
				userId: user.id,
				optimizedPrompt: prompt,
				chatHistory: chatHistory || null,
				imageCount,
				results: results as any,
				tokensCost: tokensNeeded,
				modelUsed: modelId,
			},
		})

		return NextResponse.json({
			success: true,
			batchId: batch.id,
			results,
			tokensUsed: tokensNeeded,
		})
	} catch (error) {
		console.error("Pro Studio generation error:", error)
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