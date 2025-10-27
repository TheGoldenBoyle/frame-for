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

		const batches = await prisma.proStudioBatch.findMany({
			where: {
				userId: user.id,
			},
			orderBy: {
				createdAt: "desc",
			},
			take: 20,
		})

		// Parse results if needed, but no URL transformation required
		const processedBatches = batches.map((batch) => {
			let parsedResults = []
			try {
				parsedResults = Array.isArray(batch.results)
					? batch.results
					: typeof batch.results === "string"
					? JSON.parse(batch.results as string)
					: []
			} catch (parseError) {
				console.error("Failed to parse results:", parseError)
				parsedResults = []
			}

			return {
				...batch,
				results: parsedResults,
			}
		})

		return NextResponse.json({
			batches: processedBatches,
		})
	} catch (error) {
		console.error("Fetch batches error:", error)
		return NextResponse.json(
			{
				error:
					error instanceof Error
						? error.message
						: "Failed to fetch batches",
			},
			{ status: 500 }
		)
	}
}