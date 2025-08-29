/**
 * Test script for notification system
 * Run this to create sample notifications for testing
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSampleNotifications() {
  try {
    // Find a test user (you can replace this with a real user ID)
    const user = await prisma.profile.findFirst()
    
    if (!user) {
      console.log('❌ No user found. Please ensure you have at least one user in the database.')
      return
    }

    console.log(`Creating sample notifications for user: ${user.full_name || user.id}`)

    // Create sample notifications
    const notifications = [
      {
        profileId: user.id,
        type: 'INTERVIEW_STARTED',
        message: 'Interview with John Doe has started.',
        link: '/interviews/test-123'
      },
      {
        profileId: user.id,
        type: 'INTERVIEW_COMPLETED',
        message: 'Interview with Jane Smith has been completed.',
        link: '/interviews/test-456'
      },
      {
        profileId: user.id,
        type: 'RESULTS_READY',
        message: 'Results for Alex Johnson are ready.',
        link: '/results/individual?id=test-789'
      },
      {
        profileId: user.id,
        type: 'TEMPLATE_SHARED',
        message: 'A new template "Frontend Developer Assessment" has been shared with you.',
        link: '/templates'
      },
      {
        profileId: user.id,
        type: 'GENERAL_ANNOUNCEMENT',
        message: 'New features and improvements are now available.',
        link: null
      }
    ]

    for (const notification of notifications) {
      await prisma.notification.create({ data: notification })
      console.log(`✅ Created notification: ${notification.message}`)
    }

    console.log('🎉 Sample notifications created successfully!')

  } catch (error) {
    console.error('❌ Error creating sample notifications:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createSampleNotifications()
