import { prisma } from './prisma'
import type { Profile, UserRole } from '@prisma/client'
import type { User } from '@supabase/supabase-js'

/**
 * Creates a profile for a new user after they sign up
 * This function should be called from a Supabase database trigger or API route
 */
export async function createUserProfile(
  userId: string,
  userData: {
    email?: string
    full_name?: string
    avatar_url?: string
    role?: UserRole
  }
): Promise<Profile> {
  try {
    const profile = await prisma.profile.create({
      data: {
        id: userId,
        full_name: userData.full_name || null,
        avatar_url: userData.avatar_url || null,
        role: userData.role || 'interviewer',
        email_verified: false,
        onboarding_completed: false,
      }
    })
    
    console.log(`✅ Created profile for user: ${userId}`)
    return profile
  } catch (error) {
    console.error(`❌ Error creating profile for user ${userId}:`, error)
    throw error
  }
}

/**
 * Gets a user's profile by their ID
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    console.log('🗃️ Database: Querying profile for user:', userId)
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      include: {
        interview_templates: {
          orderBy: { created_at: 'desc' },
          take: 5 // Include recent templates
        },
        interview_sessions: {
          orderBy: { created_at: 'desc' },
          take: 10 // Include recent sessions
        }
      }
    })
    
    console.log('🗃️ Database: Profile query result:', {
      found: !!profile,
      id: profile?.id,
      avatar_url: profile?.avatar_url,
      updated_at: profile?.updated_at,
      templatesCount: profile?.interview_templates?.length,
      sessionsCount: profile?.interview_sessions?.length
    })
    
    return profile
  } catch (error) {
    console.error(`💥 Database: Error fetching profile for user ${userId}:`, error)
    return null
  }
}

/**
 * Updates a user's profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  try {
    const profile = await prisma.profile.update({
      where: { id: userId },
      data: {
        ...updates,
        updated_at: new Date()
      }
    })
    
    console.log(`✅ Updated profile for user: ${userId}`)
    return profile
  } catch (error) {
    console.error(`❌ Error updating profile for user ${userId}:`, error)
    return null
  }
}

/**
 * Updates user login timestamp
 */
export async function updateLastLogin(userId: string): Promise<void> {
  try {
    await prisma.profile.update({
      where: { id: userId },
      data: { last_login: new Date() }
    })
  } catch (error) {
    console.error(`❌ Error updating last login for user ${userId}:`, error)
  }
}

/**
 * Marks user as email verified
 */
export async function markEmailVerified(userId: string): Promise<void> {
  try {
    await prisma.profile.update({
      where: { id: userId },
      data: { email_verified: true }
    })
    console.log(`✅ Marked email verified for user: ${userId}`)
  } catch (error) {
    console.error(`❌ Error marking email verified for user ${userId}:`, error)
  }
}

/**
 * Marks onboarding as completed
 */
export async function completeOnboarding(userId: string): Promise<void> {
  try {
    await prisma.profile.update({
      where: { id: userId },
      data: { onboarding_completed: true }
    })
    console.log(`✅ Completed onboarding for user: ${userId}`)
  } catch (error) {
    console.error(`❌ Error completing onboarding for user ${userId}:`, error)
  }
}

/**
 * Gets interview statistics for a user
 */
export async function getUserInterviewStats(userId: string) {
  try {
    const stats = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        interview_count: true,
        average_score: true,
        _count: {
          select: {
            interview_templates: true,
            interview_sessions: true
          }
        }
      }
    })
    
    return stats
  } catch (error) {
    console.error(`❌ Error fetching interview stats for user ${userId}:`, error)
    return null
  }
}

/**
 * Checks if a profile exists for a user
 */
export async function profileExists(userId: string): Promise<boolean> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { id: true }
    })
    
    return !!profile
  } catch (error) {
    console.error(`❌ Error checking if profile exists for user ${userId}:`, error)
    return false
  }
}
