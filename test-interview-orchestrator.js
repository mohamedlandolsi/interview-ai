/**
 * Test script for InterviewOrchestrator functionality
 * Run with: node test-interview-orchestrator.js
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testOrchestrator() {
  console.log('🧪 Testing Interview Orchestrator...')

  try {
    // Test 1: Check if we can find an existing template
    console.log('\n📋 Test 1: Finding interview templates...')
    const templates = await prisma.interviewTemplate.findMany({
      take: 3,
      select: {
        id: true,
        title: true,
        questions: true,
        duration: true,
        category: true
      }
    })
    
    console.log(`Found ${templates.length} templates:`)
    templates.forEach((template, index) => {
      console.log(`  ${index + 1}. ${template.title} (${template.category}, ${template.duration}min)`)
      
      // Try to parse questions
      try {
        const questions = Array.isArray(template.questions) 
          ? template.questions 
          : (template.questions?.questions || [])
        console.log(`     Questions: ${questions.length} found`)
        if (questions.length > 0) {
          console.log(`     First question: ${questions[0]?.text || questions[0] || 'Unknown format'}`)
        }
      } catch (error) {
        console.log(`     Questions: Error parsing - ${error.message}`)
      }
    })

    // Test 2: Check for recent interview sessions
    console.log('\n📊 Test 2: Finding recent interview sessions...')
    const sessions = await prisma.interviewSession.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      select: {
        id: true,
        candidate_name: true,
        position: true,
        status: true,
        current_question_index: true,
        vapi_call_id: true,
        started_at: true,
        template: {
          select: {
            title: true,
            duration: true
          }
        }
      }
    })

    console.log(`Found ${sessions.length} recent sessions:`)
    sessions.forEach((session, index) => {
      console.log(`  ${index + 1}. ${session.candidate_name} - ${session.position}`)
      console.log(`     Status: ${session.status}, Question Index: ${session.current_question_index}`)
      console.log(`     Template: ${session.template.title} (${session.template.duration}min)`)
      console.log(`     Call ID: ${session.vapi_call_id || 'None'}`)
    })

    // Test 3: Create a test session for orchestrator testing
    console.log('\n🎯 Test 3: Creating test session...')
    
    if (templates.length > 0) {
      const testTemplate = templates[0]
      
      // Find a profile to use as interviewer
      const profiles = await prisma.profile.findMany({ take: 1 })
      
      if (profiles.length > 0) {
        const testSession = await prisma.interviewSession.create({
          data: {
            candidate_name: 'Test Candidate',
            candidate_email: 'test@example.com',
            position: 'Software Engineer',
            template_id: testTemplate.id,
            interviewer_id: profiles[0].id,
            status: 'scheduled',
            vapi_call_id: 'test-call-' + Date.now(),
            current_question_index: 0
          }
        })
        
        console.log(`✅ Created test session: ${testSession.id}`)
        console.log(`   Call ID: ${testSession.vapi_call_id}`)
        console.log(`   Template: ${testTemplate.title}`)
        
        // Clean up - delete the test session
        await prisma.interviewSession.delete({
          where: { id: testSession.id }
        })
        console.log(`🧹 Cleaned up test session`)
      } else {
        console.log('❌ No profiles found - cannot create test session')
      }
    } else {
      console.log('❌ No templates found - cannot create test session')
    }

    console.log('\n✅ Interview Orchestrator tests completed!')

  } catch (error) {
    console.error('❌ Error in orchestrator tests:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testOrchestrator()
