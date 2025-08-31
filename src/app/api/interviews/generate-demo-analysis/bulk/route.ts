import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Import the analysis functions from the individual endpoint
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

/**
 * Generate demo analysis for all incomplete interviews
 * This endpoint processes multiple interviews in bulk
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🎭 Bulk demo analysis endpoint called')
    
    // Check if Gemini API key is available
    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      console.error('❌ GEMINI_API_KEY not found in environment variables')
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please check environment variables.' },
        { status: 500 }
      )
    }
    
    const { limit = 10 } = await request.json()

    // Get incomplete interviews (scheduled or in_progress with no analysis)
    const incompleteInterviews = await prisma.interviewSession.findMany({
      where: {
        AND: [
          {
            OR: [
              { status: 'scheduled' },
              { status: 'in_progress' }
            ]
          },
          {
            analysis_score: null
          },
          {
            OR: [
              { final_transcript: '' },
              { final_transcript: null },
              { final_transcript: { equals: null } }
            ]
          }
        ]
      },
      include: {
        template: true,
        interviewer: true
      },
      take: limit,
      orderBy: {
        created_at: 'desc'
      }
    })

    if (incompleteInterviews.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No incomplete interviews found to process',
        processed: 0,
        results: []
      })
    }

    console.log(`🎭 Processing ${incompleteInterviews.length} incomplete interviews for demo analysis`)

    const results = []
    let successCount = 0
    let errorCount = 0

    // Process each interview directly
    for (const interview of incompleteInterviews) {
      try {
        console.log(`Processing interview: ${interview.id} (${interview.position})`)
        
        // Generate mock transcript and analysis directly
        const mockTranscript = generateMockTranscript(interview.position, interview.template?.title || 'General Interview')
        const analysisResult = await generateAnalysisWithGemini(interview, mockTranscript)

        if (analysisResult) {
          // Update the session with generated analysis
          await prisma.interviewSession.update({
            where: { id: interview.id },
            data: {
              final_transcript: mockTranscript,
              status: 'completed',
              completed_at: new Date(),
              duration: interview.duration || Math.floor(Math.random() * 30) + 15,
              
              // AI Analysis results
              analysis_score: analysisResult.analysis_score,
              analysis_feedback: analysisResult.analysis_feedback,
              strengths: analysisResult.strengths,
              areas_for_improvement: analysisResult.areas_for_improvement,
              category_scores: analysisResult.category_scores,
              hiring_recommendation: analysisResult.hiring_recommendation,
              key_insights: analysisResult.key_insights,
              interview_metrics: analysisResult.interview_metrics,

              // Mock Vapi data for completeness
              vapi_call_id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              vapi_cost: Math.random() * 2 + 0.5,
              recording_url: `https://demo-recordings.example.com/${interview.id}.mp3`
            }
          })

          results.push({
            sessionId: interview.id,
            candidateName: interview.candidate_name,
            position: interview.position,
            status: 'success',
            analysisScore: analysisResult.analysis_score,
            recommendation: analysisResult.hiring_recommendation
          })
          successCount++
        } else {
          results.push({
            sessionId: interview.id,
            candidateName: interview.candidate_name,
            position: interview.position,
            status: 'error',
            error: 'Failed to generate analysis with Gemini'
          })
          errorCount++
        }
      } catch (error) {
        console.error(`❌ Error processing interview ${interview.id}:`, error)
        results.push({
          sessionId: interview.id,
          candidateName: interview.candidate_name,
          position: interview.position,
          status: 'error',
          error: error instanceof Error ? error.message : 'Processing error'
        })
        errorCount++
      }
    }

    console.log(`✅ Bulk demo analysis completed: ${successCount} success, ${errorCount} errors`)

    return NextResponse.json({
      success: true,
      message: `Processed ${incompleteInterviews.length} interviews`,
      processed: incompleteInterviews.length,
      successCount,
      errorCount,
      results
    })

  } catch (error) {
    console.error('❌ Error in bulk demo analysis:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process bulk demo analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Generate a realistic mock transcript based on position and template
 */
function generateMockTranscript(position: string, templateTitle: string): string {
  const interviewerName = "AI Interviewer"
  const candidateName = "Candidate"
  
  // Create position-specific content
  const positionKeywords = position.toLowerCase()
  let technicalQuestions = []
  let candidateResponses = []

  if (positionKeywords.includes('frontend') || positionKeywords.includes('react')) {
    technicalQuestions = [
      "Tell me about your experience with React and modern frontend development.",
      "How do you handle state management in large React applications?",
      "Explain the difference between controlled and uncontrolled components.",
      "How do you optimize React application performance?"
    ]
    candidateResponses = [
      "I have over 3 years of experience with React, working on several large-scale applications. I'm proficient with React hooks, functional components, and modern development practices. I've built responsive applications using React with TypeScript.",
      "For state management, I typically use React Context for simple state and Redux Toolkit for complex applications. I also leverage React Query for server state management, which helps separate concerns and improves caching.",
      "Controlled components have their state managed by React through props and callbacks, while uncontrolled components manage their own state internally. I prefer controlled components for form inputs as they provide better testing and validation capabilities.",
      "I optimize React performance through several techniques: using React.memo for expensive components, implementing proper key props for lists, code splitting with lazy loading, and utilizing the React DevTools Profiler to identify bottlenecks."
    ]
  } else if (positionKeywords.includes('backend') || positionKeywords.includes('node')) {
    technicalQuestions = [
      "Describe your experience with backend development and API design.",
      "How do you handle database optimization and query performance?",
      "Explain your approach to API security and authentication.",
      "How do you design scalable microservices architectures?"
    ]
    candidateResponses = [
      "I have 4 years of backend development experience, primarily with Node.js and Express. I've designed RESTful APIs and GraphQL endpoints, working with both SQL and NoSQL databases. I follow clean architecture principles and implement proper error handling.",
      "For database optimization, I use proper indexing strategies, analyze query execution plans, and implement caching layers with Redis. I also use database connection pooling and optimize N+1 queries through eager loading or DataLoader patterns.",
      "I implement JWT-based authentication, input validation and sanitization, rate limiting, and HTTPS enforcement. I follow OWASP security guidelines and regularly audit dependencies for vulnerabilities using tools like npm audit.",
      "I design microservices with single responsibility principle, implement proper service discovery, use API gateways for routing, and ensure services are stateless. I also implement circuit breakers and health checks for resilience."
    ]
  } else {
    // General technical questions
    technicalQuestions = [
      "Tell me about your technical background and experience.",
      "How do you approach problem-solving in software development?",
      "Describe a challenging project you worked on recently.",
      "How do you stay updated with new technologies?"
    ]
    candidateResponses = [
      "I have a strong technical background with experience in multiple programming languages and frameworks. I've worked on various projects from web applications to mobile apps, always focusing on clean code and best practices.",
      "I approach problems systematically by first understanding requirements, breaking down complex issues into smaller components, researching solutions, and implementing iterative improvements. I also believe in proper testing and documentation.",
      "Recently, I led a project to migrate a legacy system to a modern architecture. It involved coordinating with multiple teams, ensuring zero downtime during migration, and implementing comprehensive testing strategies. The project improved performance by 60%.",
      "I stay updated through technical blogs, attending conferences, participating in coding communities, and working on side projects. I regularly read documentation for technologies I use and experiment with new tools in personal projects."
    ]
  }

  // Build the transcript
  let transcript = `${interviewerName}: Hello! Thank you for taking the time to interview with us today. I'm excited to learn more about your background and experience. Let's start with a brief introduction - could you tell me about yourself?\n\n`
  
  transcript += `${candidateName}: Thank you for having me! I'm a passionate software developer with a strong interest in ${position.toLowerCase()}. I enjoy building robust, scalable applications and staying current with modern development practices. I'm excited about the opportunity to contribute to your team.\n\n`

  // Add technical questions and responses
  for (let i = 0; i < technicalQuestions.length; i++) {
    transcript += `${interviewerName}: ${technicalQuestions[i]}\n\n`
    transcript += `${candidateName}: ${candidateResponses[i]}\n\n`
  }

  // Add behavioral questions
  transcript += `${interviewerName}: That's great technical insight. Now, can you tell me about a time when you had to work under pressure to meet a tight deadline?\n\n`
  transcript += `${candidateName}: Certainly. Last year, we had a critical client deliverable with a very tight deadline due to changing requirements. I coordinated with the team to prioritize features, implemented parallel development workflows, and maintained clear communication with stakeholders. We delivered on time while maintaining code quality.\n\n`

  transcript += `${interviewerName}: How do you handle disagreements with team members about technical decisions?\n\n`
  transcript += `${candidateName}: I believe in open, respectful communication. When disagreements arise, I try to understand different perspectives, present data-driven arguments, and focus on what's best for the project. I'm always open to changing my mind when presented with compelling evidence.\n\n`

  transcript += `${interviewerName}: Excellent. Do you have any questions for me about the role or the company?\n\n`
  transcript += `${candidateName}: Yes, I'd like to know more about the team structure and the technologies you're planning to adopt in the coming year. Also, what are the biggest technical challenges the team is currently facing?\n\n`

  transcript += `${interviewerName}: Great questions! Thank you for your time today. We'll be in touch with next steps soon.\n\n`
  transcript += `${candidateName}: Thank you very much. I'm really excited about this opportunity and look forward to hearing from you!\n\n`

  return transcript
}

/**
 * Use Gemini 2.5 Flash to analyze the mock transcript
 */
async function generateAnalysisWithGemini(session: any, transcript: string): Promise<any> {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 8192
      }
    })

    const prompt = `
You are an expert AI interview analyst. Please analyze this interview transcript and provide a comprehensive evaluation.

INTERVIEW CONTEXT:
- Position: ${session.position}
- Template: ${session.template?.title || 'General Interview'}
- Duration: ${session.duration || 30} minutes

INTERVIEW TRANSCRIPT:
${transcript}

ANALYSIS REQUIREMENTS:
Provide a detailed evaluation focusing on:
1. Technical competency relevant to the position
2. Communication skills and clarity
3. Problem-solving approach
4. Cultural fit and teamwork
5. Experience relevance
6. Overall interview performance

OUTPUT FORMAT:
You MUST respond with ONLY a valid JSON object in the following exact format:

{
  "analysis_score": 85.5,
  "analysis_feedback": "Comprehensive feedback explaining the overall assessment, highlighting key observations about the candidate's performance across all evaluation criteria. This should be 3-4 detailed sentences.",
  "strengths": [
    "Specific strength 1 with concrete examples from the transcript",
    "Specific strength 2 with concrete examples from the transcript",
    "Specific strength 3 with concrete examples from the transcript"
  ],
  "areas_for_improvement": [
    "Specific area 1 with suggestions for improvement",
    "Specific area 2 with suggestions for improvement"
  ],
  "category_scores": {
    "Communication": 88,
    "Technical Knowledge": 82,
    "Problem Solving": 90,
    "Cultural Fit": 85,
    "Experience": 87
  },
  "hiring_recommendation": "Strong Hire",
  "key_insights": [
    "Key insight 1 about candidate's potential and fit",
    "Key insight 2 about candidate's potential and fit", 
    "Key insight 3 about candidate's potential and fit"
  ],
  "interview_metrics": {
    "communication_clarity": 87,
    "technical_depth": 83,
    "problem_solving": 89,
    "engagement_level": 92,
    "completeness": 78
  }
}

IMPORTANT:
- Use hiring recommendations: "Strong Hire", "Hire", "Maybe", "No Hire"
- All scores should be between 0-100
- Provide specific, actionable feedback based on the transcript content
- Be fair and objective in your assessment
- Focus on job-relevant criteria
    `.trim()

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Parse the JSON response
    try {
      // Remove markdown code blocks if present
      let cleanResponse = response.trim()
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/\s*```$/, '')
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/```\s*/, '').replace(/\s*```$/, '')
      }
      
      const analysisResult = JSON.parse(cleanResponse)
      console.log('✅ Gemini 2.5 Flash analysis completed successfully')
      return analysisResult
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response as JSON')
      console.error('Raw response:', response)
      console.error('Parse error:', parseError)
      return null
    }

  } catch (error) {
    console.error('❌ Error calling Gemini 2.5 Flash:', error)
    return null
  }
}
