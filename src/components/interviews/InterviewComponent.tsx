'use client';

import React, { useState, useEffect } from 'react';
import { useVapi } from '@/hooks/useVapi';
import { useTemplates } from '@/hooks/useTemplates';
import { errorLogger } from '@/lib/error-logger';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Volume2, 
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface InterviewComponentProps {
  sessionId?: string; // New prop for transient assistant mode
  templateId?: string;
  assistantId?: string;
  candidateName?: string;
  position?: string;
  templateQuestions?: string[];
  useEnhancedAnalysis?: boolean;
  onInterviewStart?: () => void;
  onInterviewEnd?: (duration: number) => void;
  onError?: (error: string) => void;
}

export const InterviewComponent: React.FC<InterviewComponentProps> = ({
  sessionId,
  templateId,
  assistantId,
  candidateName,
  position,
  templateQuestions,
  useEnhancedAnalysis = true,
  onInterviewStart,
  onInterviewEnd,
  onError
}) => {
  const { 
    callState, 
    startCall, 
    startInterviewCall,
    startTransientInterviewCall,
    endCall, 
    toggleMute, 
    isMuted, 
    volume, 
    setVolume 
  } = useVapi();
  const { getTemplate } = useTemplates();
  const [lastDuration, setLastDuration] = useState<number>(0);
  const [templateData, setTemplateData] = useState<any>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState<string[]>([]);
  const [templateInstruction, setTemplateInstruction] = useState<string>('');
  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Fetch template data when templateId changes
  useEffect(() => {
    const fetchTemplateData = async () => {      if (!templateId) {
        setTemplateData(null);
        setExtractedQuestions([]);
        setTemplateInstruction('');
        return;
      }

      setLoadingTemplate(true);
      try {        const template = await getTemplate(templateId);
        if (template) {
          setTemplateData(template);
          setTemplateInstruction(template.instruction || '');
          
          // Extract questions from template
          let questions: string[] = [];
            // Check for rawQuestions first (new format)
          if (template.rawQuestions && Array.isArray(template.rawQuestions)) {
            questions = template.rawQuestions.map((q: any) => {
              if (typeof q === 'string') return q;
              if (q.title) return q.title; // Primary field for question text
              if (q.question) return q.question;
              if (q.text) return q.text;
              return JSON.stringify(q); // fallback
            });
          }
          // Fallback to questions field (legacy format)
          else if (template.questions) {
            if (Array.isArray(template.questions)) {
              questions = template.questions.map((q: any) => {
                if (typeof q === 'string') return q;
                if (q.title) return q.title; // Primary field for question text
                if (q.question) return q.question;
                if (q.text) return q.text;
                return JSON.stringify(q); // fallback
              });
            }
          }
          
          setExtractedQuestions(questions);
          console.log('Extracted questions from template:', questions);
        } else {
          console.error('Template not found:', templateId);
          onError?.(`Template ${templateId} not found`);
        }
      } catch (error) {
        const errorMessage = `Error fetching template: ${error}`;
        errorLogger.error('InterviewComponent', errorMessage, { error, templateId }, error instanceof Error ? error : new Error(String(error)));
        onError?.(errorMessage);
      } finally {
        setLoadingTemplate(false);
      }
    };

    fetchTemplateData();
  }, [templateId, getTemplate, onError]);  // Handle call state changes
  useEffect(() => {
    switch (callState.status) {
      case 'connected':
        onInterviewStart?.();
        break;
      case 'disconnected':
        if (callState.duration > 0) {
          setLastDuration(callState.duration);
          onInterviewEnd?.(callState.duration);
        }
        break;
      case 'error':
        if (callState.error) {
          errorLogger.error('InterviewComponent', 'Call state error', { 
            error: callState.error,
            callState: callState 
          });
          onError?.(callState.error);
        }
        break;
    }
  }, [callState.status, callState.duration, callState.error, onInterviewStart, onInterviewEnd, onError]);

  const handleStartInterview = async () => {
    // Determine which questions to use (template questions take priority)
    const questionsToUse = templateQuestions || extractedQuestions;
    
    try {
      // Validate inputs first
      if (!candidateName?.trim() || !position?.trim()) {
        const errorMessage = 'Candidate name and position are required';
        errorLogger.error('InterviewComponent', errorMessage, { candidateName, position });
        onError?.(errorMessage);
        return;
      }

      errorLogger.info('InterviewComponent', 'Starting interview', {
        sessionId,
        useEnhancedAnalysis,
        candidateName,
        position,
        questionsToUse: questionsToUse?.length || 0,
        templateInstruction: !!templateInstruction,
        assistantId
      });
      
      // If sessionId is provided, use transient assistant approach
      if (sessionId) {
        console.log('🚀 Starting interview with transient assistant for session:', sessionId);
        await startTransientInterviewCall(sessionId, candidateName, position);
      }
      // Use enhanced analysis if candidate name and position are provided (legacy mode)
      else if (useEnhancedAnalysis && candidateName && position) {
        await startInterviewCall(candidateName, position, questionsToUse, templateInstruction);
      } 
      // Fall back to static assistant (legacy mode)
      else {
        if (!assistantId && !process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID) {
          const errorMessage = 'No assistant configuration found. Please check your settings.';
          errorLogger.error('InterviewComponent', errorMessage);
          onError?.(errorMessage);
          return;
        }
        await startCall(assistantId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start interview';
      errorLogger.error('InterviewComponent', 'Failed to start interview', { 
        error,
        sessionId,
        useEnhancedAnalysis,
        candidateName,
        position,
        questionsToUse: questionsToUse?.length || 0,
        templateInstruction: !!templateInstruction,
        assistantId 
      }, error instanceof Error ? error : new Error(String(error)));
      onError?.(errorMessage);
    }
  };

  const handleEndInterview = () => {
    endCall();
  };

  const getStatusBadgeVariant = () => {
    switch (callState.status) {
      case 'connecting':
        return 'secondary';
      case 'connected':
        return 'default';
      case 'disconnected':
        return 'outline';
      case 'error':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusText = () => {
    switch (callState.status) {
      case 'idle':
        return 'Ready to start';
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Interview in progress';
      case 'disconnected':
        return 'Interview ended';
      case 'error':
        return 'Error occurred';
      default:
        return 'Unknown status';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Phone className="w-5 h-5" />
          AI Job Interview
        </CardTitle>
        <div className="flex items-center justify-center gap-2">
          <Badge variant={getStatusBadgeVariant()}>
            {getStatusText()}
          </Badge>
          {callState.status === 'connecting' && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Error Display */}
        {callState.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {typeof callState.error === 'string' 
                ? callState.error 
                : (callState.error as any)?.message || (callState.error as any)?.msg || 'An error occurred during the interview'}
            </AlertDescription>
          </Alert>
        )}

        {/* Call Duration */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-2xl font-mono font-bold">
            <Clock className="w-5 h-5" />
            {formatDuration(callState.duration)}
          </div>
          {lastDuration > 0 && callState.status === 'disconnected' && (
            <p className="text-sm text-muted-foreground mt-2">
              Last interview duration: {formatDuration(lastDuration)}
            </p>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex justify-center gap-4">
          {!callState.isActive ? (
            <Button
              onClick={handleStartInterview}
              disabled={callState.status === 'connecting'}
              size="lg"
              className="gap-2"
            >
              {callState.status === 'connecting' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4" />
                  Start Interview
                </>
              )}
            </Button>
          ) : (
            <>
              <Button
                onClick={handleEndInterview}
                variant="destructive"
                size="lg"
                className="gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                End Interview
              </Button>
              <Button
                onClick={toggleMute}
                variant={isMuted ? "destructive" : "outline"}
                size="lg"
                className="gap-2"
              >
                {isMuted ? (
                  <>
                    <MicOff className="w-4 h-4" />
                    Unmute
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4" />
                    Mute
                  </>
                )}
              </Button>
            </>
          )}
        </div>

        {/* Volume Control */}
        {!callState.isActive && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Volume2 className="w-4 h-4" />
              Volume: {Math.round(volume * 100)}%
            </div>
            <Slider
              value={[volume * 100]}
              onValueChange={(value) => setVolume(value[0] / 100)}
              max={100}
              min={0}
              step={5}
              className="w-full"
            />
          </div>
        )}

        {/* Instructions */}
        {callState.status === 'idle' && (
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-medium mb-2">Interview Instructions:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ensure you have a quiet environment</li>
              <li>• Test your microphone and speakers</li>
              <li>• Speak clearly and at a normal pace</li>
              <li>• You can mute/unmute during the interview</li>
              <li>• Click "End Interview" when you're finished</li>
            </ul>
          </div>
        )}

        {/* Active Call Info */}
        {callState.isActive && (
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Interview is live</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              The AI interviewer is listening. Speak naturally and answer the questions.
            </p>
          </div>
        )}

        {/* Post-Interview Actions */}
        {callState.status === 'disconnected' && lastDuration > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              Interview Completed!
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Your interview lasted {formatDuration(lastDuration)}. 
              You can view your results or start a new interview.
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => window.location.href = '/results'}
                variant="outline"
                size="sm"
              >
                View Results
              </Button>
              <Button
                onClick={handleStartInterview}
                size="sm"
              >
                Start New Interview
              </Button>
            </div>
          </div>
        )}

        {/* Template Info */}
        {templateId && (
          <div className="text-xs text-muted-foreground text-center">
            Interview Template ID: {templateId}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
