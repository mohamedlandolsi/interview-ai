import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')
  // Create sample interview template questions
  const sampleQuestions = [
    {
      id: 'q1',
      type: 'text',
      title: 'Tell me about yourself and your background.',
      description: 'Please provide a brief overview of your professional background and experience.',
      required: true,
      timeLimit: 2, // 2 minutes
      points: 10
    },
    {
      id: 'q2',
      type: 'text',
      title: 'What interests you about this position?',
      description: 'Explain your motivation for applying to this role.',
      required: true,
      timeLimit: 2,
      points: 12
    },
    {
      id: 'q3',
      type: 'text',
      title: 'Describe a challenging project you worked on recently.',
      description: 'Walk us through a complex project and how you handled it.',
      required: true,
      timeLimit: 3, // 3 minutes
      points: 15
    },
    {
      id: 'q4',
      type: 'rating',
      title: 'How do you handle working under pressure?',
      description: 'Rate your comfort level with high-pressure situations and explain.',
      required: true,
      timeLimit: 2,
      points: 13,
      minRating: 1,
      maxRating: 5
    },
    {
      id: 'q5',
      type: 'multiple_choice',
      title: 'What is your preferred work environment?',
      description: 'Select the environment where you work best.',
      required: false,
      timeLimit: 1,
      points: 8,
      options: ['Remote', 'Hybrid', 'In-Office', 'Flexible']
    }
  ]

  // Create a sample company first
  const sampleCompany = await prisma.company.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Sample Tech Company',
      email: 'info@sampletech.com',
      website: 'https://sampletech.com',
      industry: 'Technology',
      companySize: '50-100',
      phone: '+1-555-123-4567',
      address: '123 Tech Street, San Francisco, CA 94105',
      description: 'A leading technology company focused on innovative solutions.'
    }
  })

  // Create a sample profile (this would typically be created by Supabase auth trigger)
  const sampleProfileId = '00000000-0000-0000-0000-000000000001'
  
  try {
    const profile = await prisma.profile.upsert({
      where: { id: sampleProfileId },
      update: {},
      create: {
        id: sampleProfileId,
        full_name: 'Sample HR Manager',
        department: 'Human Resources',
        role: UserRole.hr_manager,
        timezone: 'America/New_York',
        onboarding_completed: true,
        email_verified: true,
        companyId: sampleCompany.id,
        notification_preferences: {
          email: true,
          push: true,
          sms: false
        }
      }
    })
    console.log('✅ Created sample profile:', profile.full_name)    // Create sample interview templates
    const templates = [
      {
        title: 'General Interview - Entry Level',
        name: 'General Interview - Entry Level',
        description: 'Standard interview template for entry-level positions',
        category: 'General',
        difficulty: 'Beginner',
        duration: 30,
        tags: ['entry-level', 'general', 'screening'],
        questions: sampleQuestions.slice(0, 3),        rawQuestions: sampleQuestions.slice(0, 3),
        company_id: sampleProfileId,
        created_by: sampleProfileId,
        is_built_in: true
      },
      {
        title: 'Behavioral Interview - Mid Level',
        name: 'Behavioral Interview - Mid Level',
        description: 'Behavioral-focused interview for mid-level candidates',
        category: 'Behavioral',
        difficulty: 'Intermediate',
        duration: 45,
        tags: ['behavioral', 'mid-level', 'experience'],
        questions: sampleQuestions,
        rawQuestions: sampleQuestions,
        company_id: sampleProfileId,
        created_by: sampleProfileId,
        is_built_in: true
      },
      {
        title: 'Senior Role Assessment',
        name: 'Senior Role Assessment',
        description: 'Comprehensive interview for senior positions',
        category: 'Leadership',
        difficulty: 'Advanced',
        duration: 60,
        tags: ['senior', 'leadership', 'strategic'],
        questions: [
          ...sampleQuestions,
          {
            id: 'q6',
            type: 'text',
            title: 'How do you approach mentoring junior team members?',
            description: 'Describe your leadership and mentoring style.',
            required: true,
            timeLimit: 3,
            points: 18
          },
          {
            id: 'q7',
            type: 'text',
            title: 'Describe your experience with strategic planning.',
            description: 'Share examples of strategic initiatives you have led.',
            required: true,
            timeLimit: 4,
            points: 20
          }
        ],
        rawQuestions: [
          ...sampleQuestions,
          {
            id: 'q6',
            type: 'text',
            title: 'How do you approach mentoring junior team members?',
            description: 'Describe your leadership and mentoring style.',
            required: true,
            timeLimit: 3,
            points: 18
          },
          {
            id: 'q7',
            type: 'text',
            title: 'Describe your experience with strategic planning.',
            description: 'Share examples of strategic initiatives you have led.',
            required: true,
            timeLimit: 4,
            points: 20
          }
        ],
        company_id: sampleProfileId,
        created_by: sampleProfileId,
        is_built_in: true
      }
    ]

    for (const template of templates) {
      const created = await prisma.interviewTemplate.create({
        data: template
      })
      console.log('✅ Created interview template:', created.title)
    }

    console.log('🎉 Database seeded successfully!')
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
