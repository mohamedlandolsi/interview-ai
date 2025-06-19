import { PrismaClient } from '@prisma/client'

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to handle Prisma client disconnection
export async function disconnectPrisma() {
  await prisma.$disconnect()
}

// Export types for convenience
export type {
  Profile,
  InterviewTemplate,
  InterviewSession,
  UserRole,
  InterviewStatus,
} from '@prisma/client'
