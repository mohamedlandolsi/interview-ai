import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionDefaults } from '@/lib/session-defaults'

export async function POST(request: NextRequest) {
  try {
    console.log('Creating sample interview data...')
    
    const defaults = await getSessionDefaults()
    
    // Sample candidates and positions
    const candidates = [
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        position: 'Frontend Developer',
        score: 88,
        status: 'completed',
        duration: 45,
        strengths: ['Strong React skills', 'Good problem-solving', 'Clear communication'],
        improvements: ['CSS optimization', 'Testing frameworks'],
        transcript: 'Can you tell me about your experience with React? I have been working with React for 3 years and built several complex applications...'
      },
      {
        name: 'Bob Smith',
        email: 'bob.smith@example.com',
        position: 'Backend Developer',
        score: 76,
        status: 'completed',
        duration: 50,
        strengths: ['Database design', 'API development', 'System architecture'],
        improvements: ['Microservices patterns', 'Performance optimization'],
        transcript: 'How do you approach database design? I start by analyzing the business requirements and identifying the core entities...'
      },
      {
        name: 'Carol Davis',
        email: 'carol.davis@example.com',
        position: 'Product Manager',
        score: 92,
        status: 'completed',
        duration: 60,
        strengths: ['Strategic thinking', 'Stakeholder management', 'Market analysis'],
        improvements: ['Technical depth', 'Data analysis skills'],
        transcript: 'How do you prioritize features? I use a combination of user research, business impact, and technical feasibility analysis...'
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@example.com',
        position: 'UX Designer',
        score: 84,
        status: 'completed',
        duration: 40,
        strengths: ['User research', 'Design systems', 'Prototyping'],
        improvements: ['Accessibility knowledge', 'Design metrics'],
        transcript: 'Walk me through your design process. I always start with user research to understand the problem space...'
      },
      {
        name: 'Eva Brown',
        email: 'eva.brown@example.com',
        position: 'Data Scientist',
        score: 79,
        status: 'completed',
        duration: 55,
        strengths: ['Statistical modeling', 'Python expertise', 'Data visualization'],
        improvements: ['MLOps practices', 'Big data technologies'],
        transcript: 'How do you approach feature selection? I typically start with exploratory data analysis to understand the relationships...'
      },
      {
        name: 'Frank Miller',
        email: 'frank.miller@example.com',
        position: 'DevOps Engineer',
        score: 86,
        status: 'in_progress',
        duration: 0,
        strengths: ['Kubernetes', 'CI/CD pipelines', 'Infrastructure as Code'],
        improvements: ['Security practices', 'Cost optimization'],
        transcript: 'Tell me about your experience with containerization. I have been working with Docker and Kubernetes for 2 years...'
      }
    ]

    const createdSessions = []

    for (const candidate of candidates) {
      const baseDate = new Date()
      baseDate.setDate(baseDate.getDate() - Math.floor(Math.random() * 30)) // Random date in last 30 days
      
      const session = await prisma.interviewSession.create({
        data: {
          candidate_name: candidate.name,
          candidate_email: candidate.email,
          position: candidate.position,
          template_id: defaults.templateId,
          interviewer_id: defaults.interviewerId,
          vapi_call_id: `vapi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          vapi_assistant_id: 'assistant-demo',
          status: candidate.status as any,
          overall_score: candidate.score,
          analysis_score: candidate.score,
          duration: candidate.duration,
          created_at: baseDate,
          started_at: candidate.status !== 'scheduled' ? baseDate : undefined,
          completed_at: candidate.status === 'completed' ? new Date(baseDate.getTime() + candidate.duration * 60000) : undefined,
          strengths: candidate.strengths,
          areas_for_improvement: candidate.improvements,
          final_transcript: candidate.transcript,
          analysis_feedback: `Overall strong performance with ${candidate.score}/100 score. ${candidate.strengths.join(', ')} are key strengths. Areas for improvement include ${candidate.improvements.join(', ')}.`,
          conversation_summary: `${candidate.duration} minute interview for ${candidate.position} position. Candidate demonstrated solid understanding of the role requirements.`,
          category_scores: {
            technical: candidate.score + Math.floor(Math.random() * 10) - 5,
            communication: candidate.score + Math.floor(Math.random() * 10) - 5,
            problemSolving: candidate.score + Math.floor(Math.random() * 10) - 5,
            culturalFit: candidate.score + Math.floor(Math.random() * 10) - 5
          },
          hiring_recommendation: candidate.score >= 85 ? 'Yes' : candidate.score >= 75 ? 'Maybe' : 'No',
          key_insights: candidate.strengths.slice(0, 2),
          real_time_messages: []
        }
      })

      createdSessions.push(session)
    }

    return NextResponse.json({
      success: true,
      message: `Created ${createdSessions.length} sample interview sessions`,
      sessions: createdSessions.map(s => ({
        id: s.id,
        candidateName: s.candidate_name,
        position: s.position,
        score: s.overall_score,
        status: s.status
      }))
    })

  } catch (error) {
    console.error('Error creating sample data:', error)
    return NextResponse.json(
      { error: 'Failed to create sample data', details: error },
      { status: 500 }
    )
  }
}
