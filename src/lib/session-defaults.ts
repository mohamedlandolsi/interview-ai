import { prisma } from '@/lib/prisma'

/**
 * Get default interviewer ID (first available profile with interviewer role)
 */
export async function getDefaultInterviewerId(): Promise<string> {
  try {
    const profile = await prisma.profile.findFirst({
      where: { role: 'interviewer' },
      select: { id: true }
    })
    
    if (profile) {
      return profile.id
    }
    
    // Fallback to any profile if no interviewer found
    const anyProfile = await prisma.profile.findFirst({
      select: { id: true }
    })
    
    return anyProfile?.id || '4e638dca-7b20-4a2c-9393-a66c45ae2586' // Ultimate fallback
  } catch (error) {
    console.warn('Error getting default interviewer ID:', error)
    return '4e638dca-7b20-4a2c-9393-a66c45ae2586' // Fallback
  }
}

/**
 * Get default template ID (first available template)
 */
export async function getDefaultTemplateId(): Promise<string> {
  try {
    const template = await prisma.interviewTemplate.findFirst({
      select: { id: true }
    })
    
    return template?.id || 'cmc3vp3ck0001f4ro00vtiqra' // Fallback
  } catch (error) {
    console.warn('Error getting default template ID:', error)
    return 'cmc3vp3ck0001f4ro00vtiqra' // Fallback
  }
}

/**
 * Get session creation defaults
 */
export async function getSessionDefaults() {
  const [interviewerId, templateId] = await Promise.all([
    getDefaultInterviewerId(),
    getDefaultTemplateId()
  ])
  
  return {
    interviewerId,
    templateId
  }
}
