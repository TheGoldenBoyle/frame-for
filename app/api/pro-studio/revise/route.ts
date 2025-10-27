import { NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"
import { checkTokens, deductTokens } from "@/lib/tokens"
import { TOKEN_CONFIG } from "@/lib/config/tokens"

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
})

async function reviseImage(originalPrompt: string, revisionPrompt: string): Promise<string> {
    const combinedPrompt = `${originalPrompt}. Additional changes: ${revisionPrompt}. Maintain photorealistic quality, ultra high detail, professional photography.`

    const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
        input: {
            prompt: combinedPrompt,
            prompt_upsampling: true,
            aspect_ratio: "1:1",
        },
    })

    if (typeof output === "string") return output
    if (output && typeof output === "object" && "url" in output && typeof output.url === "function")
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
        const { batchId, imageIndex, revisionPrompt } = body

        if (!batchId || imageIndex === undefined || !revisionPrompt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const batch = await prisma.proStudioBatch.findUnique({
            where: {
                id: batchId,
                userId: user.id,
            },
        })

        if (!batch) {
            return NextResponse.json({ error: "Batch not found" }, { status: 404 })
        }

        const hasTokens = await checkTokens(user.id, TOKEN_CONFIG.COSTS.PRO_STUDIO_REVISION)

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

        const results = batch.results as any[]
        const targetImage = results.find(r => r.index === imageIndex)

        if (!targetImage || !targetImage.imageUrl) {
            return NextResponse.json({ error: "Image not found" }, { status: 404 })
        }

        const generatedUrl = await reviseImage(batch.optimizedPrompt, revisionPrompt)

        const response = await fetch(generatedUrl)
        if (!response.ok) {
            throw new Error(`Failed to fetch revised image: ${response.statusText}`)
        }

        const blob = await response.blob()
        const arrayBuffer = await blob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        const fileName = `${user.id}/pro-studio-revised-${Date.now()}.webp`

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("user-images")
            .upload(fileName, buffer, {
                contentType: "image/webp",
                upsert: false,
            })

        if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`)
        }

        const { data: urlData } = supabase.storage
            .from("user-images")
            .getPublicUrl(uploadData.path)

        await deductTokens(
            user.id,
            TOKEN_CONFIG.COSTS.PRO_STUDIO_REVISION,
            `Pro Studio revision: batch ${batchId}`
        )

        await prisma.proStudioImageRevision.create({
            data: {
                batchId,
                imageIndex,
                originalUrl: targetImage.imageUrl,
                revisedUrl: urlData.publicUrl,
                revisionPrompt,
                tokensCost: TOKEN_CONFIG.COSTS.PRO_STUDIO_REVISION,
            },
        })

        targetImage.imageUrl = urlData.publicUrl

        await prisma.proStudioBatch.update({
            where: { id: batchId },
            data: { results: results as any },
        })

        return NextResponse.json({
            success: true,
            revisedUrl: urlData.publicUrl,
        })
    } catch (error) {
        console.error("Revision error:", error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Revision failed",
            },
            { status: 500 }
        )
    }
}