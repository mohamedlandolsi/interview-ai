const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixMissingDurations() {
  try {
    console.log('🔧 Finding templates with missing durations...');
    
    // First, find the templates that need updating
    const templatesNeedingFix = await prisma.interviewTemplate.findMany({
      where: {
        OR: [
          { duration: null },
          { category: null }
        ]
      },
      select: { id: true, title: true, duration: true, category: true }
    });
    
    console.log('Found templates needing fix:', templatesNeedingFix);
    
    for (const template of templatesNeedingFix) {
      let updateData = {};
      
      // Set appropriate duration and category based on title
      if (template.title.includes('Mid-Level Frontend Developer')) {
        updateData = { duration: 45, category: 'Technical' };
      } else if (template.title.includes('Junior Next.js Developer')) {
        updateData = { duration: 30, category: 'Technical' };
      } else if (!template.duration) {
        updateData.duration = 30; // Default fallback
      }
      
      if (!template.category) {
        updateData.category = updateData.category || 'General';
      }
      
      if (Object.keys(updateData).length > 0) {
        const updated = await prisma.interviewTemplate.update({
          where: { id: template.id },
          data: updateData
        });
        console.log(`✅ Updated: ${updated.title} - Duration: ${updated.duration} minutes, Category: ${updated.category}`);
      }
    }
    
    // Verify all templates now have durations
    const allTemplates = await prisma.interviewTemplate.findMany({
      select: { title: true, duration: true, category: true }
    });
    
    console.log('\n📊 All Templates After Fix:');
    console.log('============================');
    allTemplates.forEach(template => {
      console.log(`🔹 ${template.title}`);
      console.log(`   Duration: ${template.duration} minutes`);
      console.log(`   Category: ${template.category}`);
      console.log('');
    });
    
    const stillMissing = allTemplates.filter(t => !t.duration);
    if (stillMissing.length === 0) {
      console.log('✅ SUCCESS: All templates now have duration values!');
    } else {
      console.log('⚠️  Still missing durations:', stillMissing.length);
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error fixing durations:', error);
    await prisma.$disconnect();
  }
}

fixMissingDurations();
