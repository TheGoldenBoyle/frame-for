import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"
import { checkTokens, deductTokens } from "@/lib/tokens"
import { TOKEN_CONFIG } from "@/lib/config/tokens"
import { FormDataError, getFile, getString } from "@/lib/form-utils"

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN!,
})

async function transformImage(
	imageUrl: string,
	prompt: string
): Promise<string> {
	const output = await replicate.run("google/nano-banana", {
		input: {
			prompt,
			image_input: [imageUrl],
		},
	})

	if (typeof output === "string") return output
	if (Array.isArray(output) && output.length > 0) return output[0]
	throw new Error("Unexpected output format from nano-banana")
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
		const imageFile = getFile(formData, "image")
		const prompt = getString(formData, "prompt")

		// Check tokens
		const tokensNeeded = TOKEN_CONFIG.COSTS.IMAGE_PLAYGROUND
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

		// Upload original image to Supabase
		const originalFileName = `${user.id}/image-playground-original-${Date.now()}.${
			imageFile.name.split(".").pop() || "jpg"
		}`

		const { data: originalUpload, error: originalUploadError } =
			await supabase.storage
				.from("user-images")
				.upload(originalFileName, imageFile, {
					contentType: imageFile.type,
					upsert: false,
				})

		if (originalUploadError) {
			throw new Error(`Upload failed: ${originalUploadError.message}`)
		}

		const { data: originalUrlData } = supabase.storage
			.from("user-images")
			.getPublicUrl(originalUpload.path)

		// Transform the image
		const transformedUrl = await transformImage(
			originalUrlData.publicUrl,
			prompt
		)

		// Download and re-upload the transformed image
		const response = await fetch(transformedUrl)
		if (!response.ok) {
			throw new Error(
				`Failed to fetch transformed image: ${response.statusText}`
			)
		}

		const blob = await response.blob()
		const arrayBuffer = await blob.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		const transformedFileName = `${user.id}/image-playground-transformed-${Date.now()}.webp`

		const { data: transformedUpload, error: transformedUploadError } =
			await supabase.storage
				.from("user-images")
				.upload(transformedFileName, buffer, {
					contentType: "image/webp",
					upsert: false,
				})

		if (transformedUploadError) {
			throw new Error(
				`Upload failed: ${transformedUploadError.message}`
			)
		}

		const { data: transformedUrlData } = supabase.storage
			.from("user-images")
			.getPublicUrl(transformedUpload.path)

		// Deduct tokens
		await deductTokens(
			user.id,
			tokensNeeded,
			`Image Playground transformation`
		)

		// Save to database
		await prisma.imageTransformation.create({
			data: {
				userId: user.id,
				originalUrl: originalUrlData.publicUrl,
				transformedUrl: transformedUrlData.publicUrl,
				prompt,
				modelUsed: "nano-banana",
				tokensCost: tokensNeeded,
			},
		})

		return NextResponse.json({
			success: true,
			imageUrl: transformedUrlData.publicUrl,
			originalUrl: originalUrlData.publicUrl,
		})
	} catch (error) {
		console.error("Image transformation error:", error)

		if (error instanceof FormDataError) {
			return NextResponse.json({ error: error.message }, { status: 400 })
		}

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