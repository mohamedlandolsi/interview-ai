import { useState, useCallback, useRef, useEffect } from 'react';
import Vapi from '@vapi-ai/web';
import { createInterviewAssistantConfig, generateQuestionsForRole } from '@/lib/vapi-assistant-config';

export interface CallState {
  status: 'idle' | 'connecting' | 'connected' | 'disconnected' | 'error';
  isActive: boolean;
  duration: number;
  error?: string;
}

export interface UseVapiReturn {
  callState: CallState;
  startCall: (assistantId?: string) => Promise<void>;
  startInterviewCall: (candidateName: string, position: string, templateQuestions?: string[]) => Promise<void>;
  endCall: () => void;
  toggleMute: () => void;
  isMuted: boolean;
  volume: number;
  setVolume: (volume: number) => void;
}

export const useVapi = (): UseVapiReturn => {
  const vapiRef = useRef<Vapi | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [callState, setCallState] = useState<CallState>({
    status: 'idle',
    isActive: false,
    duration: 0,
  });

  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  // Initialize Vapi instance
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    
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
      return;
    }

    try {
      vapiRef.current = new Vapi(publicKey);
      
      // Set up event listeners
      vapiRef.current.on('call-start', () => {
        console.log('Call started');
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
      });

      vapiRef.current.on('error', (error: any) => {
        console.error('Vapi error:', error);
        setCallState(prev => ({
          ...prev,
          status: 'error',
          isActive: false,
          error: error.message || 'An error occurred during the call'
        }));
        
        // Clear duration timer
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      });

      vapiRef.current.on('volume-level', (volume: number) => {
        // Handle volume level updates if needed
        console.log('Volume level:', volume);
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
  }, [volume]);
  const startInterviewCall = useCallback(async (
    candidateName: string, 
    position: string, 
    templateQuestions?: string[]
  ) => {
    if (!vapiRef.current) {
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: 'Voice assistant not initialized'
      }));
      return;
    }

    try {
      setCallState(prev => ({
        ...prev,
        status: 'connecting',
        error: undefined
      }));

      // Option 1: Create assistant dynamically via API
      try {
        const response = await fetch('/api/vapi/assistants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            candidateName,
            position,
            templateQuestions,
            interviewType: 'general'
          })
        });

        if (response.ok) {
          const { assistant } = await response.json();
          console.log('Created dynamic assistant:', assistant.id);
          await vapiRef.current.start(assistant.id);
          return;
        } else {
          console.warn('Failed to create dynamic assistant, falling back to local config');
        }
      } catch (apiError) {
        console.warn('API assistant creation failed, using local config:', apiError);
      }

      // Option 2: Fallback to local configuration (as before)
      const questions = templateQuestions && templateQuestions.length > 0 
        ? templateQuestions 
        : generateQuestionsForRole(position);

      const assistantConfig = createInterviewAssistantConfig(
        candidateName,
        position,
        questions
      );

      await vapiRef.current.start(assistantConfig);
    } catch (error: any) {
      console.error('Failed to start interview call:', error);
      setCallState(prev => ({
        ...prev,
        status: 'error',
        error: error.message || 'Failed to start interview call'
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
