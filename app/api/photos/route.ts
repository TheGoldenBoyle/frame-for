import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"

export async function GET() {
	try {
		const supabase = createClient()
		const {
			data: { user },
			error: authError,
		} = await (await supabase).auth.getUser()

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		// Fetch playground photos
		const playgroundPhotos = await prisma.playgroundPhoto.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				prompt: true,
				createdAt: true,
				results: true,
			},
		})

		return NextResponse.json({ photos: playgroundPhotos })
	} catch (error) {
		console.error("❌ Fetch playground photos error:", error)
		return NextResponse.json(
			{ error: "Failed to fetch photos" },
			{ status: 500 }
		)
	}
}
