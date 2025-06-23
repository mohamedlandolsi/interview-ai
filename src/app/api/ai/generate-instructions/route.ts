import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { prompt, templateName, category, difficulty, position } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      )
    }    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Create a comprehensive prompt for generating interview instructions
    const systemPrompt = `You are an expert interview consultant specializing in creating AI voice assistant instructions for job interviews. Your task is to generate specific, actionable instructions that will guide an AI interviewer during a live interview session.

Context:
- Template Name: ${templateName || 'N/A'}
- Category: ${category || 'N/A'}
- Difficulty: ${difficulty || 'N/A'}
- Position: ${position || 'N/A'}

User Request: ${prompt}

Generate professional AI interviewer instructions that include:
1. Specific behavioral guidance for the AI interviewer
2. Interview focus areas and priorities
3. Question types or topics to emphasize
4. Follow-up question strategies
5. Evaluation criteria to pay attention to
6. Communication style preferences

The instructions should be:
- Clear and actionable
- Focused on improving interview quality
- Tailored to the specific role/category
- Professional in tone
- Between 100-300 words

Format the response as direct instructions to the AI interviewer, starting with action verbs like "Focus on...", "Ask about...", "Pay attention to...", etc.`

    const result = await model.generateContent(systemPrompt)
    const response = await result.response
    const instructions = response.text()

    return NextResponse.json({
      success: true,
      instructions: instructions.trim()
    })

  } catch (error) {
    console.error('Error generating AI instructions:', error)
    return NextResponse.json(
      { error: 'Failed to generate instructions' },
      { status: 500 }
    )
  }
}
