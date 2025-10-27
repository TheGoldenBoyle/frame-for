import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"
import { PlaygroundResult } from "@/types/globals"

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

        // Parse results if needed, but no URL transformation required
        const processedPhotos = photos.map((photo) => {
            let parsedResults: PlaygroundResult[] = []
            try {
                parsedResults = Array.isArray(photo.results) 
                    ? photo.results as PlaygroundResult[]
                    : typeof photo.results === 'string'
                        ? JSON.parse(photo.results)
                        : []
            } catch (parseError) {
                console.error('Failed to parse results:', parseError)
                parsedResults = []
            }

            return {
                ...photo,
                results: parsedResults
            }
        })

        return NextResponse.json({
            photos: processedPhotos,
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