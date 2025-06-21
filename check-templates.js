const { PrismaClient } = require('@prisma/client');

async function getTemplates() {
  const prisma = new PrismaClient();
  
  try {
    const templates = await prisma.interviewTemplate.findMany({
      select: {
        id: true,
        title: true,
        name: true,
        rawQuestions: true
      }
    });
    
    console.log('Available templates:');
    templates.forEach(t => {
      console.log(`ID: ${t.id}`);
      console.log(`Title: ${t.title || t.name}`);
      if (t.rawQuestions && t.rawQuestions.length > 0) {
        console.log('Questions:');
        t.rawQuestions.slice(0, 5).forEach((q, i) => {
          const question = typeof q === 'string' ? q : q.question || q.text || JSON.stringify(q);
          console.log(`  ${i + 1}. ${question}`);
        });
      }
      console.log('---');
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getTemplates();
