'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  MessageSquare,
  Phone,
  PhoneOff,
  RefreshCw
} from 'lucide-react';

interface WebhookEvent {
  id: string;
  type: string;
  timestamp: string;
  status: 'success' | 'error';
  callId?: string;
  message?: string;
}

export const WebhookDashboard: React.FC = () => {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const testWebhook = async (eventType: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/vapi/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType })
      });

      const result = await response.json();
      
      if (result.success) {
        const newEvent: WebhookEvent = {
          id: Date.now().toString(),
          type: eventType,
          timestamp: new Date().toISOString(),
          status: 'success',
          callId: result.testEvent?.call?.id,
          message: `Test ${eventType} event processed successfully`
        };
        
        setEvents(prev => [newEvent, ...prev.slice(0, 9)]); // Keep last 10 events
      } else {
        throw new Error(result.error || 'Test failed');
      }
    } catch (error) {
      const errorEvent: WebhookEvent = {
        id: Date.now().toString(),
        type: eventType,
        timestamp: new Date().toISOString(),
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
      
      setEvents(prev => [errorEvent, ...prev.slice(0, 9)]);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'call-start':
        return <Phone className="w-4 h-4 text-green-600" />;
      case 'call-end':
        return <PhoneOff className="w-4 h-4 text-red-600" />;
      case 'transcript':
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: 'success' | 'error') => {
    return status === 'success' 
      ? <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Success</Badge>
      : <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Webhook Testing Dashboard
          </CardTitle>
          <CardDescription>
            Test your Vapi webhook integration with sample events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button
              onClick={() => testWebhook('call-start')}
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Phone className="w-4 h-4" />}
              Test Call Start
            </Button>
            
            <Button
              onClick={() => testWebhook('transcript')}
              disabled={isLoading}
              variant="outline"
              className="gap-2"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
              Test Transcript
            </Button>
            
            <Button
              onClick={() => testWebhook('call-end')}
              disabled={isLoading}
              variant="outline"
              className="gap-2"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PhoneOff className="w-4 h-4" />}
              Test Call End
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Webhook Events</CardTitle>
          <CardDescription>
            Last 10 webhook events received
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No webhook events yet. Click the test buttons above to simulate webhook events.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getEventIcon(event.type)}
                    <div>
                      <div className="font-medium">
                        {event.type.replace('-', ' ').toUpperCase()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {event.callId && `Call: ${event.callId.slice(-8)}`}
                        {event.message && ` • ${event.message}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(event.status)}
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Webhook Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Webhook URL</label>
              <div className="mt-1 p-2 bg-muted rounded font-mono text-sm">
                {typeof window !== 'undefined' 
                  ? `${window.location.origin}/api/vapi/webhook`
                  : '/api/vapi/webhook'
                }
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Environment Variables</label>
              <div className="mt-1 text-xs text-muted-foreground">
                Make sure these are configured in your Vapi dashboard:
              </div>
              <ul className="mt-2 text-sm space-y-1">
                <li>• <code>NEXT_PUBLIC_VAPI_PUBLIC_KEY</code></li>
                <li>• <code>NEXT_PUBLIC_VAPI_ASSISTANT_ID</code></li>
                <li>• <code>VAPI_WEBHOOK_SECRET</code> (optional, for production)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
