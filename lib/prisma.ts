import { PrismaClient } from '@prisma/client'

// Prevent multiple instances in serverless environments
const globalForPrisma = global as unknown as { 
  prisma: PrismaClient | undefined 
}

function createPrismaClient() {
  return new PrismaClient({
    datasourceUrl: process.env.DIRECT_URL,
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error']
  })
}


export const prisma = globalForPrisma.prisma ?? createPrismaClient()

export async function safeDbOperation<T>(
  operation: () => Promise<T>, 
  maxRetries = 3
): Promise<T> {
  let lastError: unknown = null

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (!globalForPrisma.prisma) {
        globalForPrisma.prisma = createPrismaClient()
      }

      await prisma.$connect()
      
      const result = await operation()
      
      return result
    } catch (error) {
      lastError = error
      console.error(`Database operation attempt ${attempt} failed:`, error)

      await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
    } finally {
      // Disconnect in non-production to prevent connection pooling issues
      if (process.env.NODE_ENV !== 'production') {
        await prisma.$disconnect()
      }
    }
  }

  throw new Error(`Database operation failed after ${maxRetries} attempts: ${lastError}`)
}

// Ensure singleton in non-production
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}