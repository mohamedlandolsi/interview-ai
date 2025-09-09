const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTemplates() {
  try {
    const templates = await prisma.interviewTemplate.findMany({
      select: { 
        id: true, 
        title: true, 
        duration: true, 
        category: true 
      }
    });
    
    console.log('📊 Interview Template Duration Analysis:');
    console.log('=======================================');
    console.log('');
    
    templates.forEach(template => {
      console.log(`🔹 ${template.title}`);
      console.log(`   Duration: ${template.duration} minutes`);
      console.log(`   Category: ${template.category}`);
      console.log('');
    });
    
    const withoutDuration = templates.filter(t => !t.duration);
    if (withoutDuration.length > 0) {
      console.log('⚠️  Templates WITHOUT duration set:');
      withoutDuration.forEach(t => console.log(`   - ${t.title}`));
    } else {
      console.log('✅ All templates have duration values set');
    }
    
    console.log(`\n📈 Summary: ${templates.length} templates found`);
    console.log(`📈 Templates with duration: ${templates.filter(t => t.duration).length}`);
    console.log(`📈 Templates without duration: ${withoutDuration.length}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
  }
}

checkTemplates();
