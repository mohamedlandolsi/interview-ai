const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findGeneralTemplate() {
  try {
    console.log('=== SEARCHING FOR GENERAL TEMPLATES ===');
    const generalTemplates = await prisma.interviewTemplate.findMany({
      where: {
        OR: [
          { title: { contains: 'General', mode: 'insensitive' } },
          { title: { contains: 'Open', mode: 'insensitive' } }
        ],
        is_built_in: true
      },
      select: {
        id: true,
        title: true,
        description: true,
        is_built_in: true,
        created_by: true
      }
    });
    
    console.log('General templates found:');
    generalTemplates.forEach(t => {
      console.log('- ' + t.title + ' (ID: ' + t.id + ')');
      console.log('  Description: ' + (t.description || 'No description'));
      console.log('  Created by: ' + t.created_by);
      console.log('');
    });
    
    // Pick the first general template
    if (generalTemplates.length > 0) {
      console.log('RECOMMENDED DEFAULT TEMPLATE:');
      console.log('ID: ' + generalTemplates[0].id);
      console.log('Title: ' + generalTemplates[0].title);
    } else {
      console.log('No general templates found - will need to create one');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

findGeneralTemplate();
