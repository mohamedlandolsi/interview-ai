/**
 * Debug question parsing
 */

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function debugQuestionParsing() {
  console.log('🔍 Debugging question parsing...')

  try {
    const template = await prisma.interviewTemplate.findFirst({
      where: {
        questions: { not: null }
      }
    })

    console.log('Raw questions from DB:', JSON.stringify(template.questions, null, 2))

    // Test parsing logic
    const questionsJson = template.questions
    let templateQuestions = []

    if (Array.isArray(questionsJson)) {
      console.log('✅ Questions is an array')
      templateQuestions = questionsJson.map((q, index) => {
        console.log(`Question ${index}:`, q)
        
        if (typeof q === 'string') {
          console.log('  → String format')
          return { type: 'text_response', text: q }
        }
        
        if (q.title) {
          console.log(`  → Title format: "${q.title}"`)
          return { 
            type: q.type || 'text_response', 
            text: q.title,
            category: q.category,
            weight: q.points
          }
        }
        
        if (q.text) {
          console.log(`  → Text format: "${q.text}"`)
          return {
            type: q.type || 'text_response',
            text: q.text,
            category: q.category,
            weight: q.weight
          }
        }
        
        console.log('  → Unknown format, returning as-is')
        return q
      })
    }

    console.log('\nParsed questions:')
    templateQuestions.forEach((q, index) => {
      console.log(`${index + 1}. Text: "${q.text}", Type: ${q.type}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugQuestionParsing()
