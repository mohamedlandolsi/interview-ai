import { NextRequest, NextResponse } from 'next/server'
import { VapiAssistantService } from '@/lib/vapi-assistant-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔧 Vapi assistant request body:', JSON.stringify(body, null, 2))
    
    const { candidateName, position, templateQuestions, templateInstruction, companyName, interviewType } = body

    if (!candidateName || !position) {
      console.error('❌ Missing required fields:', { candidateName, position })
      return NextResponse.json(
        { error: 'Candidate name and position are required' },
        { status: 400 }
      )
    }

    console.log('🎯 Creating assistant with VapiAssistantService...')
      // Create a new assistant with enhanced configuration
    const assistant = await VapiAssistantService.createInterviewAssistant({
      candidateName,
      position,
      templateQuestions,
      templateInstruction,
      companyName,
      interviewType
    })

    console.log('✅ Assistant created successfully:', assistant.id)

    return NextResponse.json({
      success: true,
      assistant: {
        id: assistant.id,
        name: assistant.name,
        status: assistant.status
      }
    })

  } catch (error) {
    console.error('❌ Error creating Vapi assistant:', error)
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    
    return NextResponse.json(
      { 
        error: 'Failed to create assistant',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assistantId = searchParams.get('id')

    if (assistantId) {
      // Get specific assistant
      const assistant = await VapiAssistantService.getAssistant(assistantId)
      return NextResponse.json({ success: true, assistant })
    } else {
      // List all assistants
      const assistants = await VapiAssistantService.listAssistants()
      return NextResponse.json({ success: true, assistants })
    }

  } catch (error) {
    console.error('Error fetching Vapi assistants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assistants' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assistantId = searchParams.get('id')

    if (!assistantId) {
      return NextResponse.json(
        { error: 'Assistant ID is required' },
        { status: 400 }
      )
    }

    await VapiAssistantService.deleteAssistant(assistantId)

    return NextResponse.json({
      success: true,
      message: 'Assistant deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting Vapi assistant:', error)
    return NextResponse.json(
      { error: 'Failed to delete assistant' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assistantId = searchParams.get('id')
    const body = await request.json()

    if (!assistantId) {
      return NextResponse.json(
        { error: 'Assistant ID is required' },
        { status: 400 }
      )
    }

    const updatedAssistant = await VapiAssistantService.updateAssistant(assistantId, body)

    return NextResponse.json({
      success: true,
      assistant: updatedAssistant
    })

  } catch (error) {
    console.error('Error updating Vapi assistant:', error)
    return NextResponse.json(
      { error: 'Failed to update assistant' },
      { status: 500 }
    )
  }
}
