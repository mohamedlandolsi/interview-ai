// Simple test to create an interview session and test the redirect
async function testRedirectError() {
  try {
    // First, let's get some sample data from the database directly using Prisma
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Get the first template
    const template = await prisma.interviewTemplate.findFirst();
    console.log('Found template:', template?.title);
    
    if (!template) {
      console.log('No templates found');
      return;
    }      // Create a test interview session
    const session = await prisma.interviewSession.create({
      data: {
        template_id: template.id,
        interviewer_id: 'cm53wgjk70000vzmhmm4tcjj9', // Sample interviewer ID from seed
        candidate_name: '',
        candidate_email: '',
        position: 'Test Position',
        duration: 30,
        status: 'scheduled'
      }
    });
    
    console.log('Created session:', session.id);
    console.log(`Test URL 1: http://localhost:3000/interview/${session.id}`);
    
    // Create another session with candidate info filled (needsCandidateInfo will be false)
    const session2 = await prisma.interviewSession.create({
      data: {
        template_id: template.id,
        interviewer_id: 'cm53wgjk70000vzmhmm4tcjj9',
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
