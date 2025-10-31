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

    // ---- 1️⃣ Regular photos ----
    const photos = await prisma.photo.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        generatedUrl: true,
        createdAt: true,
        revisions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { resultUrl: true },
        },
      },
    })

    const photoItems = photos.map((p) => ({
      id: p.id,
      generatedUrl: p.revisions[0]?.resultUrl || p.generatedUrl,
      createdAt: p.createdAt,
      sourceType: "photo",
      prompt: null,
    }))

    // ---- 2️⃣ Playground photos ----
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

    const playgroundItems = playgroundPhotos.flatMap((pg) =>
      (pg.results as any[])
        .filter((r) => r?.imageUrl)
        .map((r) => ({
          id: `${pg.id}-${r.modelId}`,
          generatedUrl: r.imageUrl,
          createdAt: pg.createdAt,
          sourceType: "playground",
          prompt: pg.prompt,
        }))
    )

    // ---- 3️⃣ Pro Studio batches ----
    const proStudioBatches = await prisma.proStudioBatch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        optimizedPrompt: true,
        createdAt: true,
        results: true,
      },
    })

    const proStudioItems = proStudioBatches.flatMap((batch) =>
      (batch.results as any[])
        .filter((r) => r?.imageUrl)
        .map((r, i) => ({
          id: `${batch.id}-${i}`,
          generatedUrl: r.imageUrl,
          createdAt: batch.createdAt,
          sourceType: "proStudio",
          prompt: batch.optimizedPrompt,
        }))
    )

    // ---- 4️⃣ Image Transformations ----
    const transformations = await prisma.imageTransformation.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        transformedUrl: true,
        prompt: true,
        createdAt: true,
      },
    })

    const transformationItems = transformations.map((t) => ({
      id: t.id,
      generatedUrl: t.transformedUrl,
      createdAt: t.createdAt,
      sourceType: "transformation",
      prompt: t.prompt,
    }))

    // ---- 🧮 Merge all and sort ----
    const allItems = [
      ...photoItems,
      ...playgroundItems,
      ...proStudioItems,
      ...transformationItems,
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ photos: allItems })
  } catch (error) {
    console.error("❌ Fetch unified photos error:", error)
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}
