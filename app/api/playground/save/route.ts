import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"

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
		const { playgroundPhotoId, modelId } = body

		if (!playgroundPhotoId || !modelId) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			)
		}

		const playgroundPhoto = await prisma.playgroundPhoto.findUnique({
			where: {
				id: playgroundPhotoId,
				userId: user.id,
			},
		})

		if (!playgroundPhoto) {
			return NextResponse.json(
				{ error: "Playground photo not found" },
				{ status: 404 }
			)
		}

		return NextResponse.json({
			success: true,
			message: "Result saved to gallery",
		})
	} catch (error) {
		console.error("Save error:", error)
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Save failed",
			},
			{ status: 500 }
		)
	}
}
