import { NextRequest, NextResponse } from 'next/server'
import { VapiAssistantService } from '@/lib/vapi-assistant-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, candidateName, position, companyName } = body

    if (!type || !candidateName || !position) {
      return NextResponse.json(
        { error: 'Interview type, candidate name, and position are required' },
        { status: 400 }
      )
    }

    const validTypes = ['technical', 'behavioral', 'leadership', 'sales']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid interview type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Create specialized assistant
    const assistant = await VapiAssistantService.createSpecializedAssistant(
      type as 'technical' | 'behavioral' | 'leadership' | 'sales',
      {
        candidateName,
        position,
        companyName
      }
    )

    return NextResponse.json({
      success: true,
      assistant: {
        id: assistant.id,
        name: assistant.name,
        status: assistant.status,
        type
      },
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} interview assistant created successfully`
    })

  } catch (error) {
    console.error('Error creating specialized Vapi assistant:', error)
    return NextResponse.json(
      { error: 'Failed to create specialized assistant' },
      { status: 500 }
    )
  }
}
