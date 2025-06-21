// Simple test to create an interview session and test the redirect
async function testRedirectError() {
  try {
    // First, let's get some sample data from the database directly using Prisma
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Get the first template
    const template = await prisma.interviewTemplate.findFirst();
    console.log('Found template:', template?.title);
    
    // Get the first profile (user)
    const profile = await prisma.profile.findFirst();
    console.log('Found profile:', profile?.full_name, profile?.id);
    
    if (!template || !profile) {
      console.log('No templates or profiles found');
      return;
    }
    
    // Create a test interview session with empty candidate info
    const session = await prisma.interviewSession.create({
      data: {
        template_id: template.id,
        interviewer_id: profile.id,
        candidate_name: '',
        candidate_email: '',
        position: 'Test Position',
        duration: 30,
        status: 'scheduled'
      }
    });
    
    console.log('Created session:', session.id);
    console.log(`Test URL 1: http://localhost:3000/interview/${session.id}`);
    
    // Create another session with candidate info filled
    const session2 = await prisma.interviewSession.create({
      data: {
        template_id: template.id,
        interviewer_id: profile.id,
        candidate_name: 'Test Candidate',
        candidate_email: 'test@example.com',
        position: 'Test Position',
        duration: 30,
        status: 'scheduled'
      }
    });
    
    console.log('Created session 2:', session2.id);
    console.log(`Test URL 2: http://localhost:3000/interview/${session2.id}`);
    
    await prisma.$disconnect();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testRedirectError();
