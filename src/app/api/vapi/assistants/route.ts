import { NextRequest, NextResponse } from 'next/server'
import { VapiAssistantService } from '@/lib/vapi-assistant-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { candidateName, position, templateQuestions, companyName, interviewType } = body

    if (!candidateName || !position) {
      return NextResponse.json(
        { error: 'Candidate name and position are required' },
        { status: 400 }
      )
    }

    // Create a new assistant with enhanced configuration
    const assistant = await VapiAssistantService.createInterviewAssistant({
      candidateName,
      position,
      templateQuestions,
      companyName,
      interviewType
    })

    return NextResponse.json({
      success: true,
      assistant: {
        id: assistant.id,
        name: assistant.name,
        status: assistant.status
      }
    })

  } catch (error) {
    console.error('Error creating Vapi assistant:', error)
    return NextResponse.json(
      { error: 'Failed to create assistant' },
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
