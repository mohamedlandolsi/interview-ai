const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugCurrentTemplate() {
  try {
    console.log('🔍 Debugging Current Template Configuration');
    console.log('==========================================\n');

    // Check all templates and their durations
    console.log('📋 All Templates in Database:');
    console.log('-----------------------------');
    const templates = await prisma.interviewTemplate.findMany({
      select: { 
        id: true,
        title: true, 
        duration: true, 
        category: true,
        created_at: true,
        updated_at: true
      },
      orderBy: { updated_at: 'desc' }
    });
    
    templates.forEach(template => {
      console.log(`📄 ${template.title}`);
      console.log(`   ID: ${template.id}`);
      console.log(`   Duration: ${template.duration} minutes`);
      console.log(`   Category: ${template.category}`);
      console.log(`   Last Updated: ${template.updated_at.toISOString()}`);
      console.log();
    });

    // Check if there's a 2-minute template
    const twoMinuteTemplate = templates.find(t => t.duration === 2);
    if (twoMinuteTemplate) {
      console.log('✅ Found 2-minute template:');
      console.log(`   Title: ${twoMinuteTemplate.title}`);
      console.log(`   ID: ${twoMinuteTemplate.id}`);
      
      // Test the buildFirstMessage function with this template
      console.log('\n🧪 Testing buildFirstMessage with 2-minute template:');
      const candidateName = 'Test User';
      const position = 'Test Position';
      
      const firstMessage = `Hello ${candidateName}! Welcome to your interview for the ${position} position. I'm your AI interviewer today.

I'll be conducting a ${twoMinuteTemplate.category || 'professional'} interview that should take about ${twoMinuteTemplate.duration || 30} minutes. I'll ask you questions to learn more about your background and experience.

Are you ready to begin?`;

      console.log('Generated Message:');
      console.log('------------------');
      console.log(firstMessage);
      
      const durationMatch = firstMessage.match(/about (\d+) minutes/);
      const announcedDuration = durationMatch ? parseInt(durationMatch[1]) : null;
      console.log(`\n📊 Duration Analysis:`);
      console.log(`   Template Duration: ${twoMinuteTemplate.duration} minutes`);
      console.log(`   Announced Duration: ${announcedDuration} minutes`);
      console.log(`   Status: ${announcedDuration === twoMinuteTemplate.duration ? '✅ CORRECT' : '❌ INCORRECT'}`);
    } else {
      console.log('❌ No 2-minute template found. Creating one for testing...');
      
      const newTemplate = await prisma.interviewTemplate.create({
        data: {
          title: 'Quick Test Interview - 2 Minutes',
          duration: 2,
          category: 'Technical',
          questions: [
            {
              text: "Tell me briefly about yourself.",
              type: "behavioral",
              timeAllocation: 1
            },
            {
              text: "What's your biggest strength?",
              type: "behavioral", 
              timeAllocation: 1
            }
          ]
        }
      });
      
      console.log('✅ Created 2-minute template:');
      console.log(`   ID: ${newTemplate.id}`);
      console.log(`   Title: ${newTemplate.title}`);
      console.log(`   Duration: ${newTemplate.duration} minutes`);
    }

    // Check recent interview sessions
    console.log('\n📝 Recent Interview Sessions:');
    console.log('-----------------------------');
    const recentSessions = await prisma.interviewSession.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
        include: {
          template: {
            select: { title: true, duration: true }
          }
        }
      });    if (recentSessions.length > 0) {
      recentSessions.forEach(session => {
        console.log(`🎯 Session ${session.id.substring(0, 8)}...`);
        console.log(`   Template: ${session.template?.title || 'Unknown'}`);
        console.log(`   Duration: ${session.template?.duration || 'Unknown'} minutes`);
        console.log(`   Created: ${session.created_at.toISOString()}`);
        console.log();
      });
    } else {
      console.log('No recent interview sessions found.');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error debugging template:', error);
    await prisma.$disconnect();
  }
}

debugCurrentTemplate();
