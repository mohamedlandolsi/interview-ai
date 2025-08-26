/**
 * Test Gemini API integration
 */

require('dotenv').config({ path: '.env.local' })
const { GoogleGenerativeAI } = require('@google/generative-ai')

async function testGeminiAPI() {
  console.log('🧪 Testing Gemini API integration...')
  
  try {
    const apiKey = process.env.GEMINI_API_KEY
    console.log('API Key exists:', !!apiKey)
    console.log('API Key length:', apiKey?.length || 0)
    
    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment')
      return
    }
    
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `Generate a professional interview question for a software engineer position. 
    The question should assess problem-solving skills and be appropriate for a mid-level candidate.
    Provide only the question text, nothing else.`
    
    console.log('🔄 Sending request to Gemini...')
    const result = await model.generateContent(prompt)
    const response = result.response
    const question = response.text()
    
    console.log('✅ Gemini API Response:')
    console.log('Question:', question)
    console.log('Length:', question.length)
    
    if (question && question.length > 10) {
      console.log('✅ Gemini API integration working correctly!')
    } else {
      console.log('⚠️ Response seems too short or empty')
    }
    
  } catch (error) {
    console.error('❌ Error testing Gemini API:', error.message)
    if (error.status) {
      console.error('Status:', error.status)
    }
    if (error.statusText) {
      console.error('Status Text:', error.statusText)
    }
  }
}

testGeminiAPI()
