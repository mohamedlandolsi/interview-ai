const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugActiveInterviewSession() {
  try {
    console.log('🔍 Debugging Active Interview Session and Error Source');
    console.log('====================================================\n');

    // Check for recent/active interview sessions
    console.log('📋 Recent Interview Sessions:');
    console.log('-----------------------------');
    const recentSessions = await prisma.interviewSession.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        template: {
          select: { 
            id: true,
            title: true, 
            duration: true, 
            category: true,
            updated_at: true
          }
        }
      }
    });

    if (recentSessions.length > 0) {
      recentSessions.forEach((session, index) => {
        const status = session.status;
        const isRecent = new Date() - new Date(session.created_at) < 10 * 60 * 1000; // Less than 10 minutes old
        
        console.log(`📄 Session ${index + 1} ${isRecent ? '🔥 RECENT' : ''}:`);
        console.log(`   ID: ${session.id}`);
        console.log(`   Status: ${status}`);
        console.log(`   Template: ${session.template?.title || 'Unknown'}`);
        console.log(`   Template Duration: ${session.template?.duration || 'Unknown'} minutes`);
        console.log(`   Vapi Assistant ID: ${session.vapi_assistant_id || 'None'}`);
        console.log(`   Started: ${session.started_at ? new Date(session.started_at).toLocaleString() : 'Not started'}`);
        console.log(`   Created: ${new Date(session.created_at).toLocaleString()}`);
        
        if (isRecent && status === 'in_progress') {
          console.log(`   ⚠️  This session is currently active!`);
          console.log(`   Template Last Updated: ${session.template?.updated_at ? new Date(session.template.updated_at).toLocaleString() : 'Unknown'}`);
        }
        console.log();
      });
    } else {
      console.log('No recent sessions found.');
    }

    // Check if there's a Vapi configuration issue
    console.log('🔧 Checking Vapi Configuration:');
    console.log('-------------------------------');
    
    const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    const VAPI_PRIVATE_KEY = process.env.VAPI_PRIVATE_KEY;
    const VAPI_WEBHOOK_SECRET = process.env.VAPI_WEBHOOK_SECRET;
    
    console.log(`Public Key: ${VAPI_PUBLIC_KEY ? '✅ Set (length: ' + VAPI_PUBLIC_KEY.length + ')' : '❌ Missing'}`);
    console.log(`Private Key: ${VAPI_PRIVATE_KEY ? '✅ Set (length: ' + VAPI_PRIVATE_KEY.length + ')' : '❌ Missing'}`);
    console.log(`Webhook Secret: ${VAPI_WEBHOOK_SECRET ? '✅ Set (length: ' + VAPI_WEBHOOK_SECRET.length + ')' : '❌ Missing'}`);
    console.log();

    // Test the current buildAssistantFromTemplate function behavior
    console.log('🧪 Testing Current Assistant Configuration:');
    console.log('------------------------------------------');
    
    const template = await prisma.interviewTemplate.findFirst({
      where: { title: 'Junior Next.js Developer - Quick Screen' }
    });
    
    if (template) {
      const duration = template.duration || 30;
      const maxDurationSeconds = (duration * 60) + 30; // Our fix
      
      console.log(`Template Duration: ${duration} minutes`);
      console.log(`Expected maxDurationSeconds: ${maxDurationSeconds} seconds`);
      console.log(`Time breakdown:`);
      console.log(`  - Interview time: ${duration * 60} seconds`);
      console.log(`  - Buffer time: 30 seconds`);
      console.log(`  - Total allowed: ${maxDurationSeconds} seconds (${(maxDurationSeconds / 60).toFixed(2)} minutes)`);
      console.log();
      
      // Check if there might be an old assistant still active
      const activeSessions = await prisma.interviewSession.findMany({
        where: {
          template_id: template.id,
          status: 'in_progress'
        },
        select: {
          id: true,
          vapi_assistant_id: true,
          started_at: true,
          created_at: true
        }
      });
      
      if (activeSessions.length > 0) {
        console.log('⚠️  Found active sessions using this template:');
        activeSessions.forEach(session => {
          const startTime = session.started_at ? new Date(session.started_at) : null;
          const elapsedTime = startTime ? Math.floor((new Date() - startTime) / 1000) : 0;
          
          console.log(`   Session: ${session.id}`);
          console.log(`   Assistant ID: ${session.vapi_assistant_id}`);
          console.log(`   Elapsed time: ${elapsedTime} seconds`);
          console.log(`   Should have ended by now: ${elapsedTime > maxDurationSeconds ? '✅ YES' : '❌ NO'}`);
        });
        console.log();
      }
    }

    // Potential debugging steps
    console.log('🔍 Debugging Recommendations:');
    console.log('=============================');
    console.log('1. Check if you started a NEW interview session after the fix');
    console.log('2. Verify the assistant configuration is using the updated template');
    console.log('3. Check browser console for additional error details');
    console.log('4. Look for any Vapi-specific timeout configurations');
    console.log('5. Ensure the error is coming from our app, not Vapi directly');
    console.log();
    
    console.log('🚨 Possible Causes of Persistent Error:');
    console.log('=======================================');
    console.log('❓ Using an old/cached interview session');
    console.log('❓ Vapi assistant created before the fix');
    console.log('❓ Browser cache/storage containing old data');
    console.log('❓ Error is coming from Vapi service, not our error handling');
    console.log('❓ There might be another timeout setting we missed');

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error debugging session:', error);
    await prisma.$disconnect();
  }
}

debugActiveInterviewSession();
