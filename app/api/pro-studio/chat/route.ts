import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/superbase-server"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
})

const SYSTEM_PROMPT = `You are a hyper-realistic image generation prompt expert. Your ONLY job is to help users create the most effective prompts for photorealistic AI image generation.

Rules:
- Ask clarifying questions about: lighting, composition, subject details, mood, style
- Suggest technical photography terms (f-stop, lens type, lighting setup)
- Keep responses concise (2-3 sentences max)
- End with either a refined prompt or a follow-up question
- Never discuss topics outside of image generation
- Focus on: portraits, products, scenes, architecture, nature
- Always emphasize photorealism keywords
- When ready, provide a complete optimized prompt in quotes

Example refined prompts:
"Professional headshot of a 30-year-old woman, natural window lighting, soft focus background, confident expression, business casual attire, shallow depth of field, 85mm lens perspective, subtle makeup, contemporary office setting, photorealistic, 8k quality"

"Luxury sports car on mountain road, golden hour lighting, dramatic sky, motion blur on wheels, ultra sharp focus, professional automotive photography, cinematic composition, photorealistic rendering"`

const FORBIDDEN_PHRASES = [
    'ignore previous instructions',
    'ignore above',
    'disregard previous',
    'system prompt',
    'you are now',
    'new instructions',
    'override',
]

function sanitizeMessage(message: string): string {
    let clean = message.toLowerCase()
    
    FORBIDDEN_PHRASES.forEach(phrase => {
        if (clean.includes(phrase)) {
            throw new Error("Invalid input detected")
        }
    })
    
    return message.slice(0, 500)
}

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
        const { message, chatHistory = [] } = body

        if (!message || typeof message !== 'string') {
            return NextResponse.json({ error: "Message is required" }, { status: 400 })
        }

        const sanitized = sanitizeMessage(message)

        const messages = [
            { role: "system" as const, content: SYSTEM_PROMPT },
            ...chatHistory.slice(-10).map((msg: any) => ({
                role: msg.role,
                content: msg.content
            })),
            { role: "user" as const, content: sanitized }
        ]

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages,
            temperature: 0.7,
            max_tokens: 300,
        })

        const aiMessage = completion.choices[0]?.message?.content || "I'm here to help you create better prompts. What would you like to generate?"

        const promptMatch = aiMessage.match(/"([^"]+)"/)
        const suggestedPrompt = promptMatch ? promptMatch[1] : null

        return NextResponse.json({
            message: aiMessage,
            suggestedPrompt,
        })
    } catch (error) {
        console.error("Chat error:", error)
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Failed to process message",
            },
            { status: 500 }
        )
    }
}