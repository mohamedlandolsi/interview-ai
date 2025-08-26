/**
 * Test the updated question parsing in InterviewOrchestrator
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Mock the question parsing logic
function parseTemplateQuestions(questionsJson) {
  try {
    if (Array.isArray(questionsJson)) {
      return questionsJson.map(q => {
        if (typeof q === 'string') {
          return { type: 'text_response', text: q }
        }
        
        // Handle new format with title field
        if (q.title) {
          return { 
            type: q.type || 'text_response', 
            text: q.title,
            category: q.category,
            weight: q.points
          }
        }
        
        // Handle legacy format with text field
        if (q.text) {
          return {
            type: q.type || 'text_response',
            text: q.text,
            category: q.category,
            weight: q.weight
          }
        }
        
        return q
      })
    }
    
    if (typeof questionsJson === 'object' && questionsJson.questions) {
      return questionsJson.questions
    }
    
    return []
  } catch (error) {
    console.error('❌ Error parsing template questions:', error)
    return []
  }
}

async function testQuestionParsing() {
  console.log('🧪 Testing Question Parsing...')

  try {
    const template = await prisma.interviewTemplate.findFirst()
    console.log(`\n📋 Testing with template: ${template.title}`)
    
    const questions = parseTemplateQuestions(template.questions)
    console.log(`\n✅ Parsed ${questions.length} questions:`)
    
    questions.forEach((q, index) => {
      console.log(`  ${index + 1}. ${q.text} (${q.type})`)
      if (q.weight) console.log(`     Weight: ${q.weight} points`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testQuestionParsing()
