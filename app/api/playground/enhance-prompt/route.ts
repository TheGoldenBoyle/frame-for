import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/superbase-server"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
})

const ENHANCE_SYSTEM_PROMPT = `You are an expert at enhancing image generation prompts. Your job is to take a basic prompt and transform it into a highly detailed, photorealistic prompt that will generate stunning images.

Rules:
1. Expand the prompt with specific details about: lighting, composition, camera settings, mood, textures, colors
2. Add technical photography terms (aperture, lens type, focal length, lighting setup)
3. Include photorealism keywords (photorealistic, 8k, ultra detailed, professional photography)
4. Maintain the core subject and intent of the original prompt
5. Make it verbose and descriptive (aim for 50-150 words)
6. Add [PLACEHOLDER: specific detail] for things that need user input (e.g., age, expression, color)
7. Structure it logically: subject → setting → lighting → technical details → style

Example:
Input: "a woman in a park"
Output: "Professional portrait of a [PLACEHOLDER: age]-year-old woman standing in a lush urban park, natural golden hour lighting filtering through tree canopy, soft bokeh background with vibrant green foliage, confident and relaxed expression, wearing [PLACEHOLDER: outfit style], shot with 85mm lens at f/1.8, shallow depth of field, warm color grading, cinematic composition with rule of thirds, photorealistic, 8k quality, professional photography"

Return ONLY the enhanced prompt, no explanations or additional text.`

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { prompt, enhancementCount = 0 } = body

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
        }

        // Secret limit of 3 enhancements
        if (enhancementCount >= 3) {
            return NextResponse.json(
                { error: "Maximum enhancements reached. Please generate your image or start over." },
                { status: 429 }
            )
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: ENHANCE_SYSTEM_PROMPT },
                { role: "user", content: `Enhance this prompt: "${prompt}"` }
            ],
            temperature: 0.8,
            max_tokens: 500,
        })

        const enhancedPrompt = completion.choices[0]?.message?.content?.trim() || prompt

        return NextResponse.json({
            enhancedPrompt,
            enhancementCount: enhancementCount + 1
        })
    } catch (error) {
        console.error("Prompt enhancement error:", error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to enhance prompt",
            },
            { status: 500 }
        )
    }
}