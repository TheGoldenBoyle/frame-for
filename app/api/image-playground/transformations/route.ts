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

		const transformations = await prisma.imageTransformation.findMany({
			where: {
				userId: user.id,
			},
			orderBy: {
				createdAt: "desc",
			},
			select: {
				id: true,
				originalUrl: true,
				transformedUrl: true,
				prompt: true,
				modelUsed: true,
				createdAt: true,
			},
		})

		return NextResponse.json({ transformations })
	} catch (error) {
		console.error("Fetch transformations error:", error)
		return NextResponse.json(
			{ error: "Failed to fetch transformations" },
			{ status: 500 }
		)
	}
}