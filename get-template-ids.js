const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getTemplateIds() {
  try {
    const templates = await prisma.interviewTemplate.findMany({
      select: {
        id: true,
        title: true,
        name: true,
        rawQuestions: true
      }
    })
    
    console.log('Templates:')
    templates.forEach((template, index) => {
      console.log(`${index + 1}. ID: ${template.id}`)
      console.log(`   Title: ${template.title}`)
      console.log(`   Name: ${template.name}`)
      console.log(`   Questions: ${template.rawQuestions ? JSON.stringify(template.rawQuestions).length > 100 ? 'Has questions' : 'Empty questions' : 'No rawQuestions'}`)
      console.log('')
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

getTemplateIds()
