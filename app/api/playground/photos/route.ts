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

        // Process photos with robust error handling
        const processedPhotos = await Promise.all(photos.map(async (photo) => {
            // Safely parse results, handling potential null or invalid JSON
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

            // Transform image URLs with signed URLs
            const signedResults = await Promise.all(parsedResults.map(async (result) => {
                // Only process if imageUrl exists and is a string
                if (result?.imageUrl && typeof result.imageUrl === 'string') {
                    try {
                        // Extract the path from the full URL
                        const urlPath = result.imageUrl.replace(
                            'https://tsqzcdghrulixqevihiz.supabase.co/storage/v1/object/public/user-images/', 
                            ''
                        )

                        // Generate signed URL with explicit type handling
                        const signedUrlResult = await supabase
                            .storage
                            .from('user-images')
                            .createSignedUrl(urlPath, 3600)

                        // Safely extract signed URL
                        const signedUrl = signedUrlResult.data?.signedUrl 
                            ?? result.imageUrl

                        return {
                            ...result,
                            imageUrl: signedUrl
                        }
                    } catch (urlError) {
                        console.error('Failed to generate signed URL:', urlError)
                        return result
                    }
                }
                return result
            }))

            return {
                ...photo,
                results: signedResults
            }
        }))

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