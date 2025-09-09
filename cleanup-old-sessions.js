const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupOldSessions() {
  try {
    console.log('🧹 Cleaning Up Old Interview Sessions');
    console.log('====================================\n');

    // Get all sessions that should have ended by now
    const oldSessions = await prisma.interviewSession.findMany({
      where: {
        status: 'in_progress',
        started_at: {
          not: null
        }
      },
      include: {
        template: {
          select: { title: true, duration: true }
        }
      }
    });

    console.log(`Found ${oldSessions.length} active sessions to check:\n`);

    let cleanedCount = 0;
    const now = new Date();

    for (const session of oldSessions) {
      if (session.started_at) {
        const startTime = new Date(session.started_at);
        const elapsedMinutes = (now - startTime) / (1000 * 60);
        const templateDuration = session.template?.duration || 30;
        const shouldHaveEnded = elapsedMinutes > (templateDuration + 1); // Template duration + 1 minute grace

        console.log(`📄 Session ${session.id.substring(0, 8)}...:`);
        console.log(`   Template: ${session.template?.title || 'Unknown'}`);
        console.log(`   Duration: ${templateDuration} minutes`);
        console.log(`   Elapsed: ${elapsedMinutes.toFixed(1)} minutes`);
        console.log(`   Should clean: ${shouldHaveEnded ? '✅ YES' : '❌ NO'}`);

        if (shouldHaveEnded) {
          // Update session status to completed
          await prisma.interviewSession.update({
            where: { id: session.id },
            data: {
              status: 'completed',
              completed_at: new Date()
            }
          });
          cleanedCount++;
          console.log(`   ✅ Cleaned up session`);
        }
        console.log();
      }
    }

    console.log(`🎯 Summary:`);
    console.log(`   Total sessions checked: ${oldSessions.length}`);
    console.log(`   Sessions cleaned up: ${cleanedCount}`);
    console.log(`   Active sessions remaining: ${oldSessions.length - cleanedCount}`);

    if (cleanedCount > 0) {
      console.log('\n✅ Old sessions have been cleaned up.');
      console.log('💡 Now start a NEW interview to use the updated configuration!');
    } else {
      console.log('\n💡 Start a NEW interview session to get the fixed timing configuration.');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error cleaning sessions:', error);
    await prisma.$disconnect();
  }
}

cleanupOldSessions();
