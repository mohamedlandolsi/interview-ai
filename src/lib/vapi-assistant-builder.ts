/**
 * Vapi Assistant Builder Service
 * Builds transient assistant configurations from InterviewTemplate data
 */

// TODO: Ensure this new environment variable is set in all environments.
// In .env.local (for development):
// APP_URL=http://localhost:3000
//
// In Vercel (for production):
// Add an environment variable named APP_URL with the value of your production domain (e.g., https://yourapp.vercel.app).

import { InterviewTemplate, CompanyIntegration } from '@prisma/client';

export interface VapiAssistantConfig {
  name: string;
  model: {
    provider: string;
    model: string;
    temperature: number;
    messages: Array<{
      role: string;
      content: string;
    }>;
  };
  voice: {
    provider: string;
    voiceId: string;
    stability?: number;
    similarityBoost?: number;
    style?: number;
    useSpeakerBoost?: boolean;
  };
  transcriber: {
    provider: string;
    model: string;
    language: string;
  };
  firstMessage?: string;
  endCallMessage: string;
  endCallPhrases: string[];
  maxDurationSeconds: number;
  // Optional advanced plans can be added as needed; keeping payload minimal avoids 400s
  // New server object shape per Vapi API
  server?: {
    url: string;
    headers?: Record<string, string>;
    timeoutSeconds?: number;
  };
  // Updated: use analysisPlan per current Vapi API
  analysisPlan?: {
    summaryPlan?: {
      enabled?: boolean;
      messages: Array<{ role: string; content: string }>;
      timeoutSeconds?: number;
    };
    successEvaluationPlan?: {
      enabled?: boolean;
      messages: Array<{ role: string; content: string }>;
      timeoutSeconds?: number;
      rubric?: string;
    };
    structuredDataPlan?: {
      enabled?: boolean;
      messages: Array<{ role: string; content: string }>;
      schema: any;
      timeoutSeconds?: number;
    };
  };
}

interface BuildAssistantOptions {
  template: InterviewTemplate;
  sessionId: string;
  candidateName: string;
  position: string;
  companyIntegration?: CompanyIntegration | null;
}

/**
 * Build a transient Vapi assistant configuration from an InterviewTemplate
 */
export function buildAssistantFromTemplate(options: BuildAssistantOptions): VapiAssistantConfig {
  const {
    template,
    sessionId,
    candidateName,
    position,
    companyIntegration
  } = options;

  // Define robust default values for voice configuration
  const DEFAULT_VOICE_PROVIDER = '11labs';
  const DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Rachel voice - reliable ElevenLabs voice

  // Extract questions from template
  const questions = extractQuestionsFromTemplate(template);
  
  // Build system prompt from template instruction and questions
  const systemPrompt = buildSystemPrompt(template, position, questions);

  // Configure voice settings with robust fallbacks
  const voiceConfig = buildVoiceConfig(companyIntegration, DEFAULT_VOICE_PROVIDER, DEFAULT_VOICE_ID);

  // Configure model settings
  const modelConfig = buildModelConfig(systemPrompt);

  // PRODUCTION-READY: Get comprehensive Vapi analysis configuration
  const vapiAnalysisConfig = getVapiAnalysisConfig(candidateName, position, questions);

  // PART 3: WEBHOOK URL CONFIGURATION (OPTIONAL FOR BASIC TESTING)
  let webhookUrl: string | null = null;
  let shouldIncludeWebhook = true;

  // For local development, use a tunnel service like ngrok.
  // 1. Run `ngrok http 3000` in a separate terminal.
  // 2. Copy the HTTPS forwarding URL.
  // 3. Set VAPI_WEBHOOK_TUNNEL_URL in your .env.local file to that URL.
  if (process.env.NODE_ENV === 'development' && process.env.VAPI_WEBHOOK_TUNNEL_URL) {
    webhookUrl = `${process.env.VAPI_WEBHOOK_TUNNEL_URL}/api/vapi/webhook?sessionId=${sessionId}`;
    console.log('🔗 Using tunnel URL for local development:', webhookUrl);
  } else if (process.env.NODE_ENV === 'development') {
    // Development without tunnel - skip webhook for basic testing
    console.warn('⚠️  Development Mode: No tunnel configured. Skipping webhook for basic call testing.');
    console.warn('💡 For full functionality: Set VAPI_WEBHOOK_TUNNEL_URL in .env.local using ngrok.');
    shouldIncludeWebhook = false;
  } else {
    // Production environment
    const appBaseUrl = process.env.APP_URL;
    if (!appBaseUrl) {
      throw new Error(
        "APP_URL environment variable is required for production. " +
        "Set it to your full production domain (e.g., https://your-app.vercel.app) in your deployment environment."
      );
    }
    if (appBaseUrl.includes('localhost')) {
      console.warn('⚠️  Production Warning: APP_URL contains localhost. This will not work in production.');
    }
    webhookUrl = `${appBaseUrl}/api/vapi/webhook?sessionId=${sessionId}`;
    console.log('🌐 Using production webhook URL:', webhookUrl);
  }

  const config: VapiAssistantConfig = {
    name: `Interview: ${candidateName} - ${position}`.substring(0, 40),
    model: modelConfig,
    voice: voiceConfig,
    transcriber: {
      provider: "deepgram",
      model: "nova-2",
      language: companyIntegration?.vapiLanguage || "en-US"
    },
    firstMessage: buildFirstMessage(candidateName, position, template),
    endCallMessage: "Thank you for your time today. We'll be in touch with next steps soon. Have a great day!",
    endCallPhrases: ["goodbye", "end interview", "that concludes our interview", "thank you for your time"],
    maxDurationSeconds: (template.duration || 30) * 60, // Convert minutes to seconds
  };

  // Only include webhook/server and analysis if webhook is available
  if (shouldIncludeWebhook && webhookUrl) {
    config.server = {
      url: webhookUrl
    };
    
    // Updated analysis using analysisPlan structure
    config.analysisPlan = {
      summaryPlan: {
        enabled: true,
        messages: [{ role: 'system', content: vapiAnalysisConfig.summaryPrompt }],
        timeoutSeconds: 30
      },
      successEvaluationPlan: {
        enabled: true,
        messages: [{ role: 'system', content: vapiAnalysisConfig.successEvaluationPrompt }],
        timeoutSeconds: 30,
        rubric: 'NumericScale'
      },
      structuredDataPlan: {
        enabled: true,
        messages: [{ role: 'system', content: vapiAnalysisConfig.structuredDataPrompt }],
        schema: vapiAnalysisConfig.structuredDataSchema,
        timeoutSeconds: 30
      }
    };
    console.log('✅ Including webhook and analysis in assistant config');
  } else {
    console.log('⚠️  Basic mode: Webhook and analysis disabled for testing');
  }

  // PRODUCTION-READY: Final validation before returning config
  const validation = validateAssistantConfig(config);
  if (!validation.isValid) {
    console.error('❌ Assistant configuration failed validation:', validation.errors);
    throw new Error(`Invalid assistant configuration: ${validation.errors.join(', ')}`);
  }

  console.log('✅ Assistant configuration validated successfully');
  return config;
}

/**
 * PART 2: Create shortened analysis prompts under 1000 characters
 * These concise prompts are optimized for Vapi's analysis system
 */
function buildAnalysisSchema(candidateName: string, position: string, questions: string[]) {
  // Aggressively shortened summary prompt (under 1000 chars)
  const summaryPrompt = `
Analyze this interview transcript. Create a JSON array of question-answer pairs.
For each pair include: "question" (string), "answer" (string), "score" (number 1-10), "evaluation" (brief assessment).
Format: [{"question": "...", "answer": "...", "score": 8, "evaluation": "..."}]
Focus on key questions and responses. Be concise.
`.trim();

  // Shortened success evaluation prompt
  const successEvaluationPrompt = `
Evaluate interview for ${position}. Rate: Communication (25%), Technical Skills (30%), Experience (25%), Cultural Fit (20%).
Score each 0-100. Provide hiring recommendation (hire/no hire) with brief reasoning.
Format: {"overall": 85, "communication": 90, "technical": 80, "experience": 85, "fit": 90, "recommendation": "hire", "reason": "..."}
`.trim();

  // Shortened structured data prompt  
  const structuredDataPrompt = `
Extract structured interview data. Include overall score (0-100), category scores, and key strengths/weaknesses.
Be objective and data-focused.
`.trim();

  // Debug: Log the actual prompt lengths
  console.log(`📏 Prompt lengths - Summary: ${summaryPrompt.length}, Success: ${successEvaluationPrompt.length}, Structured: ${structuredDataPrompt.length}`);
  
  const structuredDataSchema = {
    type: "object",
    properties: {
      overallScore: { type: "number", minimum: 0, maximum: 100 },
      communication: { type: "number", minimum: 0, maximum: 100 },
      technical: { type: "number", minimum: 0, maximum: 100 },
      experience: { type: "number", minimum: 0, maximum: 100 },
      culturalFit: { type: "number", minimum: 0, maximum: 100 },
      recommendation: { type: "string", enum: ["hire", "no-hire", "maybe"] },
      strengths: { type: "array", items: { type: "string" } },
      weaknesses: { type: "array", items: { type: "string" } }
    },
    required: ["overallScore", "recommendation"]
  };

  return {
    summaryPrompt,
    successEvaluationPrompt,
    structuredDataPrompt,
    structuredDataSchema
  };
}

/**
 * Extract Vapi analysis configuration with shortened prompts
 * PRODUCTION-READY: Uses concise prompts that comply with Vapi limits
 */
function getVapiAnalysisConfig(candidateName: string, position: string, questions: string[]) {
  // Use the new shortened analysis schema instead of the verbose one
  return buildAnalysisSchema(candidateName, position, questions);
}

/**
 * Extract questions from template in various formats
 */
function extractQuestionsFromTemplate(template: InterviewTemplate): string[] {
  const questions: string[] = [];

  // Try rawQuestions first (new format)
  if (template.rawQuestions && Array.isArray(template.rawQuestions)) {
    for (const q of template.rawQuestions) {
      if (typeof q === 'string') {
        questions.push(q);
      } else if (typeof q === 'object' && q !== null && !Array.isArray(q)) {
        // Extract question text from various possible fields
        const qObj = q as Record<string, any>;
        const questionText = qObj.title || qObj.question || qObj.text || qObj.content;
        if (questionText && typeof questionText === 'string') {
          questions.push(questionText);
        }
      }
    }
  }
  
  // Fallback to questions field (legacy format)
  if (questions.length === 0 && template.questions && Array.isArray(template.questions)) {
    for (const q of template.questions) {
      if (typeof q === 'string') {
        questions.push(q);
      } else if (typeof q === 'object' && q !== null && !Array.isArray(q)) {
        const qObj = q as Record<string, any>;
        const questionText = qObj.title || qObj.question || qObj.text || qObj.content;
        if (questionText && typeof questionText === 'string') {
          questions.push(questionText);
        }
      }
    }
  }

  return questions;
}

/**
 * Build the system prompt for the assistant
 */
function buildSystemPrompt(
  template: InterviewTemplate,
  position: string,
  questions: string[]
): string {
  const questionsList = questions.length > 0 
    ? questions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    : 'Ask relevant questions for the position based on best practices';

  let systemPrompt = `You are an expert AI interviewer conducting a professional job interview for the position: ${position}.

**Your Role:**
- Conduct a structured yet conversational interview
- Ask insightful follow-up questions
- Maintain a professional but friendly tone
- Keep the candidate engaged and comfortable
- Gather comprehensive information about their qualifications

**IMPORTANT CONVERSATION FLOW:**
1. Start with a warm greeting and position overview
2. When the candidate confirms readiness, begin the substantive interview
3. DO NOT end the call when they say they're ready - this means START the interview
4. Continue asking questions until you have covered all important areas
5. Only end when you have completed a thorough interview

**Template: ${template.title}**
${template.description ? `**Description:** ${template.description}` : ''}
${template.category ? `**Category:** ${template.category}` : ''}
${template.difficulty ? `**Difficulty:** ${template.difficulty}` : ''}`;

  // Add custom instructions from template
  if (template.instruction) {
    systemPrompt += `\n\n**SPECIFIC INSTRUCTIONS:**\n${template.instruction}`;
  }

  // Add questions to cover
  systemPrompt += `\n\n**QUESTIONS TO COVER:**\n${questionsList}

**Guidelines:**
- Listen actively and ask relevant follow-ups
- Keep responses concise but thorough
- Maintain professional interview pace
- Be encouraging and supportive
- Take detailed notes mentally for analysis
- Adapt questions based on candidate responses
- NEVER end the call prematurely - conduct a full interview

**Important:** This interview will be analyzed for communication effectiveness, technical competency, cultural fit, and overall candidate suitability.

Remember: When the candidate says they're ready, that's your cue to START the interview, not end it!`;

  return systemPrompt;
}

/**
 * Build voice configuration from company integration or defaults
 * PRODUCTION-READY: Enforces strict validation to prevent 400 Bad Request errors
 */
function buildVoiceConfig(
  companyIntegration?: CompanyIntegration | null,
  defaultProvider: string = '11labs',
  defaultVoiceId: string = 'pNInz6obpgDQGcFmaJgB'
) {
  // STRICT VALIDATION: Only use company settings if BOTH provider AND voiceId are valid, non-empty strings
  const hasValidProvider = companyIntegration?.vapiVoiceProvider && 
                          typeof companyIntegration.vapiVoiceProvider === 'string' && 
                          companyIntegration.vapiVoiceProvider.trim().length > 0;
  
  const hasValidVoiceId = companyIntegration?.vapiVoiceId && 
                         typeof companyIntegration.vapiVoiceId === 'string' && 
                         companyIntegration.vapiVoiceId.trim().length > 0;

  // Use company settings ONLY if BOTH fields are valid
  // If either field is missing or invalid, fall back to defaults for BOTH
  let provider: string;
  let voiceId: string;

  if (hasValidProvider && hasValidVoiceId) {
    provider = companyIntegration!.vapiVoiceProvider!.trim();
    voiceId = companyIntegration!.vapiVoiceId!.trim();
    console.log(`✓ Using company voice config: ${provider}/${voiceId}`);
  } else {
    provider = defaultProvider;
    voiceId = defaultVoiceId;
    console.log(`✓ Using fallback voice config: ${provider}/${voiceId} (company config invalid or missing)`);
  }

  return {
    provider: provider,
    voiceId: voiceId,
    stability: 0.6,
    similarityBoost: 0.9,
    style: 0.2,
    useSpeakerBoost: true
  };
}

/**
 * Build model configuration
 * PRODUCTION-READY: Uses gpt-4o-mini for optimal real-time performance
 */
function buildModelConfig(systemPrompt: string) {
  return {
    provider: "openai",
    model: "gpt-4o-mini", // Fast, cost-effective model optimized for real-time conversations
    temperature: 0.1, // Low temperature for consistent, professional responses
    messages: [
      {
        role: "system",
        content: systemPrompt
      }
    ]
  };
}

/**
 * Build the first message for the assistant
 */
function buildFirstMessage(candidateName: string, position: string, template: InterviewTemplate): string {
  return `Hello ${candidateName}! Welcome to your interview for the ${position} position. I'm your AI interviewer today.

I'll be conducting a ${template.category || 'professional'} interview that should take about ${template.duration || 30} minutes. I'll ask you questions to learn more about your background and experience.

Are you ready to begin?`;
}

/**
 * Validate that the assistant configuration is valid before sending to Vapi API
 * PRODUCTION-READY: Comprehensive validation to prevent all API errors
 */
export function validateAssistantConfig(config: VapiAssistantConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Name validation
  if (!config.name || typeof config.name !== 'string' || config.name.trim().length === 0) {
    errors.push('Assistant name is required and must be a non-empty string');
  } else if (config.name.length > 40) {
    errors.push('Assistant name must be 40 characters or less');
  }

  // Model validation
  if (!config.model?.provider || typeof config.model.provider !== 'string') {
    errors.push('Model provider is required and must be a string');
  }
  
  if (!config.model?.model || typeof config.model.model !== 'string') {
    errors.push('Model name is required and must be a string');
  }

  // Validate supported OpenAI models
  if (config.model?.provider === 'openai' && config.model?.model) {
    const supportedModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-4', 'gpt-3.5-turbo'];
    if (!supportedModels.includes(config.model.model)) {
      errors.push(`Unsupported OpenAI model: ${config.model.model}. Supported: ${supportedModels.join(', ')}`);
    }
  }

  // CRITICAL: Voice configuration validation (the most common source of 400 errors)
  if (!config.voice?.provider || typeof config.voice.provider !== 'string' || config.voice.provider.trim().length === 0) {
    errors.push('Voice provider is required and must be a non-empty string');
  }
  
  if (!config.voice?.voiceId || typeof config.voice.voiceId !== 'string' || config.voice.voiceId.trim().length === 0) {
    errors.push('Voice ID is required and must be a non-empty string');
  }

  // Validate supported voice providers (exact match against Vapi's accepted values)
  if (config.voice?.provider) {
    const supportedVoiceProviders = ['11labs', 'azure', 'playht', 'rime', 'neets', 'openai'];
    const normalizedProvider = config.voice.provider.toLowerCase().trim();
    if (!supportedVoiceProviders.includes(normalizedProvider)) {
      errors.push(`Unsupported voice provider: "${config.voice.provider}". Must be one of: ${supportedVoiceProviders.join(', ')}`);
    }
  }

  // Validate 11labs voice ID format (most commonly used provider)
  if (config.voice?.provider === '11labs' && config.voice?.voiceId) {
    if (config.voice.voiceId.length !== 20) {
      errors.push(`Invalid 11labs voice ID format: "${config.voice.voiceId}". Must be exactly 20 characters.`);
    }
    // Additional 11labs validation - should be alphanumeric
    if (!/^[a-zA-Z0-9]{20}$/.test(config.voice.voiceId)) {
      errors.push(`Invalid 11labs voice ID: "${config.voice.voiceId}". Must contain only letters and numbers.`);
    }
  }

  // Transcriber validation
  if (!config.transcriber?.provider || typeof config.transcriber.provider !== 'string') {
    errors.push('Transcriber provider is required and must be a string');
  }

  if (!config.transcriber?.model || typeof config.transcriber.model !== 'string') {
    errors.push('Transcriber model is required and must be a string');
  }

  // Validate supported transcriber providers
  if (config.transcriber?.provider) {
    const supportedTranscriberProviders = ['deepgram', 'assembly', 'azure'];
    const normalizedProvider = config.transcriber.provider.toLowerCase().trim();
    if (!supportedTranscriberProviders.includes(normalizedProvider)) {
      errors.push(`Unsupported transcriber provider: "${config.transcriber.provider}". Must be one of: ${supportedTranscriberProviders.join(', ')}`);
    }
  }

  // Validate Deepgram models (most commonly used)
  if (config.transcriber?.provider === 'deepgram' && config.transcriber?.model) {
    const supportedDeepgramModels = ['nova-2', 'nova', 'enhanced', 'base'];
    if (!supportedDeepgramModels.includes(config.transcriber.model)) {
      errors.push(`Unsupported Deepgram model: "${config.transcriber.model}". Must be one of: ${supportedDeepgramModels.join(', ')}`);
    }
  }

  // Webhook server object validation (OPTIONAL for basic testing)
  if (config.server) {
    if (typeof config.server.url !== 'string' || config.server.url.trim().length === 0) {
      errors.push('Server.url for webhooks must be a non-empty string when server is provided');
    } else if (!config.server.url.startsWith('http://') && !config.server.url.startsWith('https://')) {
      errors.push(`Invalid webhook URL format: ${config.server.url}. Must start with http:// or https://`);
    } else if (config.server.url.includes('localhost') && !config.server.url.startsWith('https://')) {
      // For development, warn but don't fail validation
      console.warn(`⚠️  Development Warning: Localhost webhook URL should use HTTPS tunnel (ngrok) for actual Vapi testing. Current: ${config.server.url}`);
      console.warn(`⚠️  To test with Vapi: 1) Run 'ngrok http 3000', 2) Set VAPI_WEBHOOK_TUNNEL_URL in .env.local`);
    }
  } else {
    console.warn('⚠️  No webhook URL configured - running in basic mode without real-time analysis');
  }

  // AnalysisPlan configuration validation (updated)
  if (config.analysisPlan) {
    const sp = config.analysisPlan.summaryPlan;
    const ep = config.analysisPlan.successEvaluationPlan;
    const dp = config.analysisPlan.structuredDataPlan;

    const getFirstContent = (messages?: Array<{ role: string; content: string }>) => messages && messages[0]?.content;

    const summaryText = getFirstContent(sp?.messages);
    const successText = getFirstContent(ep?.messages);
    const dataText = getFirstContent(dp?.messages);

    if (summaryText && summaryText.length > 1000) {
      errors.push(`Summary prompt too long: ${summaryText.length} chars (max 1000)`);
    }
    if (successText && successText.length > 1000) {
      errors.push(`Success evaluation prompt too long: ${successText.length} chars (max 1000)`);
    }
    if (dataText && dataText.length > 1000) {
      errors.push(`Structured data prompt too long: ${dataText.length} chars (max 1000)`);
    }
  }

  // Duration validation
  if (config.maxDurationSeconds && (typeof config.maxDurationSeconds !== 'number' || config.maxDurationSeconds <= 0)) {
    errors.push('Max duration must be a positive number');
  } else if (config.maxDurationSeconds && config.maxDurationSeconds > 7200) {
    errors.push('Max duration cannot exceed 2 hours (7200 seconds)');
  }

  // Validate messages array in model config
  if (!config.model?.messages || !Array.isArray(config.model.messages) || config.model.messages.length === 0) {
    errors.push('Model messages array is required and must contain at least one message');
  } else {
    // Validate each message in the array
    config.model.messages.forEach((message, index) => {
      if (!message.role || typeof message.role !== 'string') {
        errors.push(`Message ${index}: role is required and must be a string`);
      }
      if (!message.content || typeof message.content !== 'string' || message.content.trim().length === 0) {
        errors.push(`Message ${index}: content is required and must be a non-empty string`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
