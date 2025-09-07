import { useState, useCallback, useRef, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { createInterviewAssistantConfig, generateQuestionsForRole } from '@/lib/vapi-assistant-config';
import { errorLogger } from '@/lib/error-logger';

// Configuration validation function
function validateAssistantConfig(config: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!config.name || typeof config.name !== 'string') {
    errors.push('Assistant name is required and must be a string');
  } else if (config.name.length > 40) {
    errors.push('Assistant name must be 40 characters or less');
  }
  
  if (!config.model || !config.model.provider) {
    errors.push('Model configuration is required');
  }
  
  if (!config.voice || !config.voice.provider) {
    errors.push('Voice configuration is required');
  }
  
  if (!config.transcriber || !config.transcriber.provider) {
    errors.push('Transcriber configuration is required');
  }
  
  if (config.model?.messages && !Array.isArray(config.model.messages)) {
    errors.push('Model messages must be an array');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export interface CallState {
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
  isActive: boolean;
  duration: number;
  error?: string;
}

export interface UseVapiReturn {
  callState: CallState;
  startCall: (assistantId?: string) => Promise<void>;
  startInterviewCall: (candidateName: string, position: string, templateQuestions?: string[], templateInstruction?: string) => Promise<void>;
  startTransientInterviewCall: (sessionId: string, candidateName: string, position: string) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  isMuted: boolean;
  volume: number;
  setVolume: (volume: number) => void;
}

export const useVapi = (): UseVapiReturn => {
  const vapiRef = useRef<Vapi | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Utility to convert unknown error-like values into a safe string for UI
  const normalizeError = (err: unknown, fallback = 'Unexpected error'): string => {
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message || fallback;
    if (typeof err === 'object') {
      const anyErr: any = err;
      if (typeof anyErr.message === 'string') return anyErr.message;
      if (typeof anyErr.error === 'string') return anyErr.error;
      if (typeof anyErr.msg === 'string') return anyErr.msg;
      if (typeof anyErr.statusCode !== 'undefined') {
        const body = typeof anyErr.body === 'string' ? anyErr.body : '';
        return `Error ${anyErr.statusCode}${body ? `: ${body}` : ''}`;
      }
      try { return JSON.stringify(anyErr); } catch { return fallback; }
    }
    return fallback;
  };

  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    isActive: false,
    duration: 0,
  });

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);// Initialize Vapi instance
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    
    errorLogger.info('Vapi', 'Initializing Vapi instance', {
      publicKeyExists: !!publicKey,
      publicKeyLength: publicKey?.length || 0
    });
    
    if (!publicKey) {
      const errorMsg = 'VAPI public key is not configured';
      errorLogger.error('Vapi', errorMsg);
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: 'VAPI configuration missing'
      }));
      return;
    }

    // Prevent re-initialization if already exists
    if (vapiRef.current) {
      console.log('🔧 Vapi instance already exists, skipping initialization');
      return;
    }

    try {
      vapiRef.current = new Vapi(publicKey);      // Set up event listeners
      vapiRef.current.on('call-start', () => {
        console.log('Call started');
        
        // Note: call-start event doesn't provide call details directly
        // The webhook will handle updating the session with call details
        
        setCallState(prev => ({
          ...prev,
          status: 'connected',
          isActive: true,
          duration: 0,
          error: undefined
        }));
        
        // Start duration timer
        intervalRef.current = setInterval(() => {
          setCallState(prev => ({
            ...prev,
            duration: prev.duration + 1
          }));
        }, 1000);
      });

      vapiRef.current.on('call-end', () => {
        console.log('📞 Call ended - timestamp:', new Date().toISOString());
        console.log('📞 Call duration:', callState.duration, 'seconds');
        
        errorLogger.info('Vapi', 'Call ended', {
          duration: callState.duration,
          timestamp: new Date().toISOString()
        });
        
        setCallState(prev => ({
          ...prev,
          status: 'disconnected',
          isActive: false
        }));
        
        // Clear duration timer
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
  });      vapiRef.current.on('error', (error: any) => {
        errorLogger.error('Vapi', 'Vapi error occurred', {
          error,
          errorType: typeof error,
          errorMessage: error?.message,
          errorCode: error?.code,
          errorData: error?.data,
          errorString: String(error),
          errorKeys: error ? Object.keys(error) : [],
          fullError: JSON.stringify(error, null, 2)
        }, error instanceof Error ? error : new Error(String(error)));
        
        // Extract meaningful error message
        let errorMessage = 'An error occurred during the call';
        
        // Handle specific error types
        if (error) {
          const errorStr = String(error).toLowerCase();
          
          // Check for ejection-specific errors (both string and object format)
          const isEjected = errorStr.includes('meeting ended due to ejection') || 
                           errorStr.includes('ejected') ||
                           (error.type === 'ejected') ||
                           (error.msg && String(error.msg).toLowerCase().includes('meeting has ended'));
          
          if (isEjected) {
            errorMessage = 'The interview session was ended unexpectedly. This may be due to a configuration issue or API key problem. Please check your Vapi settings.';
          } else if (errorStr.includes('authentication') || errorStr.includes('unauthorized')) {
            errorMessage = 'Authentication failed. Please check your Vapi API keys in the settings.';
          } else if (errorStr.includes('quota') || errorStr.includes('limit')) {
            errorMessage = 'API quota exceeded. Please check your Vapi account limits.';
          } else if (errorStr.includes('network') || errorStr.includes('connection')) {
            errorMessage = 'Network connection issue. Please check your internet connection and try again.';
          } else if (typeof error === 'string') {
            errorMessage = error;
          } else if (error.msg) {
            errorMessage = String(error.msg);
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.error) {
            errorMessage = error.error;
          } else if (error.code) {
            errorMessage = `Error code: ${error.code}`;
          } else if (Object.keys(error).length > 0) {
            errorMessage = `Error: ${JSON.stringify(error)}`;
          }
        }
        
        setCallState(prev => ({
          ...prev,
          status: 'error',
          isActive: false,
          error: normalizeError(error, errorMessage)
        }));
        
        // Clear duration timer
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      });      vapiRef.current.on('volume-level', (volume: number) => {
        // Handle volume level updates if needed
        console.log('Volume level:', volume);
      });

      vapiRef.current.on('speech-start', () => {
        console.log('🎤 User started speaking');
      });

      vapiRef.current.on('speech-end', () => {
        console.log('🎤 User stopped speaking');
      });

      vapiRef.current.on('message', (message: any) => {
        const msgType = message?.type
        const role = message?.role
        const content = typeof message?.content === 'string' ? message.content : ''

        // Ignore non-conversational updates
        if (msgType === 'status-update' || msgType === 'conversation-update' || msgType === 'transcript') {
          console.log('🛈 Non-conversational message:', { type: msgType })
          return
        }

        console.log('📨 Message received:', {
          type: msgType,
          role,
          content: content.substring(0, 120) + (content.length > 120 ? '…' : ''),
          timestamp: new Date().toISOString()
        })

        // Log if this might be a readiness confirmation
        const lc = content.toLowerCase()
        if (lc.includes('ready') || (/^yes\b/.test(lc) && lc.length < 20)) {
          console.log('� Readiness intent detected; ensuring interview continues.')
        }
      });

    } catch (error: any) {
      errorLogger.error('Vapi', 'Failed to initialize Vapi', { error }, error);
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to initialize voice assistant'
      }));
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (vapiRef.current) {
        vapiRef.current.stop();
      }
    };
  }, []);

  const startCall = useCallback(async (assistantId?: string) => {
    if (!vapiRef.current) {
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: 'Voice assistant not initialized'
      }));
      return;
    }

    const assistantToUse = assistantId || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    
    if (!assistantToUse) {
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: 'No assistant ID provided'
      }));
      return;
    }

    try {
      setCallState(prev => ({
        ...prev,
        status: 'connecting',
        error: undefined
      }));
      
      try {
        await vapiRef.current.start(assistantToUse);
      } catch (vapiError: any) {
        // Handle Vapi-specific errors which might be objects
        let vapiErrorMessage = 'Failed to start Vapi call';
        if (vapiError && typeof vapiError === 'object') {
          if (vapiError.message) {
            vapiErrorMessage = vapiError.message;
          } else if (vapiError.error) {
            vapiErrorMessage = vapiError.error;
          } else if (vapiError.statusCode && vapiError.body) {
            vapiErrorMessage = `Error ${vapiError.statusCode}: ${vapiError.body}`;
          } else {
            vapiErrorMessage = JSON.stringify(vapiError);
          }
        } else if (typeof vapiError === 'string') {
          vapiErrorMessage = vapiError;
        }
        
        console.error('Vapi call start failed:', vapiErrorMessage, vapiError);
        throw new Error(vapiErrorMessage);
      }
    } catch (error: any) {
      const msg = normalizeError(error, 'Failed to start interview call');
      console.error('Failed to start call:', msg, error);
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: msg
      }));
    }
  }, [volume]);

  const startInterviewCall = useCallback(async (
    candidateName: string,
    position: string,
    templateQuestions?: string[],
    templateInstruction?: string
  ) => {
    console.log('🚀 Starting interview call with params:', { candidateName, position, templateQuestions: templateQuestions?.length || 0 });
    
    if (!vapiRef.current) {
      console.error('Vapi not initialized');
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: 'Voice assistant not initialized'
      }));
      return;
    }

    // Check if Vapi API key is configured
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    if (!publicKey || publicKey.length < 10) {
      console.error('Vapi API key not configured or invalid');
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: 'Vapi API key is not configured. Please set up your Vapi integration in Settings.'
      }));
      return;
    }

    // Validate inputs
    if (!candidateName?.trim()) {
      console.error('Candidate name is required');
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: 'Candidate name is required'
      }));
      return;
    }

    if (!position?.trim()) {
      console.error('Position is required');
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: 'Position is required'
      }));
      return;
    }

    try {
      setCallState(prev => ({
        ...prev,
        status: 'connecting',
        error: undefined
      }));

      // First, create a database session for this interview
      let sessionId: string | null = null;
      try {
        const sessionResponse = await fetch('/api/interviews/sessions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },          body: JSON.stringify({
            candidateName,
            candidateEmail: 'candidate@example.com', // TODO: Get from form
            position,
            // templateId and interviewerId will use defaults from session API
            // No vapiCallId yet - will be updated when call starts
          })
        });        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          sessionId = sessionData.session.id;
          sessionIdRef.current = sessionId; // Store for later use
          console.log('Created interview session:', sessionId);
        } else {
          console.warn('Failed to create interview session, proceeding with call only');
        }
      } catch (sessionError) {
        console.warn('Failed to create session:', sessionError);
        // Continue with call even if session creation fails
      }      // Determine whether to use dynamic configuration or static assistant
      const hasTemplateData = (templateQuestions && templateQuestions.length > 0) || templateInstruction;
      const configuredAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      
      if (hasTemplateData) {
        // Use dynamic configuration when template data is available to ensure 
        // instructions and questions are properly incorporated
        console.log('🎯 Template data detected - using dynamic assistant configuration');
        console.log('📋 Template questions:', templateQuestions?.length || 0);
        console.log('📝 Template instructions:', !!templateInstruction);
        
        const questions = templateQuestions && templateQuestions.length > 0 
          ? templateQuestions 
          : generateQuestionsForRole(position);

        // Build system prompt with template instructions and questions
        let systemPrompt = `You are a professional AI interviewer for the position: ${position}.`;
        
        if (templateInstruction) {
          systemPrompt += `\n\n**INTERVIEW INSTRUCTIONS:**\n${templateInstruction}`;
        }
        
        systemPrompt += `\n\n**IMPORTANT: Ask these specific questions during the interview:**
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

**Guidelines:**
- Start with a warm greeting and introduction
- Follow the instructions provided above
- Ask the questions listed above in order, but keep the conversation natural
- Ask relevant follow-up questions based on responses
- Be professional, engaging, and encouraging
- Allow the candidate to ask questions at the end
- Conclude professionally

Begin the interview now with a greeting.`;

        // Create dynamic assistant config with template data
        const assistantConfig = {
          name: candidateName.length > 30 ? "Interview Assistant" : `Interview - ${candidateName.split(' ')[0]}`,
          transcriber: {
            provider: "deepgram" as const,
            model: "nova-2" as const,
            language: "en-US" as const
          },
          voice: {
            provider: "11labs" as const,
            voiceId: "pNInz6obpgDQGcFmaJgB",
            stability: 0.6,
            similarityBoost: 0.9,
            style: 0.2,
            useSpeakerBoost: true
          },
          model: {
            provider: "openai" as const,
            // Use a realtime-capable, widely supported model
            model: "gpt-4o-mini" as const,
            temperature: 0.1,
            messages: [{
              role: "system" as const,
              content: systemPrompt
            }]
          },
          firstMessage: `Hello! I'm your AI interviewer today. I'm excited to learn more about your background and experience for the ${position} position. Let's begin - could you please introduce yourself and tell me what interests you most about this role?`,
          // Add additional fields that might be required
          endCallMessage: "Thank you for your time today. The interview has been completed successfully.",
          endCallPhrases: ["goodbye", "end interview", "finish interview", "conclude interview"],
          maxDurationSeconds: 3600, // 1 hour max
          silenceTimeoutSeconds: 45, // Increased to prevent premature timeout
          responseDelaySeconds: 1.0, // Natural conversation pace
          backgroundDenoisingEnabled: true,
          // Prevent accidental call endings
          endCallFunctionEnabled: false, // Disable function-based ending to prevent accidental triggers
        };

        console.log('🔧 Using dynamic assistant config with template data');
        console.log('📋 System prompt preview:', systemPrompt.substring(0, 200) + '...');
        
        // Validate configuration before sending to Vapi
        const validation = validateAssistantConfig(assistantConfig);
        if (!validation.isValid) {
          console.error('❌ Invalid assistant configuration:', validation.errors);
          throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
        }
        
        console.log('✅ Dynamic configuration validation passed');
        await vapiRef.current.start(assistantConfig);
        return;
        
      } else if (configuredAssistantId) {
        // Use static assistant when no template data is available
        console.log('🎯 No template data - using pre-configured assistant:', configuredAssistantId);
        console.log('🎙️ Starting Vapi call with configured assistant...')
        try {
          await vapiRef.current.start(configuredAssistantId);
          return;
        } catch (assistantError) {
          console.warn('❌ Failed to start with configured assistant:', assistantError);
          console.warn('🔄 Falling back to basic config...');
        }
      } else {
        console.warn('⚠️ No configured assistant ID found in environment variables');
        console.warn('🔄 Using basic config fallback...');
      }      // Final fallback: Basic assistant configuration
      const questions = templateQuestions && templateQuestions.length > 0 
        ? templateQuestions 
        : generateQuestionsForRole(position);

      console.log('🔄 Using final fallback configuration');
      console.log('🎯 Template questions for fallback:', templateQuestions);
      console.log('🎯 Final questions to use:', questions);

      // Build system prompt for fallback
      let fallbackSystemPrompt = `You are a professional AI interviewer for the position: ${position}.`;
      
      if (templateInstruction) {
        fallbackSystemPrompt += `\n\n**INTERVIEW INSTRUCTIONS:**\n${templateInstruction}`;
      }
      
      fallbackSystemPrompt += `\n\n**IMPORTANT: Ask these specific questions during the interview:**
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

**Guidelines:**
- Start with a warm greeting and introduction
- Follow any instructions provided above
- Ask the questions listed above in order, but keep the conversation natural
- Ask relevant follow-up questions based on responses
- Be professional, engaging, and encouraging
- Allow the candidate to ask questions at the end
- Conclude professionally

Begin the interview now with a greeting.`;

      // Create a simple assistant config as fallback
      const assistantConfig = {
        name: candidateName.length > 30 ? "Interview Assistant" : `Interview - ${candidateName.split(' ')[0]}`,
        transcriber: {
          provider: "deepgram" as const,
          model: "nova-2" as const,
          language: "en-US" as const
        },
        voice: {
          provider: "11labs" as const,
          voiceId: "pNInz6obpgDQGcFmaJgB",
          stability: 0.6,
          similarityBoost: 0.9,
          style: 0.2,
          useSpeakerBoost: true
        },
        model: {
          provider: "openai" as const,
          model: "gpt-4o-mini" as const,
          temperature: 0.1,
          messages: [{
            role: "system" as const,
            content: fallbackSystemPrompt
          }]
        },
        firstMessage: `Hello! I'm your AI interviewer today. I'm excited to learn more about your background and experience for the ${position} position. Let's begin - could you please introduce yourself and tell me what interests you most about this role?`,
        // Robust call management settings
        endCallMessage: "Thank you for your time today. The interview has been completed successfully.",
        endCallPhrases: ["goodbye", "end interview", "finish interview", "conclude interview"],
        maxDurationSeconds: 3600, // 1 hour max
        silenceTimeoutSeconds: 45, // Increased to prevent premature timeout
        responseDelaySeconds: 1.0, // Natural conversation pace
        backgroundDenoisingEnabled: true,
        // Prevent accidental call endings
        endCallFunctionEnabled: false, // Disable function-based ending to prevent accidental triggers
      };

      console.log('🔄 Using fallback assistant config:', assistantConfig.name);
      console.log('🔧 Final config being sent to Vapi:', JSON.stringify(assistantConfig, null, 2));
      
      // Validate configuration before sending to Vapi
      const validation = validateAssistantConfig(assistantConfig);
      if (!validation.isValid) {
        console.error('❌ Invalid assistant configuration:', validation.errors);
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }
      
      console.log('✅ Configuration validation passed');
      
      try {
        await vapiRef.current.start(assistantConfig);
      } catch (vapiError: any) {
        // Handle Vapi-specific errors which might be objects
        let vapiErrorMessage = 'Failed to start Vapi call';
        if (vapiError && typeof vapiError === 'object') {
          if (vapiError.message) {
            vapiErrorMessage = vapiError.message;
          } else if (vapiError.error) {
            vapiErrorMessage = vapiError.error;
          } else if (vapiError.statusCode && vapiError.body) {
            vapiErrorMessage = `Error ${vapiError.statusCode}: ${vapiError.body}`;
          } else {
            vapiErrorMessage = JSON.stringify(vapiError);
          }
        } else if (typeof vapiError === 'string') {
          vapiErrorMessage = vapiError;
        }
        
        console.error('Vapi call start failed:', vapiErrorMessage, vapiError);
        throw new Error(vapiErrorMessage);
      }
    } catch (error: any) {
      const msg = normalizeError(error, 'Failed to start interview call');
      console.error('Failed to start interview call - normalized:', msg, error);
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: msg
      }));
    }
  }, [volume]);

  const endCall = useCallback(() => {
    if (vapiRef.current && callState.isActive) {
      vapiRef.current.stop();
    }
  }, [callState.isActive]);

  const toggleMute = useCallback(() => {
    if (vapiRef.current && callState.isActive) {
      if (isMuted) {
        vapiRef.current.setMuted(false);
      } else {
        vapiRef.current.setMuted(true);
      }
      setIsMuted(!isMuted);
    }
  }, [isMuted, callState.isActive]);

  const handleSetVolume = useCallback((newVolume: number) => {
    setVolume(newVolume);
    // Update volume in real-time if call is active
    if (vapiRef.current && callState.isActive) {
      // Volume updates might need to be handled differently based on Vapi SDK
      // This is a placeholder for volume control
    }
  }, [callState.isActive]);

  // Start an interview call with a transient assistant for an existing session
  const startTransientInterviewCall = useCallback(async (sessionId: string, candidateName: string, position: string) => {
    if (!vapiRef.current) {
      console.error('Vapi not initialized');
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: 'Voice assistant not initialized'
      }));
      return;
    }

    // Validate inputs
    if (!sessionId?.trim()) {
      console.error('Session ID is required');
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: 'Session ID is required'
      }));
      return;
    }

    if (!candidateName?.trim()) {
      console.error('Candidate name is required');
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: 'Candidate name is required'
      }));
      return;
    }

    if (!position?.trim()) {
      console.error('Position is required');
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: 'Position is required'
      }));
      return;
    }

    try {
      setCallState(prev => ({
        ...prev,
        status: 'connecting',
        error: undefined
      }));

      console.log('🚀 Starting transient assistant interview for session:', sessionId);

      // Create transient assistant via API
      const startResponse = await fetch('/api/interviews/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewSessionId: sessionId,
          candidateName,
          position
        })
      });

      if (!startResponse.ok) {
        const errorData = await startResponse.json().catch(() => ({ error: 'Failed to parse error response' }));
        throw new Error(errorData.error || 'Failed to start interview');
      }

      const startData = await startResponse.json();
      console.log('✅ Transient assistant created:', startData.assistantId);

      // Store session ID for webhook correlation
      sessionIdRef.current = sessionId;

      // Start the call with the transient assistant
      try {
        await vapiRef.current.start(startData.assistantId);
        console.log('📞 Call started with transient assistant');
      } catch (vapiError: any) {
        // Handle Vapi-specific errors which might be objects
        let vapiErrorMessage = 'Failed to start Vapi call';
        if (vapiError && typeof vapiError === 'object') {
          if (vapiError.message) {
            vapiErrorMessage = vapiError.message;
          } else if (vapiError.error) {
            vapiErrorMessage = vapiError.error;
          } else if (vapiError.statusCode && vapiError.body) {
            vapiErrorMessage = `Error ${vapiError.statusCode}: ${vapiError.body}`;
          } else {
            vapiErrorMessage = JSON.stringify(vapiError);
          }
        } else if (typeof vapiError === 'string') {
          vapiErrorMessage = vapiError;
        }
        
        console.error('Vapi call start failed:', vapiErrorMessage, vapiError);
        
        // Check for specific permission error and provide fallback
        if (vapiErrorMessage.includes("Key doesn't allow assistantId") || 
            vapiErrorMessage.includes("assistantId") && vapiErrorMessage.includes("Forbidden")) {
          console.warn('🔑 Public key permission error detected - key is scoped to specific assistants');
          console.warn('💡 To fix: Change your Vapi Public Key from "Selected Assistants" to "All Assistants" in Vapi Dashboard');
          console.warn('🔄 Attempting fallback to inline configuration...');
          
          // Fallback: try inline config without assistantId
          try {
            const fallbackConfig = {
              name: `Interview - ${candidateName.split(' ')[0]}`,
              transcriber: {
                provider: "deepgram" as const,
                model: "nova-2" as const,
                language: "en-US" as const
              },
              voice: {
                provider: "11labs" as const,
                voiceId: "pNInz6obpgDQGcFmaJgB",
                stability: 0.6,
                similarityBoost: 0.9,
                style: 0.2,
                useSpeakerBoost: true
              },
              model: {
                provider: "openai" as const,
                model: "gpt-4o-mini" as const,
                temperature: 0.1,
                messages: [{
                  role: "system" as const,
                  content: `You are a professional AI interviewer for the position: ${position}. Conduct a comprehensive interview with the candidate ${candidateName}.`
                }]
              },
              firstMessage: `Hello ${candidateName}! I'm your AI interviewer today. I'm excited to learn more about your background and experience for the ${position} position. Let's begin - could you please introduce yourself?`,
              endCallMessage: "Thank you for your time today. The interview has been completed successfully.",
              maxDurationSeconds: 3600,
              silenceTimeoutSeconds: 45,
              responseDelaySeconds: 1.0,
              backgroundDenoisingEnabled: true,
              endCallFunctionEnabled: false,
            };
            
            console.log('🔄 Trying fallback inline config...');
            await vapiRef.current.start(fallbackConfig);
            console.log('✅ Fallback successful - interview started with inline config');
            return; // Success with fallback
          } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
            throw new Error(`Permission error: ${vapiErrorMessage}. Please configure your Vapi Public Key to allow "All Assistants" in the dashboard.`);
          }
        }
        
        throw new Error(vapiErrorMessage);
      }

    } catch (error: any) {
      const msg = normalizeError(error, 'Failed to start interview call');
      console.error('Error starting interview call:', msg, error);
      errorLogger.error('Vapi', 'Failed to start interview call', {
        sessionId,
        candidateName,
        position,
        error: msg
      }, error instanceof Error ? error : new Error(msg));
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: msg
      }));
    }
  }, []);

  return {
    callState,
    startCall,
    startInterviewCall,
    startTransientInterviewCall,
    endCall,
    toggleMute,
    isMuted,
    volume,
    setVolume: handleSetVolume,
  };
};
