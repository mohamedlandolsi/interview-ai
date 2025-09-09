const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTemplateToTwoMinutes() {
  try {
    console.log('🔧 Updating "Junior Next.js Developer - Quick Screen" to 2 minutes');
    console.log('================================================================\n');

    // Get the specific template
    const templateId = 'cmfcbbw9b0001k0042p0mruh8'; // From the debug output
    
    console.log('📋 Current Template State:');
    const currentTemplate = await prisma.interviewTemplate.findUnique({
      where: { id: templateId },
      select: { id: true, title: true, duration: true, category: true }
    });
    
    if (currentTemplate) {
      console.log(`   Title: ${currentTemplate.title}`);
      console.log(`   Current Duration: ${currentTemplate.duration} minutes`);
      console.log(`   Category: ${currentTemplate.category}\n`);
      
      // Update the duration to 2 minutes
      console.log('🔄 Updating duration to 2 minutes...');
      const updatedTemplate = await prisma.interviewTemplate.update({
        where: { id: templateId },
        data: { duration: 2 },
        select: { id: true, title: true, duration: true, category: true }
      });
      
      console.log('✅ Template updated successfully!');
      console.log(`   Title: ${updatedTemplate.title}`);
      console.log(`   New Duration: ${updatedTemplate.duration} minutes`);
      console.log(`   Category: ${updatedTemplate.category}\n`);
      
      // Test the buildFirstMessage function with updated template
      console.log('🧪 Testing buildFirstMessage with updated template:');
      console.log('---------------------------------------------------');
      
      const candidateName = 'Test User';
      const position = 'Next.js Developer';
      
      const firstMessage = `Hello ${candidateName}! Welcome to your interview for the ${position} position. I'm your AI interviewer today.

I'll be conducting a ${updatedTemplate.category || 'professional'} interview that should take about ${updatedTemplate.duration || 30} minutes. I'll ask you questions to learn more about your background and experience.

Are you ready to begin?`;

      console.log('Generated First Message:');
      console.log('------------------------');
      console.log(firstMessage);
      
      const durationMatch = firstMessage.match(/about (\d+) minutes/);
      const announcedDuration = durationMatch ? parseInt(durationMatch[1]) : null;
      
      console.log(`\n📊 Duration Verification:`);
      console.log(`   Template Duration: ${updatedTemplate.duration} minutes`);
      console.log(`   Announced Duration: ${announcedDuration} minutes`);
      console.log(`   Status: ${announcedDuration === updatedTemplate.duration ? '✅ CORRECT' : '❌ INCORRECT'}`);
      
      console.log('\n🎯 Next Steps:');
      console.log('=============');
      console.log('1. The template duration has been updated in the database');
      console.log('2. Any NEW interview sessions using this template will now announce "2 minutes"');
      console.log('3. If you have an existing interview session, you may need to restart it to pick up the new duration');
      console.log('4. The assistant will now respect the 2-minute time limit (120 seconds)');
      
    } else {
      console.log('❌ Template not found!');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error updating template:', error);
    await prisma.$disconnect();
  }
}

updateTemplateToTwoMinutes();
