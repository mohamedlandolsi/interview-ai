/**
 * Vapi Assistant Builder Service
 * Builds transient assistant configurations from InterviewTemplate data
 */

import { InterviewTemplate, CompanyIntegration } from '@prisma/client';
import { createInterviewAssistantConfig } from './vapi-assistant-config';

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
  recordingEnabled: boolean;
  endCallMessage: string;
  endCallPhrases: string[];
  endCallFunctionEnabled: boolean;
  maxDurationSeconds: number;
  silenceTimeoutSeconds: number;
  responseDelaySeconds: number;
  backgroundDenoisingEnabled: boolean;
  serverUrl?: string;
  serverUrlSecret?: string;
  // PRODUCTION-READY: Vapi Analysis Configuration (new format)
  summaryPrompt?: string;
  successEvaluationPrompt?: string;
  structuredDataPrompt?: string;
  structuredDataSchema?: any;
  llmRequestNonStreamingTimeoutSeconds?: number;
}

interface BuildAssistantOptions {
  template: InterviewTemplate;
  sessionId: string;
  candidateName: string;
  position: string;
  companyIntegration?: CompanyIntegration | null;
  baseUrl?: string;
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
    companyIntegration,
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'
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

  // For development, use the production webhook URL since Vapi needs to reach it
  // In production, this will be the real webhook URL
  let webhookUrl: string;
  if (baseUrl.includes('localhost')) {
    // Use production domain for webhooks even in development since Vapi can't reach localhost
    webhookUrl = `https://interq.vercel.app/api/vapi/webhook?sessionId=${sessionId}`;
  } else {
    webhookUrl = `${baseUrl}/api/vapi/webhook?sessionId=${sessionId}`;
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
    recordingEnabled: true,
    endCallMessage: "Thank you for your time today. We'll be in touch with next steps soon. Have a great day!",
    endCallPhrases: ["goodbye", "end interview", "that concludes our interview", "thank you for your time"],
    endCallFunctionEnabled: false, // Prevent accidental endings
    maxDurationSeconds: (template.duration || 30) * 60, // Convert minutes to seconds
    silenceTimeoutSeconds: 60, // Generous timeout
    responseDelaySeconds: 1.0,
    backgroundDenoisingEnabled: true,
    serverUrl: webhookUrl,
    serverUrlSecret: process.env.VAPI_WEBHOOK_SECRET,
    // PRODUCTION-READY: Enable Vapi's post-call analysis features
    summaryPrompt: vapiAnalysisConfig.summaryPrompt,
    successEvaluationPrompt: vapiAnalysisConfig.successEvaluationPrompt,
    structuredDataPrompt: vapiAnalysisConfig.structuredDataPrompt,
    structuredDataSchema: vapiAnalysisConfig.structuredDataSchema,
    llmRequestNonStreamingTimeoutSeconds: 60
  };

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
 * Extract Vapi analysis configuration from the comprehensive config
 * PRODUCTION-READY: Enables post-call analysis features
 */
function getVapiAnalysisConfig(candidateName: string, position: string, questions: string[]) {
  // Get the comprehensive configuration from vapi-assistant-config.ts
  const fullConfig = createInterviewAssistantConfig(candidateName, position, questions);
  
  // Extract just the analysis configuration parts for the new Vapi format
  return {
    summaryPrompt: fullConfig.analysisSchema?.summaryPrompt || '',
    successEvaluationPrompt: fullConfig.analysisSchema?.successEvaluationPrompt || '',
    structuredDataPrompt: fullConfig.analysisSchema?.structuredDataPrompt || '',
    structuredDataSchema: fullConfig.analysisSchema?.structuredDataSchema || {}
  };
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

  // CRITICAL: Voice configuration validation
  if (!config.voice?.provider || typeof config.voice.provider !== 'string' || config.voice.provider.trim().length === 0) {
    errors.push('Voice provider is required and must be a non-empty string');
  }
  
  if (!config.voice?.voiceId || typeof config.voice.voiceId !== 'string' || config.voice.voiceId.trim().length === 0) {
    errors.push('Voice ID is required and must be a non-empty string');
  }

  // Validate supported voice providers
  if (config.voice?.provider) {
    const supportedVoiceProviders = ['11labs', 'azure', 'playht', 'rime', 'neets'];
    if (!supportedVoiceProviders.includes(config.voice.provider.toLowerCase())) {
      errors.push(`Unsupported voice provider: ${config.voice.provider}. Supported: ${supportedVoiceProviders.join(', ')}`);
    }
  }

  // Validate 11labs voice ID format
  if (config.voice?.provider === '11labs' && config.voice?.voiceId) {
    if (config.voice.voiceId.length !== 20) {
      errors.push(`Invalid 11labs voice ID format: ${config.voice.voiceId}. Should be exactly 20 characters.`);
    }
  }

  // Transcriber validation
  if (!config.transcriber?.provider || typeof config.transcriber.provider !== 'string') {
    errors.push('Transcriber provider is required and must be a string');
  }

  // Validate supported transcriber providers
  if (config.transcriber?.provider) {
    const supportedTranscriberProviders = ['deepgram', 'assembly', 'azure'];
    if (!supportedTranscriberProviders.includes(config.transcriber.provider.toLowerCase())) {
      errors.push(`Unsupported transcriber provider: ${config.transcriber.provider}. Supported: ${supportedTranscriberProviders.join(', ')}`);
    }
  }

  // Webhook URL validation (CRITICAL for Vapi functionality)
  if (!config.serverUrl || typeof config.serverUrl !== 'string' || config.serverUrl.trim().length === 0) {
    errors.push('Server URL for webhooks is required and must be a non-empty string');
  } else if (!config.serverUrl.startsWith('http://') && !config.serverUrl.startsWith('https://')) {
    errors.push(`Invalid webhook URL format: ${config.serverUrl}. Must start with http:// or https://`);
  }

  // Duration and timeout validation
  if (config.maxDurationSeconds && (typeof config.maxDurationSeconds !== 'number' || config.maxDurationSeconds <= 0)) {
    errors.push('Max duration must be a positive number');
  } else if (config.maxDurationSeconds && config.maxDurationSeconds > 7200) {
    errors.push('Max duration cannot exceed 2 hours (7200 seconds)');
  }

  if (config.silenceTimeoutSeconds && (typeof config.silenceTimeoutSeconds !== 'number' || config.silenceTimeoutSeconds <= 0)) {
    errors.push('Silence timeout must be a positive number');
  }

  // Validate required boolean fields
  if (typeof config.recordingEnabled !== 'boolean') {
    errors.push('Recording enabled must be a boolean value');
  }

  if (typeof config.endCallFunctionEnabled !== 'boolean') {
    errors.push('End call function enabled must be a boolean value');
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
