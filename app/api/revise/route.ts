import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"
import { FormDataError, getString } from "@/lib/form-utils"
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

function buildRevisionPrompt(preset: string, revisionPrompt: string, usePrimary: boolean): string {
	if (preset === 'professional' && usePrimary) {
		return `Professional executive portrait with these modifications: ${revisionPrompt}. Maintain premium studio lighting, sophisticated composition, and magazine-quality finish. Sharp focus and contemporary business aesthetic.`
	}

	if (preset === 'enhance' && usePrimary) {
		return `${revisionPrompt}. ultra high quality, maximum detail, photorealistic, professional photography`
	}

	return `Using the provided images, make the following changes: ${revisionPrompt}. CRITICAL: Preserve all facial features, facial structure, skin tones, eye colors, and body proportions exactly as they appear in the input images - do not change, blend, or modify any faces. Only apply the requested changes.`
}

async function generateWithModel(
    modelPath: ReplicateModel,
    prompt: string,
    imageUrls: string[],
    preset: string
): Promise<string> {
    console.log(`Generating with model: ${modelPath}`);
    console.log(`Image URLs: ${imageUrls}`);
    console.log(`Prompt: ${prompt}`);
    console.log(`Preset: ${preset}`);

    type ModelProcessor = () => Promise<string>

    const MODELS: Record<string, ModelProcessor> = {
        "restore-image": async () => {
            try {
                const imageResponse = await fetch(imageUrls[0], { method: 'HEAD' })
                if (!imageResponse.ok) {
                    throw new Error(`Invalid image URL: ${imageResponse.status} ${imageResponse.statusText}`)
                }

                const fullImageResponse = await fetch(imageUrls[0])
                const imageBlob = await fullImageResponse.blob()

                const output = await replicate.run(modelPath, {
                    input: {
                        input_image: imageBlob,
                        output_format: "png",
                    },
                })

                if (typeof output === "string") return output
                if (output && typeof output === "object" && "url" in output && typeof output.url === "function") 
                    return output.url()
                if (Array.isArray(output) && output.length > 0) return output[0]
                throw new Error("Unexpected output format from restore-image")
            } catch (error) {
                console.error(`Restore image error: ${error}`);
                throw error;
            }
        },
        "flux-kontext-pro": async () => {
            try {
                const imageResponse = await fetch(imageUrls[0], { method: 'HEAD' })
                if (!imageResponse.ok) {
                    throw new Error(`Invalid image URL: ${imageResponse.status} ${imageResponse.statusText}`)
                }

                const fullImageResponse = await fetch(imageUrls[0])
                const imageBlob = await fullImageResponse.blob()

                const output = await replicate.run(modelPath, {
                    input: {
                        prompt: prompt,
                        image: imageBlob,
                        aspect_ratio: "1:1",
                        output_format: "webp",
                        output_quality: 100,
                    },
                })

                if (typeof output === "string") return output
                if (output && typeof output === "object" && "url" in output && typeof output.url === "function") 
                    return output.url()
                if (Array.isArray(output) && output.length > 0) return output[0]
                throw new Error("Unexpected output format from flux-kontext-pro")
            } catch (error) {
                console.error(`Flux Kontext Pro error: ${error}`);
                throw error;
            }
        }
    }

    const getModelProcessor = (path: string) => {
        const modelKey = path.split('/').pop() || ''
        return MODELS[modelKey]
    }

    const modelProcessor = getModelProcessor(modelPath)
    if (!modelProcessor) {
        throw new Error(`Unsupported model: ${modelPath}`)
    }

    return await modelProcessor()
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

		const hasTokens = await checkTokens(user.id, TOKEN_CONFIG.COSTS.REVISE)
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
		
		const photoId = getString(formData, "photoId")
		const revisionPrompt = getString(formData, "revisionPrompt")

		const photo = await prisma.photo.findUnique({
			where: {
				id: photoId,
				userId: user.id,
			},
		})

		if (!photo) {
			return NextResponse.json(
				{ error: "Photo not found" },
				{ status: 404 }
			)
		}

		const modelConfig = MODEL_MAP[photo.preset] || MODEL_MAP.combine
		let generatedImageUrl: string

		try {
			const primaryPrompt = buildRevisionPrompt(photo.preset, revisionPrompt.trim(), true)
			generatedImageUrl = await generateWithModel(
				modelConfig.primary,
				primaryPrompt,
				photo.originalUrls,
				photo.preset
			)
		} catch (primaryError) {
			console.error(`Primary model ${modelConfig.primary} failed for revision, falling back:`, primaryError)
			
			const fallbackPrompt = buildRevisionPrompt(photo.preset, revisionPrompt.trim(), false)
			generatedImageUrl = await generateWithModel(
				modelConfig.fallback,
				fallbackPrompt,
				photo.originalUrls,
				photo.preset
			)
		}

		const response = await fetch(generatedImageUrl)
		const blob = await response.blob()
		const arrayBuffer = await blob.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		const resultFileName = `${user.id}/revised-${Date.now()}.webp`
		const { data: resultUpload, error: resultError } =
			await supabase.storage
				.from("user-images")
				.upload(resultFileName, buffer, {
					contentType: "image/webp",
					upsert: false,
				})

		if (resultError) {
			throw new Error(`Result upload failed: ${resultError.message}`)
		}

		// Generate signed URL with 1-hour expiration
		const { data: signedUrlData } = await supabase.storage
			.from("user-images")
			.createSignedUrl(resultUpload.path, 3600) // 1 hour expiration

		// Fallback to public URL if signed URL generation fails
		const imageUrl = signedUrlData?.signedUrl || 
			supabase.storage.from("user-images").getPublicUrl(resultUpload.path).data.publicUrl

		// Extensive logging for debugging
		console.log('URL Generation Debug:', {
			signedUrl: signedUrlData?.signedUrl,
			publicUrl: supabase.storage.from("user-images").getPublicUrl(resultUpload.path).data.publicUrl,
			uploadPath: resultUpload.path
		})

		await deductTokens(user.id, TOKEN_CONFIG.COSTS.REVISE, `Revised photo: ${photoId}`)

		const updatedPhoto = await prisma.photo.update({
			where: {
				id: photoId,
			},
			data: {
				generatedUrl: imageUrl,
			},
		})

		await prisma.revision.create({
			data: {
				photoId,
				prompt: revisionPrompt,
				resultUrl: imageUrl,
				tokensCost: TOKEN_CONFIG.COSTS.REVISE
			}
		})

		return NextResponse.json({
			success: true,
			imageUrl,
			photoId: updatedPhoto.id,
		})
	} catch (error) {
		console.error("Revision error:", error)
		
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
					error instanceof Error ? error.message : "Revision failed",
			},
			{ status: 500 }
		)
	}
}