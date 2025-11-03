import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createClient } from "@/lib/superbase-server"

// GET - Get user's active system prompt (or default)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Try to get user's active custom prompt
    let activePrompt = await prisma.systemPromptTemplate.findFirst({
      where: { 
        userId: user.id, 
        isActive: true 
      }
    })

    // If no user override, get default
    if (!activePrompt) {
      activePrompt = await prisma.systemPromptTemplate.findFirst({
        where: { 
          isDefault: true, 
          userId: null 
        }
      })
    }

    if (!activePrompt) {
      return NextResponse.json(
        { error: "No system prompt found" },
        { status: 404 }
      )
    }

    return NextResponse.json(activePrompt)
  } catch (error) {
    console.error("❌ Get system prompt error:", error)
    return NextResponse.json(
      { error: "Failed to fetch system prompt" },
      { status: 500 }
    )
  }
}

// POST - Create or update user's custom system prompt
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, promptTemplate } = await request.json()

    if (!name || !promptTemplate) {
      return NextResponse.json(
        { error: "Name and promptTemplate are required" },
        { status: 400 }
      )
    }

    // Deactivate any existing active prompts for this user
    await prisma.systemPromptTemplate.updateMany({
      where: { 
        userId: user.id, 
        isActive: true 
      },
      data: { isActive: false }
    })

    // Create new custom prompt
    const customPrompt = await prisma.systemPromptTemplate.create({
      data: {
        userId: user.id,
        name,
        promptTemplate,
        isDefault: false,
        isActive: true,
      }
    })

    console.log(`✅ Created custom system prompt for user ${user.id}:`, customPrompt.name)

    return NextResponse.json(customPrompt)
  } catch (error) {
    console.error("❌ Create system prompt error:", error)
    return NextResponse.json(
      { error: "Failed to create system prompt" },
      { status: 500 }
    )
  }
}

// PUT - Update existing custom system prompt
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id, name, promptTemplate } = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      )
    }

    // Verify ownership
    const existing = await prisma.systemPromptTemplate.findUnique({
      where: { id }
    })

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json(
        { error: "System prompt not found or unauthorized" },
        { status: 404 }
      )
    }

    // Update
    const updated = await prisma.systemPromptTemplate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(promptTemplate && { promptTemplate }),
        updatedAt: new Date(),
      }
    })

    console.log(`✅ Updated system prompt ${id} for user ${user.id}`)

    return NextResponse.json(updated)
  } catch (error) {
    console.error("❌ Update system prompt error:", error)
    return NextResponse.json(
      { error: "Failed to update system prompt" },
      { status: 500 }
    )
  }
}

// DELETE - Reset to default (deactivate custom prompt)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Just deactivate all user's custom prompts
    await prisma.systemPromptTemplate.updateMany({
      where: { 
        userId: user.id, 
        isActive: true 
      },
      data: { isActive: false }
    })

    console.log(`✅ Reset to default system prompt for user ${user.id}`)

    // Return the default prompt
    const defaultPrompt = await prisma.systemPromptTemplate.findFirst({
      where: { 
        isDefault: true, 
        userId: null 
      }
    })

    return NextResponse.json(defaultPrompt)
  } catch (error) {
    console.error("❌ Reset system prompt error:", error)
    return NextResponse.json(
      { error: "Failed to reset system prompt" },
      { status: 500 }
    )
  }
}