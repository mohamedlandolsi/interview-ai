'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  Clock, 
  FileText,
  AlertCircle,
  Loader2,
  Building
} from 'lucide-react';

interface InterviewSession {
  id: string;
  position: string;
  duration: number;
  status: string;
  candidateName: string;
  candidateEmail: string;
  template: {
    id: string;
    title: string;
    description: string;
    category: string;
    difficulty: string;
    duration: number;
  };
  interviewer: {
    id: string;
    full_name: string;
    company_name: string;
  };
  needsCandidateInfo: boolean;
}

export default function CandidateInterviewPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;

  const [session, setSession] = useState<InterviewSession | null>(null);  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Form state
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/interviews/links/${sessionId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Interview session not found');
          } else if (response.status === 410) {
            setError('This interview session is no longer active');
          } else {
            setError('Failed to load interview session');
          }
          setLoading(false);
          return;
        }        const data = await response.json();
        
        // Check if we should redirect to conduct page
        if (!data.session.needsCandidateInfo) {
          // Use setTimeout to ensure redirect happens after render
          setTimeout(() => {
            router.push(`/interview/${sessionId}/conduct`);
          }, 0);
          setShouldRedirect(true);
          return;
        }
        
        setSession(data.session);
        
        // Pre-fill if candidate info already exists
        if (data.session.candidateName) {
          setCandidateName(data.session.candidateName);
        }
        if (data.session.candidateEmail) {
          setCandidateEmail(data.session.candidateEmail);
        }
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load interview session');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();    }
  }, [sessionId, router]);

  const validateForm = () => {
    if (!candidateName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    
    if (!candidateEmail.trim()) {
      setError('Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/interviews/links/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateName: candidateName.trim(),
          candidateEmail: candidateEmail.trim(),
          candidatePhone: candidatePhone.trim() || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to save information');
        return;
      }

      // Redirect to interview session
      router.push(`/interview/${sessionId}/conduct`);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save information. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading interview...</span>
        </div>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Unable to Load Interview</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>    );
  }

  // Show loading while redirecting
  if (shouldRedirect) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Redirecting to interview...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">Welcome to Your Interview</h1>
            <p className="text-muted-foreground mt-2">
              Please provide your information to begin the interview session
            </p>
          </div>

          {/* Interview Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Interview Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{session?.position}</p>
                    <p className="text-sm text-muted-foreground">Position</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{session?.duration} minutes</p>
                    <p className="text-sm text-muted-foreground">Duration</p>
                  </div>
                </div>

                {session?.interviewer?.company_name && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{session.interviewer.company_name}</p>
                      <p className="text-sm text-muted-foreground">Company</p>
                    </div>
                  </div>
                )}

                {session?.interviewer?.full_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{session.interviewer.full_name}</p>
                      <p className="text-sm text-muted-foreground">Interviewer</p>
                    </div>
                  </div>
                )}
              </div>

              {session?.template && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                    Interview Template: {session.template.title}
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                    {session.template.description}
                  </p>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="secondary">{session.template.category}</Badge>
                    <Badge variant="outline">{session.template.difficulty}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Candidate Information Form */}
          <Card>
            <CardHeader>
              <CardTitle>Your Information</CardTitle>
              <CardDescription>
                Please provide your details to continue with the interview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    className="mt-1"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number (Optional)
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={candidatePhone}
                    onChange={(e) => setCandidatePhone(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving Information...
                    </>
                  ) : (
                    'Start Interview'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Before You Begin</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Technical Requirements:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Stable internet connection</li>
                    <li>• Working microphone and speakers/headphones</li>
                    <li>• Modern web browser (Chrome, Firefox, Safari)</li>
                    <li>• Quiet environment for optimal recording</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Interview Tips:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Speak clearly and at a comfortable pace</li>
                    <li>• Take your time to think before answering</li>
                    <li>• Ask for clarification if needed</li>
                    <li>• Be authentic and honest in your responses</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
