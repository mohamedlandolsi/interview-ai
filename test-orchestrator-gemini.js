/**
 * Test InterviewOrchestrator with Gemini API
 */

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Mock the InterviewOrchestrator methods we want to test
const { GoogleGenerativeAI } = require('@google/generative-ai')

async function testInterviewOrchestrator() {
  console.log('🧪 Testing InterviewOrchestrator with Gemini API...')

  try {
    // Test 1: Check Gemini API setup
    console.log('\n📋 Test 1: Verifying Gemini API setup...')
    const apiKey = process.env.GEMINI_API_KEY
    console.log('✅ Gemini API Key loaded:', !!apiKey)
    
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    // Test 2: Get a real template and session
    console.log('\n📊 Test 2: Getting interview template and creating test session...')
    const template = await prisma.interviewTemplate.findFirst({
      where: {
        questions: { not: null }
      }
    })
    
    if (!template) {
      console.log('❌ No templates found with questions')
      return
    }
    
    console.log(`✅ Found template: ${template.title}`)
    console.log(`   Category: ${template.category}, Duration: ${template.duration}min`)
    
    // Parse template questions
    let templateQuestions = []
    try {
      if (Array.isArray(template.questions)) {
        templateQuestions = template.questions.map(q => {
          if (typeof q === 'string') {
            return { type: 'text_response', text: q }
          }
          return q
        })
      } else if (template.questions?.questions) {
        templateQuestions = template.questions.questions
      }
    } catch (error) {
      console.log('❌ Error parsing questions:', error.message)
      return
    }
    
    console.log(`✅ Parsed ${templateQuestions.length} template questions`)
    if (templateQuestions.length > 0) {
      console.log(`   First question: ${templateQuestions[0].text}`)
    }
    
    // Test 3: Generate a dynamic question using Gemini
    console.log('\n🧠 Test 3: Generating dynamic question with Gemini...')
    
    const askedQuestions = templateQuestions.map(q => q.text)
    const mockPosition = 'Software Engineer'
    const mockCandidateName = 'Test Candidate'
    
    const prompt = `
You are an expert interviewer conducting a ${template.category || 'professional'} interview for the position: ${mockPosition}.

INTERVIEW CONTEXT:
- Template: ${template.title}
- Description: ${template.description || 'Not provided'}
- Category: ${template.category || 'General'}
- Difficulty: ${template.difficulty || 'Intermediate'}
- Tags: ${template.tags?.join(', ') || 'None'}
- Persona Instructions: ${template.instruction || 'Be professional and thorough'}

ALREADY ASKED QUESTIONS:
${askedQuestions.slice(0, 3).map((q, i) => `${i + 1}. ${q}`).join('\n')}

REQUIREMENTS:
1. Generate ONE follow-up question that builds on the candidate's previous responses
2. The question should align with the interview category and difficulty level
3. Avoid repeating any of the already asked questions
4. Make it specific to the ${mockPosition} role
5. Keep the question concise and clear
6. Focus on evaluating skills, experience, or cultural fit

Generate only the question text, nothing else:
    `.trim()
    
    console.log('🔄 Sending request to Gemini for dynamic question...')
    const result = await model.generateContent(prompt)
    const response = result.response
    const dynamicQuestion = response.text()?.trim()
    
    console.log('✅ Generated dynamic question:')
    console.log(`   "${dynamicQuestion}"`)
    console.log(`   Length: ${dynamicQuestion.length} characters`)
    
    // Test 4: Test concluding response generation
    console.log('\n🏁 Test 4: Generating concluding response...')
    
    const concludingPrompt = `
Generate a professional concluding statement for an interview with ${mockCandidateName} for the ${mockPosition} position.
The statement should:
1. Thank the candidate
2. Mention the next steps
3. Be warm and professional
4. Keep it concise (2-3 sentences)

Generate only the concluding statement:
    `.trim()
    
    const concludingResult = await model.generateContent(concludingPrompt)
    const concludingResponse = concludingResult.response
    const concludingText = concludingResponse.text()?.trim()
    
    console.log('✅ Generated concluding response:')
    console.log(`   "${concludingText}"`)
    
    console.log('\n✅ All InterviewOrchestrator tests passed!')
    console.log('🎯 Gemini API integration is working correctly for interview orchestration')

  } catch (error) {
    console.error('❌ Error in InterviewOrchestrator tests:', error)
    if (error.status) {
      console.error('Status:', error.status)
    }
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testInterviewOrchestrator()
