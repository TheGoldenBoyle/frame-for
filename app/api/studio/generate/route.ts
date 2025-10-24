import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"
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

type ModelFn = (
    modelPath: ReplicateModel, 
    imageUrl: string | string[] | null, 
    prompt: string
) => Promise<string | string[]>;

type TransformationConfig = {
    prompt: (userPrompt: string) => string;
    modelFn: ModelFn;
}

const TRANSFORMATION_CONFIGS: Record<string, TransformationConfig> = {
    'restore': {
        prompt: (userPrompt: string) => 
            userPrompt || "Ultra high quality restoration, maximum detail, photorealistic enhancement",
        modelFn: async (
            modelPath: ReplicateModel, 
            imageUrl: string | string[] | null, 
            prompt: string
        ): Promise<string> => {
            // Type guard to ensure imageUrl is a string for restore
            if (imageUrl === null) {
                throw new Error('Image is required for restoration');
            }
            
            // Ensure imageUrl is a string (not an array)
            const singleImageUrl = Array.isArray(imageUrl) 
                ? imageUrl[0] 
                : imageUrl;

            const output = await replicate.run(modelPath, {
                input: {
                    input_image: singleImageUrl,
                    prompt: prompt,
                    output_format: "png",
                }
            });

            // Ensure we return a string URL
            return Array.isArray(output) ? output[0] : output;
        }
    },
    'text-to-image': {
        prompt: (userPrompt: string) => 
            userPrompt || "High-quality, photorealistic image generation",
        modelFn: async (
            modelPath: ReplicateModel, 
            imageUrl: string | string[] | null, 
            prompt: string
        ): Promise<string> => {
            // Text-to-image doesn't need an input image
            const output = await replicate.run(modelPath, {
                input: {
                    prompt: prompt,
                    aspect_ratio: "1:1",
                }
            });

            // Ensure we return a string URL
            return Array.isArray(output) ? output[0] : output;
        }
    },
    'combine-people': {
        prompt: (userPrompt: string) => 
            userPrompt || "Combine all people from the separate input images into one cohesive photograph.",
        modelFn: async (
            modelPath: ReplicateModel, 
            imageUrl: string | string[] | null, 
            prompt: string
        ): Promise<string> => {
            // Ensure imageUrls is an array for people combination
            if (!imageUrl || (Array.isArray(imageUrl) && imageUrl.length === 0)) {
                throw new Error('Multiple images are required for combination');
            }

            const images = Array.isArray(imageUrl) ? imageUrl : [imageUrl];

            const output = await replicate.run(modelPath, {
                input: {
                    images: images,
                    prompt: prompt,
                }
            });

            // Ensure we return a string URL
            return Array.isArray(output) ? output[0] : output;
        }
    },
    'background-change': {
        prompt: (userPrompt: string) => 
            userPrompt || "Change the background setting while keeping the person identical.",
        modelFn: async (
            modelPath: ReplicateModel, 
            imageUrl: string | string[] | null, 
            prompt: string
        ): Promise<string> => {
            // Type guard to ensure imageUrl is a string for background change
            if (imageUrl === null) {
                throw new Error('Image is required for background change');
            }
            
            // Ensure imageUrl is a string (not an array)
            const singleImageUrl = Array.isArray(imageUrl) 
                ? imageUrl[0] 
                : imageUrl;

            const output = await replicate.run(modelPath, {
                input: {
                    image: singleImageUrl,
                    prompt: prompt,
                }
            });

            // Ensure we return a string URL
            return Array.isArray(output) ? output[0] : output;
        }
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // User authentication
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Parse form data
        const formData = await request.formData()
        const prompt = getString(formData, "prompt")
        const preset = getString(formData, "preset")
        const modelIdsString = getString(formData, "modelIds")
        const image1 = getOptionalFile(formData, "image1")
        const image2 = getOptionalFile(formData, "image2")

        // Validate preset
        if (!TRANSFORMATION_CONFIGS[preset]) {
            return NextResponse.json({ error: "Invalid transformation preset" }, { status: 400 })
        }

        const modelIds = JSON.parse(modelIdsString) as string[]

        // Upload images
        const uploadedUrls: string[] = []
        if (image1) {
            const fileName = `${user.id}/transform-${Date.now()}-1.${image1.name.split('.').pop()}`
            const { data: uploadData } = await supabase.storage
                .from("user-images")
                .upload(fileName, image1, {
                    contentType: image1.type,
                    upsert: false,
                })
            
            const { data: urlData } = supabase.storage
                .from("user-images")
                .getPublicUrl(uploadData.path)
            
            uploadedUrls.push(urlData.publicUrl)
        }

        if (image2) {
            const fileName = `${user.id}/transform-${Date.now()}-2.${image2.name.split('.').pop()}`
            const { data: uploadData } = await supabase.storage
                .from("user-images")
                .upload(fileName, image2, {
                    contentType: image2.type,
                    upsert: false,
                })
            
            const { data: urlData } = supabase.storage
                .from("user-images")
                .getPublicUrl(uploadData.path)
            
            uploadedUrls.push(urlData.publicUrl)
        }

        // Calculate tokens
        const tokensNeeded = modelIds.length * TOKEN_CONFIG.COSTS.PLAYGROUND_PER_MODEL
        const hasTokens = await checkTokens(user.id, tokensNeeded)

        if (!hasTokens) {
            return NextResponse.json(
                {
                    error: "INSUFFICIENT_TOKENS",
                    message: `Out of tokens? DM ${TOKEN_CONFIG.CONTACT.handle} on ${TOKEN_CONFIG.CONTACT.platform}`,
                    contactUrl: TOKEN_CONFIG.CONTACT.url,
                },
                { status: 402 }
            )
        }

        // Generate results for each model
        const results: any[] = []
        const transformConfig = TRANSFORMATION_CONFIGS[preset]

        for (const modelId of modelIds) {
            try {
                const modelConfig = MODEL_CONFIG[modelId]
                if (!modelConfig) {
                    console.error(`Unknown model: ${modelId}`)
                    continue
                }

                // Determine prompt and image inputs based on preset
                const finalPrompt = transformConfig.prompt(prompt)
                
                let generatedUrl: string
                if (preset === 'combine-people') {
                    generatedUrl = await transformConfig.modelFn(
                        modelConfig.path, 
                        uploadedUrls, 
                        finalPrompt
                    )
                } else if (uploadedUrls.length > 0) {
                    generatedUrl = await transformConfig.modelFn(
                        modelConfig.path, 
                        uploadedUrls[0], 
                        finalPrompt
                    )
                } else {
                    generatedUrl = await transformConfig.modelFn(
                        modelConfig.path, 
                        null, 
                        finalPrompt
                    )
                }

                // Upload generated image
                const response = await fetch(generatedUrl)
                const blob = await response.blob()
                const arrayBuffer = await blob.arrayBuffer()
                const buffer = Buffer.from(arrayBuffer)

                const resultFileName = `${user.id}/generated-${Date.now()}.webp`
                const { data: resultUpload } = await supabase.storage
                    .from("user-images")
                    .upload(resultFileName, buffer, {
                        contentType: "image/webp",
                        upsert: false,
                    })

                const { data: resultUrlData } = supabase.storage
                    .from("user-images")
                    .getPublicUrl(resultUpload.path)

                results.push({
                    modelId,
                    modelName: modelConfig.name,
                    imageUrl: resultUrlData.publicUrl,
                })
            } catch (modelError) {
                console.error(`Model ${modelId} generation failed:`, modelError)
                results.push({
                    modelId,
                    modelName: MODEL_CONFIG[modelId]?.name,
                    error: modelError instanceof Error ? modelError.message : 'Generation failed'
                })
            }
        }

        // Deduct tokens
        await deductTokens(
            user.id,
            tokensNeeded,
            `Image transformation: ${preset}`
        )

        // Save transformation to database
        const transformationRecord = await prisma.imageTransformation.create({
            data: {
                userId: user.id,
                preset,
                originalUrls: uploadedUrls,
                results: results as any,
                prompt,
                tokensCost: tokensNeeded,
            }
        })

        return NextResponse.json({
            success: true,
            results,
            transformationId: transformationRecord.id,
        })
    } catch (error) {
        console.error("Transformation error:", error)

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Transformation failed",
            },
            { status: 500 }
        )
    }
}