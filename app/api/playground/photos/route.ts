import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"

export async function GET(request: NextRequest) {
	try {
		const supabase = await createClient()

		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser()

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const photos = await prisma.playgroundPhoto.findMany({
			where: {
				userId: user.id,
			},
			orderBy: {
				createdAt: "desc",
			},
		})

		return NextResponse.json({
			photos,
		})
	} catch (error) {
		console.error("Fetch photos error:", error)
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to fetch photos",
			},
			{ status: 500 }
		)
	}
}
