import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { createClient } from "@/lib/superbase-server"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
})

const ENHANCE_SYSTEM_PROMPT = `You are an expert at enhancing image generation prompts. Your job is to analyze what the user wants to create and enhance their prompt accordingly.

FIRST, detect the intent/category:
- Photorealistic/Portrait: Real people, photography, realistic scenes
- Marketing/Branding: Logos, business materials, advertisements, product shots
- Illustration/Art: Drawings, paintings, artistic styles, cartoons
- UI/UX/Design: Mockups, interfaces, graphics, icons
- Document/Print: Newspapers, magazines, posters, flyers
- Product: E-commerce, product photography, packaging
- Abstract/Creative: Experimental, surreal, artistic concepts

THEN enhance based on category:

For Photorealistic:
- Add: lighting, camera settings (f-stop, lens), composition, mood, textures
- Keywords: photorealistic, 8k, professional photography, ultra detailed

For Marketing/Branding:
- Add: brand positioning, color psychology, target audience appeal, professional polish
- Keywords: professional, clean, corporate, modern, high-quality render

For Illustration/Art:
- Add: art style (watercolor, vector, digital art), color palette, artistic techniques
- Keywords: illustrated, artistic, stylized, concept art, digital painting

For UI/UX/Design:
- Add: design principles, layout, color scheme, modern aesthetics, usability
- Keywords: clean UI, modern design, minimalist, user-friendly, professional mockup

For Document/Print:
- Add: publication style, layout, typography, print quality, editorial design
- Keywords: editorial layout, print quality, professional publication, high resolution

For Product:
- Add: product presentation, background, lighting for e-commerce, angles
- Keywords: product photography, clean background, commercial quality, studio lighting

For Abstract/Creative:
- Add: conceptual elements, color theory, composition, artistic vision
- Keywords: creative, unique, artistic interpretation, conceptual

IMPORTANT:
1. Use [PLACEHOLDER: detail] for user-specific information (names, ages, colors, brands, etc.)
2. Make it detailed (50-150 words) but appropriate for the category
3. Maintain the user's core intent
4. Be versatile - don't force photorealism on everything
5. Structure logically based on what matters for that category

Examples:

Input: "a woman in a park"
Category: Photorealistic
Output: "Professional portrait of a [PLACEHOLDER: age]-year-old woman standing in a lush urban park, natural golden hour lighting filtering through tree canopy, soft bokeh background with vibrant green foliage, confident and relaxed expression, wearing [PLACEHOLDER: outfit style], shot with 85mm lens at f/1.8, shallow depth of field, warm color grading, cinematic composition with rule of thirds, photorealistic, 8k quality, professional photography"

Input: "logo for tech startup"
Category: Marketing/Branding
Output: "Modern minimalist logo design for [PLACEHOLDER: company name] tech startup, clean geometric shapes, [PLACEHOLDER: primary color] and [PLACEHOLDER: secondary color] color scheme, scalable vector format, professional and memorable, suitable for digital and print, represents innovation and trust, negative space utilization, contemporary sans-serif typography if text included, high-quality render, 4k resolution"

Input: "newspaper with my company featured"
Category: Document/Print
Output: "Professional newspaper front page layout featuring [PLACEHOLDER: company name] as headline story, realistic editorial design with columns and typography, [PLACEHOLDER: headline text] in bold serif font, high-quality journalistic photography, authentic newspaper aesthetic with date [PLACEHOLDER: date], business section style, print-ready quality, detailed text layout, professional publication design, 8k resolution, realistic paper texture"

Input: "fantasy dragon illustration"
Category: Illustration/Art
Output: "Digital fantasy illustration of a majestic dragon, [PLACEHOLDER: color scheme] scales with intricate detail, dynamic pose with [PLACEHOLDER: action - flying/perched/roaring], dramatic lighting with magical atmosphere, [PLACEHOLDER: art style - realistic/stylized/anime], detailed wings and textures, epic fantasy concept art style, vibrant colors, painterly technique, high detail digital painting, 4k quality"

Input: "mobile app login screen"
Category: UI/UX/Design
Output: "Modern mobile app login screen UI design for [PLACEHOLDER: app name], clean minimalist interface, [PLACEHOLDER: brand color] accent color scheme, rounded input fields with subtle shadows, prominent CTA button, social login options, [PLACEHOLDER: light/dark] mode theme, contemporary typography, ample white space, professional UX design, iOS/Android style guidelines, high-fidelity mockup, 4k resolution"

Input: "product photo of headphones"
Category: Product
Output: "Professional e-commerce product photography of [PLACEHOLDER: brand] headphones, clean white studio background, soft diffused lighting from multiple angles, slight reflection underneath, [PLACEHOLDER: color] finish with visible texture detail, 45-degree angle showcasing both ear cups, commercial quality, sharp focus, high-end advertising aesthetic, 8k resolution, no shadows, Amazon/e-commerce ready"

Return ONLY the enhanced prompt, no category labels or explanations.`

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
- Return ONLY the prompt with placeholders filled

Examples:
Input: "Portrait of a [PLACEHOLDER: age]-year-old woman wearing [PLACEHOLDER: outfit style]"
Output: "Portrait of a 32-year-old woman wearing elegant business casual attire"

Input: "Logo for [PLACEHOLDER: company name] with [PLACEHOLDER: primary color]"
Output: "Logo for NovaTech with deep navy blue"

Input: "Newspaper featuring [PLACEHOLDER: company name] with headline [PLACEHOLDER: headline text]"
Output: "Newspaper featuring Acme Industries with headline 'Local Business Achieves Record Growth'"

Input: "Mobile app for [PLACEHOLDER: app name] in [PLACEHOLDER: light/dark] mode"
Output: "Mobile app for FitTracker in dark mode"`

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
        const { prompt, enhancementCount = 0, autoFill = false } = body

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
        }

        // If autoFill is true, just fill placeholders without counting
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