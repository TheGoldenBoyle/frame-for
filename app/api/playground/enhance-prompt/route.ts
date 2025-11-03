import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/superbase-server"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
})

// Default enhancement modes with lighter touch
const ENHANCEMENT_MODES = {
    polish: `You are a prompt polish assistant. Only fix grammar, clarity, and structure. Keep the core idea 100% intact. Make minimal changes.

Rules:
- Fix only grammar and clarity issues
- Keep all creative intent exactly as is
- Do not add new concepts or details
- Return a cleaner version of the same prompt

Return ONLY the polished prompt.`,

    expand: `You are a prompt expansion assistant. Add helpful details while respecting user intent.

Rules:
- Keep the user's core vision intact
- Add relevant technical details (lighting, composition, quality)
- Suggest but don't force any particular style
- Be minimal - add 20-50 words maximum
- If prompt is already detailed, make very light additions

Return ONLY the expanded prompt.`,

    technical: `You are a technical prompt assistant. Add professional photography/rendering terms.

Rules:
- Add camera settings, lighting terms, quality indicators
- Keep artistic vision 100% intact
- Focus on technical execution details
- Examples: "8k quality", "professional lighting", "sharp focus", "cinematic composition"

Return ONLY the technically enhanced prompt.`,

    creative: `You are a creative prompt assistant. Suggest interesting variations.

Rules:
- Offer creative angles while keeping core concept
- Suggest mood, atmosphere, or artistic touches
- Stay true to user's genre/style
- Be inspiring but not prescriptive

Return ONLY the creatively enhanced prompt.`,

    minimal: `You are a minimal prompt assistant. Make the absolute smallest improvement.

Rules:
- Change as little as possible
- Only add what's truly missing
- Maximum 5-10 word addition
- Preserve everything the user wrote

Return ONLY the minimally enhanced prompt.`
}

const AUTOFILL_SYSTEM_PROMPT = `You are a placeholder auto-fill assistant. Replace all [PLACEHOLDER: ...] markers with sensible, creative defaults while keeping the rest of the prompt exactly the same.

Rules:
- Understand context and fill appropriately
- For ages: use specific numbers like "28", "45", "22"
- For outfits: describe specifically like "casual denim jacket", "elegant black dress"
- For colors: use descriptive colors like "vibrant red", "deep navy blue", "emerald green"
- For brand/company names: use generic but realistic names like "TechFlow", "Acme Corp", "NovaTech"
- For headlines/text: create relevant, realistic text
- For dates: use current or recent dates
- For styles: choose appropriate specific styles
- Be creative but realistic with all defaults
- Keep all other text EXACTLY as is
- Return ONLY the prompt with placeholders filled`

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
        const { 
            prompt, 
            enhancementCount = 0, 
            autoFill = false,
            mode = 'expand',
        } = body

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
        }

        // Handle autofill separately
        if (autoFill) {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: AUTOFILL_SYSTEM_PROMPT },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500,
            })

            const filledPrompt = completion.choices[0]?.message?.content?.trim() || prompt

            return NextResponse.json({
                enhancedPrompt: filledPrompt,
                originalPrompt: prompt,
                autoFilled: true
            })
        }

        // Secret limit of 3 enhancements
        if (enhancementCount >= 3) {
            return NextResponse.json(
                { error: "Maximum enhancements reached. Please generate your image or start over." },
                { status: 429 }
            )
        }

        // Use built-in mode
        const systemPrompt = ENHANCEMENT_MODES[mode as keyof typeof ENHANCEMENT_MODES] || ENHANCEMENT_MODES.expand

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Enhance this prompt: "${prompt}"` }
            ],
            temperature: 0.7,
            max_tokens: 500,
        })

        const enhancedPrompt = completion.choices[0]?.message?.content?.trim() || prompt

        return NextResponse.json({
            enhancedPrompt,
            originalPrompt: prompt,
            enhancementCount: enhancementCount + 1,
            mode
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