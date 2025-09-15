const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTranscripts() {
  // First, let's find any sessions with transcript data
  const sessionsWithTranscript = await prisma.interviewSession.findMany({
    where: {
      OR: [
        { final_transcript: { not: null } },
        { transcript: { not: null } }
      ]
    },
    orderBy: { updated_at: 'desc' },
    take: 5,
    select: {
      id: true,
      candidate_name: true,
      final_transcript: true,
      transcript: true,
      real_time_messages: true,
      status: true,
      vapi_call_id: true
    }
  });
  
  console.log('Sessions WITH transcript data:');
  if (sessionsWithTranscript.length === 0) {
    console.log('No sessions found with transcript data');
  } else {
    sessionsWithTranscript.forEach(session => {
      console.log('\nSession:', session.id, 'Candidate:', session.candidate_name);
      console.log('Status:', session.status, 'Call ID:', session.vapi_call_id);
      console.log('Final transcript length:', session.final_transcript ? session.final_transcript.length : 'null');
      console.log('Legacy transcript length:', session.transcript ? session.transcript.length : 'null');
      console.log('Real-time messages count:', session.real_time_messages ? session.real_time_messages.length : 'null');
      
      if (session.final_transcript) {
        console.log('Final transcript preview:', session.final_transcript.substring(0, 200) + '...');
      } else if (session.transcript) {
        console.log('Legacy transcript preview:', session.transcript.substring(0, 200) + '...');
      }
    });
  }
  
  await prisma.$disconnect();
}

checkTranscripts().catch(console.error);