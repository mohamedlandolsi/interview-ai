import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Test endpoint for Gemini 2.5 Flash integration
 */
export async function GET() {
  try {
    console.log('🧪 Testing Gemini 2.5 Flash integration...')
    
    // Check if Gemini API key is available
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY not found in environment variables',
        env_check: {
          NODE_ENV: process.env.NODE_ENV,
          has_gemini_key: !!process.env.GEMINI_API_KEY
        }
      })
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(geminiApiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000
      }
    })

    // Simple test prompt
    const prompt = `
    Please analyze this simple interview response and provide a JSON output:

    Question: "Tell me about your experience with React."
    Answer: "I have 3 years of experience with React, building several large-scale applications using hooks and functional components."

    Provide a JSON response with:
    {
      "score": 85,
      "feedback": "Good experience level demonstrated",
      "strengths": ["3 years experience", "Modern React knowledge"]
    }
    `

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    console.log('✅ Gemini 2.5 Flash response received')
    console.log('Response length:', response.length)

    // Try to parse as JSON
    let parsedResponse = null
    try {
      parsedResponse = JSON.parse(response)
    } catch (parseError) {
      console.log('⚠️  Response is not valid JSON, returning raw text')
    }

    return NextResponse.json({
      success: true,
      gemini_model: 'gemini-2.5-flash',
      response_length: response.length,
      raw_response: response,
      parsed_response: parsedResponse,
      api_key_configured: true
    })

  } catch (error) {
    console.error('❌ Error testing Gemini:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      error_type: error?.constructor.name
    }, { status: 500 })
  }
}
