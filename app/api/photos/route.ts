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

		const photos = await prisma.photo.findMany({
			where: {
				userId: user.id,
			},
			orderBy: {
				createdAt: "desc",
			},
			select: {
				id: true,
				generatedUrl: true,
				createdAt: true,
			},
		})

		return NextResponse.json({ photos })
	} catch (error) {
		console.error("Fetch photos error:", error)
		return NextResponse.json(
			{ error: "Failed to fetch photos" },
			{ status: 500 }
		)
	}
}
