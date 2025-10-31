import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"
import { checkTokens, deductTokens } from "@/lib/tokens"
import { TOKEN_CONFIG } from "@/lib/config/tokens"

const replicate = new Replicate({
	auth: process.env.REPLICATE_API_TOKEN!,
})

async function generateWithNanoBanana(
	prompt: string,
	imageUrl: string,
	maskData?: string | null
): Promise<string> {
	const input: Record<string, any> = {
		prompt,
		image_input: [imageUrl],
	}

	// Pass optional focus mask
	if (maskData) input.mask = maskData

	const output = await replicate.run("google/nano-banana", { input })

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

		const body = await request.json()
		const { imageUrl, prompt, playgroundPhotoId, maskData } = body

		if (!imageUrl || !prompt || !playgroundPhotoId) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			)
		}

		const playgroundPhoto = await prisma.playgroundPhoto.findUnique({
			where: { id: playgroundPhotoId, userId: user.id },
		})

		if (!playgroundPhoto) {
			return NextResponse.json(
				{ error: "Playground photo not found" },
				{ status: 404 }
			)
		}

		// --- Token check ---
		const isDiscountedRevision = playgroundPhoto.revisionCount < 2
		const cost = isDiscountedRevision
			? TOKEN_CONFIG.COSTS.PLAYGROUND_REVISE
			: TOKEN_CONFIG.COSTS.PLAYGROUND_PER_MODEL

		const hasTokens = await checkTokens(user.id, cost)
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

		// --- Generate new revision ---
		let generatedUrl: string
		try {
			generatedUrl = await generateWithNanoBanana(prompt, imageUrl, maskData)
		} catch (error) {
			console.error("Nano-banana generation failed:", error)
			throw new Error("Image revision failed")
		}

		// --- Upload revised image ---
		const response = await fetch(generatedUrl)
		if (!response.ok) {
			throw new Error(`Failed to fetch generated image: ${response.statusText}`)
		}
		const blob = await response.blob()
		const buffer = Buffer.from(await blob.arrayBuffer())

		const fileName = `${user.id}/playground-revised-${Date.now()}.webp`
		const { data: upload, error: uploadErr } = await supabase.storage
			.from("user-images")
			.upload(fileName, buffer, { contentType: "image/webp", upsert: false })
		if (uploadErr) throw uploadErr

		const { data: urlData } = supabase.storage
			.from("user-images")
			.getPublicUrl(upload.path)

		// --- Delete old image (if exists) ---
		if (playgroundPhoto.originalUrl) {
			try {
				const oldPath = playgroundPhoto.originalUrl.split("/user-images/")[1]
				if (oldPath) {
					await supabase.storage.from("user-images").remove([oldPath])
				}
			} catch (err) {
				console.warn("Failed to delete old image:", err)
			}
		}

		// --- Deduct tokens and update DB ---
		await deductTokens(user.id, cost, "Playground revision")
		await prisma.playgroundPhoto.update({
			where: { id: playgroundPhotoId },
			data: {
				originalUrl: urlData.publicUrl,
				revisionCount: { increment: 1 },
				results: {
					set: [
						{
							modelId: "nano-banana",
							modelName: "Nano Banana",
							imageUrl: urlData.publicUrl,
						},
					],
				},
			},
		})

		return NextResponse.json({
			success: true,
			results: [
				{
					modelId: "nano-banana",
					modelName: "Nano Banana",
					imageUrl: urlData.publicUrl,
				},
			],
		})
	} catch (error) {
		console.error("Playground revision error:", error)
		return NextResponse.json(
			{
				error:
					error instanceof Error ? error.message : "Revision failed",
			},
			{ status: 500 }
		)
	}
}
