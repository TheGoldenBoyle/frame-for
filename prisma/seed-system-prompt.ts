import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DEFAULT_SYSTEM_PROMPT = {
  name: 'Default System Prompt',
  promptTemplate: `Generate a high-quality, professional image based on the following description.

User Request: {USER_PROMPT}

Instructions:
- Follow the user's description exactly as specified
- Maintain exceptional image quality and clarity
- Pay attention to composition, lighting, and professional presentation
- Ensure all elements are clearly visible and well-defined
- Focus on creating a polished, production-ready result`,
  isDefault: true,
  isActive: true,
  userId: null,
}

async function seedSystemPrompt() {
  console.log('🌱 Seeding default system prompt...')

  const existing = await prisma.systemPromptTemplate.findFirst({
    where: { 
      isDefault: true, 
      userId: null 
    }
  })

  if (existing) {
    console.log('✓ Default system prompt already exists:', existing.name)
    return
  }

  const created = await prisma.systemPromptTemplate.create({
    data: DEFAULT_SYSTEM_PROMPT
  })

  console.log('✅ Default system prompt created:', created.name)
  console.log('   ID:', created.id)
}

seedSystemPrompt()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })