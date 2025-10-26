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

		const processedBatches = await Promise.all(
			batches.map(async (batch) => {
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

				const signedResults = await Promise.all(
					parsedResults.map(async (result: any) => {
						if (
							result?.imageUrl &&
							typeof result.imageUrl === "string"
						) {
							try {
								const urlPath = result.imageUrl.replace(
									"https://tsqzcdghrulixqevihiz.supabase.co/storage/v1/object/public/user-images/",
									""
								)

								const signedUrlResult = await supabase.storage
									.from("user-images")
									.createSignedUrl(urlPath, 3600)

								const signedUrl =
									signedUrlResult.data?.signedUrl ??
									result.imageUrl

								return {
									...result,
									imageUrl: signedUrl,
								}
							} catch (urlError) {
								console.error(
									"Failed to generate signed URL:",
									urlError
								)
								return result
							}
						}
						return result
					})
				)

				return {
					...batch,
					results: signedResults,
				}
			})
		)

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
