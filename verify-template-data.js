const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function verifyTemplateData() {
  try {
    const templates = await prisma.interviewTemplate.findMany({
      select: {
        id: true,
        title: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        duration: true,
        tags: true,
        questions: true,
        rawQuestions: true
      }
    })
    
    console.log('=== TEMPLATE DATA VERIFICATION ===\n')
    templates.forEach((template, index) => {
      console.log(`Template ${index + 1}:`)
      console.log(`ID: ${template.id}`)
      console.log(`Name: ${template.name}`)
      console.log(`Category: ${template.category}`)
      console.log(`Difficulty: ${template.difficulty}`)
      console.log(`Duration: ${template.duration}`)
      console.log(`Tags:`, template.tags)
      
      if (template.rawQuestions && Array.isArray(template.rawQuestions)) {
        console.log(`Raw Questions (${template.rawQuestions.length} questions):`)
        template.rawQuestions.forEach((q, qIndex) => {
          console.log(`  ${qIndex + 1}. [${q.type}] ${q.title}`)
          console.log(`     Description: ${q.description}`)
          console.log(`     Required: ${q.required}, Points: ${q.points}`)
          if (q.options) console.log(`     Options:`, q.options)
          if (q.minRating && q.maxRating) console.log(`     Rating: ${q.minRating} to ${q.maxRating}`)
        })
      } else {
        console.log('Raw Questions: None or not an array')
      }
      
      console.log('---\n')
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyTemplateData()
