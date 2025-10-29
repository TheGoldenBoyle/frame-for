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

		// Parse FormData with error handling
		let formData: FormData
		try {
			formData = await request.formData()
		} catch (error) {
			console.error("Failed to parse FormData:", error)
			return NextResponse.json(
				{ error: "Failed to parse form data. Please try uploading the image again." },
				{ status: 400 }
			)
		}

		// Validate and extract form data
		let imageFile: File
		let prompt: string

		try {
			imageFile = getFile(formData, "image")
			prompt = getString(formData, "prompt")
		} catch (error) {
			console.error("Form validation error:", error)
			return NextResponse.json(
				{ 
					error: error instanceof FormDataError 
						? error.message 
						: "Invalid form data. Please ensure the image is properly uploaded." 
				},
				{ status: 400 }
			)
		}

		// Validate file size (e.g., max 10MB)
		const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
		if (imageFile.size > MAX_FILE_SIZE) {
			return NextResponse.json(
				{ error: "Image file is too large. Maximum size is 10MB." },
				{ status: 400 }
			)
		}

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
		if (!allowedTypes.includes(imageFile.type)) {
			return NextResponse.json(
				{ error: "Invalid file type. Please upload a JPEG, PNG, or WebP image." },
				{ status: 400 }
			)
		}

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

		// Convert File to Buffer for upload
		const arrayBuffer = await imageFile.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		// Upload original image to Supabase
		const originalFileName = `${user.id}/image-playground-original-${Date.now()}.${
			imageFile.name.split(".").pop() || "jpg"
		}`

		const { data: originalUpload, error: originalUploadError } =
			await supabase.storage
				.from("user-images")
				.upload(originalFileName, buffer, {
					contentType: imageFile.type,
					upsert: false,
				})

		if (originalUploadError) {
			console.error("Original upload error:", originalUploadError)
			throw new Error(`Upload failed: ${originalUploadError.message}`)
		}

		const { data: originalUrlData } = supabase.storage
			.from("user-images")
			.getPublicUrl(originalUpload.path)

		// Transform the image
		let transformedUrl: string
		try {
			transformedUrl = await transformImage(
				originalUrlData.publicUrl,
				prompt
			)
		} catch (error) {
			console.error("Transformation error:", error)
			throw new Error(
				`Image transformation failed: ${error instanceof Error ? error.message : "Unknown error"}`
			)
		}

		// Download and re-upload the transformed image
		const response = await fetch(transformedUrl)
		if (!response.ok) {
			throw new Error(
				`Failed to fetch transformed image: ${response.statusText}`
			)
		}

		const blob = await response.blob()
		const transformedArrayBuffer = await blob.arrayBuffer()
		const transformedBuffer = Buffer.from(transformedArrayBuffer)

		const transformedFileName = `${user.id}/image-playground-transformed-${Date.now()}.webp`

		const { data: transformedUpload, error: transformedUploadError } =
			await supabase.storage
				.from("user-images")
				.upload(transformedFileName, transformedBuffer, {
					contentType: "image/webp",
					upsert: false,
				})

		if (transformedUploadError) {
			console.error("Transformed upload error:", transformedUploadError)
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