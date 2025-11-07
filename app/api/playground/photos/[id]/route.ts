import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser()

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const photoId = params.id

		// Fetch the specific playground photo
		const playgroundPhoto = await prisma.playgroundPhoto.findUnique({
			where: {
				id: photoId,
				userId: user.id, // Ensure user owns this photo
			},
			select: {
				id: true,
				prompt: true,
				originalUrl: true,
				results: true,
				createdAt: true,
				revisionCount: true,
			},
		})

		if (!playgroundPhoto) {
			return NextResponse.json(
				{ error: "Playground photo not found" },
				{ status: 404 }
			)
		}

		return NextResponse.json(playgroundPhoto)
	} catch (error) {
		console.error("❌ Fetch playground photo error:", error)
		return NextResponse.json(
			{ error: "Failed to fetch photo" },
			{ status: 500 }
		)
	}
}
