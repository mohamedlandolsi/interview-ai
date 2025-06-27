const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testGeneralInterviewCreation() {
  try {
    console.log('=== TESTING GENERAL INTERVIEW CREATION ===');
    
    // Test user (Cosme)
    const userId = 'b0a6f44f-897f-44e7-b230-cba384c672fe';
    
    // Simulate the logic from the API
    console.log('1. Finding default general template...');
    const template = await prisma.interviewTemplate.findFirst({
      where: {
        title: { contains: 'General', mode: 'insensitive' },
        is_built_in: true
      }
    });
    
    if (!template) {
      console.error('❌ No general template found!');
      return;
    }
    
    console.log('✅ Found template:', template.title, '(ID:', template.id + ')');
    
    // Test creating an interview session
    console.log('2. Creating interview session...');
    const testSession = await prisma.interviewSession.create({
      data: {
        template_id: template.id,
        interviewer_id: userId,
        candidate_name: '',
        candidate_email: '',
        position: 'Test Position',
        status: 'scheduled',
        duration: 30,
        metrics: {
          sessionType: 'candidate_link',
          description: 'Test general interview',
          createdBy: userId,
          templateName: template.title,
          isGeneralInterview: true
        }
      },
      include: {
        template: {
          select: {
            id: true,
            title: true,
            category: true,
            difficulty: true,
            duration: true
          }
        }
      }
    });
    
    console.log('✅ Session created successfully!');
    console.log('   Session ID:', testSession.id);
    console.log('   Template:', testSession.template.title);
    console.log('   Position:', testSession.position);
    
    // Clean up - delete the test session
    console.log('3. Cleaning up test session...');
    await prisma.interviewSession.delete({
      where: { id: testSession.id }
    });
    console.log('✅ Test session deleted');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
  }
}

testGeneralInterviewCreation();
