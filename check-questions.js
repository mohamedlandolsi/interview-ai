const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkQuestions() {
  const template = await prisma.interviewTemplate.findFirst()
  console.log('Raw questions:', JSON.stringify(template.questions, null, 2))
  await prisma.$disconnect()
}

checkQuestions()
