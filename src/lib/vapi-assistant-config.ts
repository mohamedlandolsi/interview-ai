/**
 * Vapi Assistant Configuration for AI-Powered Interview Analysis
 * This module provides enhanced configuration for Vapi assistants with
 * comprehensive analysis features including Q&A summaries, success evaluation,
 * and structured data extraction for detailed interview scoring and feedback.
 */

interface VapiAnalysisConfig {
  summary: {
    enabled: boolean;
    prompt: string;
  };
  successEvaluation: {
    enabled: boolean;
    prompt: string;
  };
  structuredData: {
    enabled: boolean;
    schema: any;
    prompt: string;
  };
}

// Enhanced assistant configuration with comprehensive analysis
export const createInterviewAssistantConfig = (
  candidateName: string,
  position: string,
  templateQuestions: string[],
  templateInstructions?: string
) => {const analysisConfig: VapiAnalysisConfig = {
    summary: {
      enabled: true,
      prompt: `You are an expert interview analyst. Create a comprehensive Q&A summary of the job interview conversation.

Extract and format the interview into clear question-answer pairs. For each interaction:

1. **Question**: Extract the exact question asked by the interviewer
2. **Answer**: Capture the candidate's complete response
3. **Score**: Rate the response quality (1-10 scale) based on:
   - Relevance and completeness
   - Technical accuracy (if applicable)
   - Communication clarity
   - Specific examples provided
4. **Key Points**: List 2-3 main points from the candidate's response
5. **Evaluation**: Brief assessment of response quality

Format as JSON:
{
  "questions": [
    {
      "question": "Tell me about your experience with React",
      "answer": "I have been working with React for over 3 years...",
      "score": 8,
      "keyPoints": ["3+ years React experience", "Built scalable applications", "Hooks expertise"],
      "evaluation": "Strong technical background with specific examples"
    }
  ],
  "overallFlow": "Assessment of interview engagement and communication flow",
  "totalQuestions": 5,
  "averageScore": 7.2
}

Focus on accuracy and include ALL questions asked during the interview.`
    },

    successEvaluation: {
      enabled: true,
      prompt: `You are an expert HR professional evaluating interview success for the position: ${position}.

**EVALUATION CRITERIA:**

**Communication Skills (25%)**
- Clarity of expression and articulation
- Professional language and tone
- Ability to explain complex concepts simply
- Active listening and responsiveness

**Technical Competency (30%)**
- Relevant technical knowledge for the role
- Problem-solving approach and methodology
- Understanding of best practices
- Ability to discuss technical challenges

**Professional Experience (25%)**
- Relevance of background to the position
- Quality and impact of previous work
- Career progression and growth
- Specific achievements and examples

**Cultural Fit (20%)**
- Alignment with company values
- Team collaboration indicators
- Adaptability and learning mindset
- Enthusiasm for the role and company

**EVALUATION PROCESS:**
1. Analyze the candidate's responses across all criteria
2. Assign scores (1-100) for each category
3. Calculate weighted overall score
4. Determine hiring recommendation
5. Provide specific reasoning and examples

**OUTPUT FORMAT:**
- Overall Success: True/False
- Detailed reasoning for the decision
- Specific strengths observed
- Areas needing improvement
- Clear hiring recommendation

Be thorough, objective, and provide actionable feedback.`
    },

    structuredData: {
      enabled: true,
      schema: {
        type: "object",
        properties: {
          overallScore: {
            type: "number",
            description: "Overall interview performance score (0-100)",
            minimum: 0,
            maximum: 100
          },
          categoryScores: {
            type: "object",
            properties: {
              communication: { 
                type: "number", 
                description: "Communication skills score (0-100)",
                minimum: 0,
                maximum: 100
              },
              technical: { 
                type: "number", 
                description: "Technical competency score (0-100)",
                minimum: 0,
                maximum: 100
              },
              experience: { 
                type: "number", 
                description: "Professional experience score (0-100)",
                minimum: 0,
                maximum: 100
              },
              culturalFit: { 
                type: "number", 
                description: "Cultural fit assessment score (0-100)",
                minimum: 0,
                maximum: 100
              }
            },
            required: ["communication", "technical", "experience", "culturalFit"]
          },
          strengths: {
            type: "array",
            items: { type: "string" },
            description: "List of candidate's key strengths identified during interview",
            minItems: 1,
            maxItems: 8
          },
          areasForImprovement: {
            type: "array",
            items: { type: "string" },
            description: "Areas where candidate could improve or develop further",
            minItems: 0,
            maxItems: 6
          },
          keyInsights: {
            type: "array",
            items: { type: "string" },
            description: "Important insights and observations about the candidate",
            minItems: 1,
            maxItems: 5
          },
          hiringRecommendation: {
            type: "string",
            enum: ["Strong Yes", "Yes", "Maybe", "No"],
            description: "Final hiring recommendation based on interview performance"
          },
          reasoning: {
            type: "string",
            description: "Detailed explanation for the hiring recommendation with specific examples"
          },
          confidenceLevel: {
            type: "string",
            enum: ["High", "Medium", "Low"],
            description: "Confidence level in the assessment based on interview quality"
          },
          questionResponses: {
            type: "array",
            items: {
              type: "object",
              properties: {
                question: { type: "string", description: "The interview question asked" },
                responseQuality: { 
                  type: "number", 
                  description: "Quality of response (0-100)",
                  minimum: 0,
                  maximum: 100
                },
                feedback: { type: "string", description: "Specific feedback on the response" },
                keyPoints: {
                  type: "array",
                  items: { type: "string" },
                  description: "Main points mentioned in the response"
                }
              },
              required: ["question", "responseQuality", "feedback"]
            },
            description: "Analysis of individual question responses"
          },
          interviewMetrics: {
            type: "object",
            properties: {
              engagement: { 
                type: "number", 
                description: "Candidate engagement level (0-100)",
                minimum: 0,
                maximum: 100
              },
              clarity: { 
                type: "number", 
                description: "Communication clarity (0-100)",
                minimum: 0,
                maximum: 100
              },
              completeness: { 
                type: "number", 
                description: "Response completeness (0-100)",
                minimum: 0,
                maximum: 100
              }
            }
          }
        },
        required: ["overallScore", "categoryScores", "strengths", "hiringRecommendation", "reasoning"]
      },
      prompt: `Analyze this job interview comprehensively and extract structured performance data.

**CANDIDATE:** ${candidateName}
**POSITION:** ${position}
**ANALYSIS SCOPE:** Complete interview evaluation

**REQUIRED ANALYSIS:**

1. **SCORING (0-100 scale for each):**
   - Overall Performance Score
   - Communication Skills
   - Technical Competency  
   - Professional Experience
   - Cultural Fit

2. **QUALITATIVE ASSESSMENT:**
   - 3-5 Key Strengths (specific examples from interview)
   - 2-4 Areas for Improvement (constructive feedback)
   - 3-5 Key Insights (notable observations)

3. **HIRING DECISION:**
   - Recommendation: Strong Yes/Yes/Maybe/No
   - Detailed reasoning with specific examples
   - Confidence level in assessment

4. **QUESTION-BY-QUESTION ANALYSIS:**
   - Response quality score for each question
   - Specific feedback on answers
   - Key points mentioned by candidate

5. **INTERVIEW METRICS:**
   - Engagement level throughout interview
   - Communication clarity and professionalism
   - Response completeness and depth

**EVALUATION GUIDELINES:**
- Base scores on objective criteria and specific examples
- Provide constructive, actionable feedback
- Consider role requirements and company culture
- Be thorough but concise in explanations
- Ensure consistency between scores and recommendations

Extract comprehensive structured data that enables informed hiring decisions.`
    }
  };
  const questionsList = templateQuestions.length > 0 
    ? templateQuestions.join('\n- ') 
    : 'Ask relevant questions for the position';
    
  const systemContent = `You are an expert AI interviewer conducting a professional job interview for the position: ${position}.

**Your Role:**
- Conduct a structured yet conversational interview
- Ask insightful follow-up questions
- Maintain a professional but friendly tone
- Keep the candidate engaged and comfortable
- Gather comprehensive information about their qualifications

**IMPORTANT CONVERSATION FLOW:**
1. You will start with a greeting asking if they're ready
2. When they confirm they're ready (saying "yes", "ready", "let's start", etc.), immediately begin the interview with the first substantial question
3. DO NOT end the call when they say they're ready - this means START the interview
4. Continue asking questions until you have covered all important areas
5. Only end when you have completed a thorough interview (15-30 minutes)

**Interview Structure:**
1. Start with a warm welcome and brief position overview (DONE in firstMessage)
2. When they confirm readiness, begin with background questions  
3. Ask about their background and experience
4. Cover key competency areas for the role
5. Include behavioral and situational questions
6. Allow time for candidate questions
7. Close professionally with next steps

**Key Questions to Cover:**
${questionsList}

${templateInstructions ? `**Special Instructions:**
${templateInstructions}

` : ''}**Guidelines:**
- Listen actively and ask relevant follow-ups
- Keep responses concise but thorough
- Maintain professional interview pace
- Be encouraging and supportive
- Take detailed notes mentally for analysis
- Adapt questions based on candidate responses
- NEVER end the call prematurely - conduct a full interview

**Important:** This interview will be analyzed for:
- Communication effectiveness
- Technical competency
- Cultural fit
- Professional experience
- Overall candidate suitability

Remember: When the candidate says they're ready, that's your cue to START the interview, not end it!`;

  return {
    name: `Interview Assistant for ${candidateName}`,
    
    // First message to start the conversation
    firstMessage: `Hello ${candidateName}! Welcome to your interview for the ${position} position. I'm your AI interviewer today. 

I'll be asking you some questions to learn more about your background and experience. This should take about 15-30 minutes. 

Are you ready to begin?`,
    
    voice: {
      provider: "11labs" as const,
      // Use a known valid 11labs voice ID (Rachel). Names are not valid here.
      voiceId: "pNInz6obpgDQGcFmaJgB",
      optimizeStreaming: true
    },
    model: {
      provider: "openai" as const,
      // Use a widely supported OpenAI model for realtime assistants
      model: "gpt-4o-mini" as const,
      temperature: 0.1, // Low temperature for consistent, professional responses
      messages: [{
        role: "system" as const,
        content: systemContent
      }]
    },
    
    // Recording and transcription settings
    recordingEnabled: true,
    transcriber: {
      provider: "deepgram" as const,
      model: "nova-2" as const,
      language: "en-US" as const
    },    // Analysis configuration
    analysisSchema: {
      type: "output" as const,
      summaryPrompt: analysisConfig.summary.prompt,
      summaryRequestTimeoutSeconds: 10,
      
      successEvaluationPrompt: analysisConfig.successEvaluation.prompt,
      successEvaluationRequestTimeoutSeconds: 10,
      
      structuredDataPrompt: analysisConfig.structuredData.prompt,
      structuredDataSchema: analysisConfig.structuredData.schema,
      structuredDataRequestTimeoutSeconds: 10,
      
  // Minimum messages to trigger analysis
  // Increase threshold so greeting/ready exchange doesn't trigger wrap-up
  minMessagesToTriggerAnalysis: 6
    },
    
    // End call settings - prevent premature endings
    endCallMessage: "Thank you for your time today. We'll be in touch with next steps soon. Have a great day!",
  endCallPhrases: ["goodbye", "end interview", "that concludes our interview", "thank you for your time"],
  // Disable function-based endings to avoid premature hangups
  endCallFunctionEnabled: false as const,
    
    // Timeouts - be generous to prevent accidental endings
    maxDurationSeconds: 3600, // 1 hour max
  silenceTimeoutSeconds: 60, // Generous timeout to avoid accidental hangups
    responseDelaySeconds: 1.0, // Slight delay for more natural conversation
    
    // Background sound suppression
    backgroundSound: "office" as const,
    backgroundDenoisingEnabled: true,
    llmRequestNonStreamingTimeoutSeconds: 60,
  };
};

// Default interview questions by role category
export const DEFAULT_QUESTIONS_BY_CATEGORY = {
  technical: [
    "Walk me through your technical background and the technologies you're most comfortable with.",
    "Describe a challenging technical problem you've solved recently. What was your approach?",
    "How do you stay current with new technologies and industry trends?",
    "Tell me about a time you had to learn a new technology quickly for a project."
  ],
  
  behavioral: [
    "Tell me about a time you faced a significant challenge at work. How did you handle it?",
    "Describe a situation where you had to work with a difficult team member.",
    "Give me an example of when you had to meet a tight deadline. What was your approach?",
    "Tell me about a project you're particularly proud of and why."
  ],
  
  leadership: [
    "Describe your leadership style and how you motivate team members.",
    "Tell me about a time you had to make a difficult decision with limited information.",
    "How do you handle conflicts within your team?",
    "Give me an example of how you've mentored or developed someone on your team."
  ],
  
  problemSolving: [
    "Walk me through your problem-solving process when facing a complex issue.",
    "Describe a time when you had to think outside the box to solve a problem.",
    "Tell me about a situation where your first solution didn't work. What did you do?",
    "How do you prioritize when you have multiple urgent issues to address?"
  ],
  
  communication: [
    "Describe a time when you had to explain a complex concept to someone without technical background.",
    "Tell me about a presentation you gave that didn't go as planned. What happened and what did you learn?",
    "How do you ensure clear communication when working with remote team members?",
    "Give me an example of when you had to negotiate or persuade someone to see your point of view."
  ]
};

// Utility function to generate questions for specific roles
export const generateQuestionsForRole = (role: string, count: number = 8): string[] => {
  const normalizedRole = role.toLowerCase();
  const questions: string[] = [];
  
  // Always include some behavioral questions
  questions.push(...DEFAULT_QUESTIONS_BY_CATEGORY.behavioral.slice(0, 2));
  
  // Add role-specific questions
  if (normalizedRole.includes('engineer') || normalizedRole.includes('developer') || normalizedRole.includes('technical')) {
    questions.push(...DEFAULT_QUESTIONS_BY_CATEGORY.technical.slice(0, 3));
    questions.push(...DEFAULT_QUESTIONS_BY_CATEGORY.problemSolving.slice(0, 2));
  } else if (normalizedRole.includes('manager') || normalizedRole.includes('lead') || normalizedRole.includes('director')) {
    questions.push(...DEFAULT_QUESTIONS_BY_CATEGORY.leadership.slice(0, 3));
    questions.push(...DEFAULT_QUESTIONS_BY_CATEGORY.communication.slice(0, 2));
  } else if (normalizedRole.includes('sales') || normalizedRole.includes('marketing') || normalizedRole.includes('customer')) {
    questions.push(...DEFAULT_QUESTIONS_BY_CATEGORY.communication.slice(0, 3));
    questions.push(...DEFAULT_QUESTIONS_BY_CATEGORY.problemSolving.slice(0, 1));
  } else {
    // General role questions
    questions.push(...DEFAULT_QUESTIONS_BY_CATEGORY.problemSolving.slice(0, 2));
    questions.push(...DEFAULT_QUESTIONS_BY_CATEGORY.communication.slice(0, 2));
  }
  
  // Return requested number of questions
  return questions.slice(0, count);
};

export default {
  createInterviewAssistantConfig,
  DEFAULT_QUESTIONS_BY_CATEGORY,
  generateQuestionsForRole
};
