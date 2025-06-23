import { useState, useCallback, useRef, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { createInterviewAssistantConfig, generateQuestionsForRole } from '@/lib/vapi-assistant-config';

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

  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    isActive: false,
    duration: 0,
  });

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);// Initialize Vapi instance
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    
    console.log('🔧 Vapi initialization - publicKey exists:', !!publicKey);
    console.log('🔧 Vapi initialization - publicKey length:', publicKey?.length || 0);
    
    if (!publicKey) {
      console.error('VAPI public key is not configured');
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
        console.log('Call ended');
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
        console.error('Vapi error details:', {
          error,
          errorType: typeof error,
          errorMessage: error?.message,
          errorCode: error?.code,
          errorData: error?.data,
          errorString: String(error),
          errorKeys: error ? Object.keys(error) : [],
          fullError: JSON.stringify(error, null, 2)
        });
        
        // Extract meaningful error message
        let errorMessage = 'An error occurred during the call';
        if (error) {
          if (typeof error === 'string') {
            errorMessage = error;
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
          error: errorMessage
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
        console.log('📨 Message received:', message);
      });

    } catch (error) {
      console.error('Failed to initialize Vapi:', error);
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
      }));      await vapiRef.current.start(assistantToUse);
    } catch (error: any) {
      console.error('Failed to start call:', error);
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Failed to start interview call'
      }));
    }
  }, [volume]);  const startInterviewCall = useCallback(async (
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
            model: "gpt-4" as const,
            temperature: 0.1,
            messages: [{
              role: "system" as const,
              content: systemPrompt
            }]
          },
          firstMessage: `Hello! I'm your AI interviewer today. I'm excited to learn more about your background and experience for the ${position} position. Let's begin - could you please introduce yourself and tell me what interests you most about this role?`,
          responseDelaySeconds: 0.4,
          backgroundDenoisingEnabled: true
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
          model: "gpt-4" as const,
          temperature: 0.1,
          messages: [{
            role: "system" as const,
            content: fallbackSystemPrompt
          }]
        },
        firstMessage: `Hello! I'm your AI interviewer today. I'm excited to learn more about your background and experience for the ${position} position. Let's begin - could you please introduce yourself and tell me what interests you most about this role?`,
        responseDelaySeconds: 0.4,
        backgroundDenoisingEnabled: true
      };console.log('🔄 Using fallback assistant config:', assistantConfig.name);
      console.log('🔧 Final config being sent to Vapi:', JSON.stringify(assistantConfig, null, 2));
      
      // Validate configuration before sending to Vapi
      const validation = validateAssistantConfig(assistantConfig);
      if (!validation.isValid) {
        console.error('❌ Invalid assistant configuration:', validation.errors);
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }
      
      console.log('✅ Configuration validation passed');
      await vapiRef.current.start(assistantConfig);
    } catch (error: any) {
      console.error('Failed to start interview call - detailed error:', {
        error,
        errorType: typeof error,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorData: error?.data,
        errorString: String(error),
        errorStack: error?.stack,
        fullError: JSON.stringify(error, null, 2)
      });
      
      let errorMessage = 'Failed to start interview call';
      if (error) {
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.error) {
          errorMessage = error.error;
        } else if (error.code) {
          errorMessage = `Error code: ${error.code}`;
        }
      }
      
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage
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
  return {
    callState,
    startCall,
    startInterviewCall,
    endCall,
    toggleMute,
    isMuted,
    volume,
    setVolume: handleSetVolume,
  };
};
