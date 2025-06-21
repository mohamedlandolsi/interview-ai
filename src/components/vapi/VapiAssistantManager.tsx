'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Bot, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface VapiAssistant {
  id: string;
  name: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

interface AssistantFormData {
  candidateName: string;
  position: string;
  companyName: string;
  interviewType: 'technical' | 'behavioral' | 'leadership' | 'sales' | 'cultural' | 'general';
  templateQuestions: string[];
}

export const VapiAssistantManager: React.FC = () => {
  const [assistants, setAssistants] = useState<VapiAssistant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<AssistantFormData>({
    candidateName: '',
    position: '',
    companyName: '',
    interviewType: 'general',
    templateQuestions: []
  });
  const [questionInput, setQuestionInput] = useState('');
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/vapi/assistants');
      if (response.ok) {
        const data = await response.json();
        setAssistants(data.assistants || []);
      } else {
        throw new Error('Failed to fetch assistants');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createAssistant = async () => {
    if (!formData.candidateName || !formData.position) {
      setError('Candidate name and position are required');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/vapi/assistants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setAssistants(prev => [...prev, data.assistant]);
        setShowCreateForm(false);
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assistant');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCreating(false);
    }
  };

  const createSpecializedAssistant = async (type: 'technical' | 'behavioral' | 'leadership' | 'sales') => {
    if (!formData.candidateName || !formData.position) {
      setError('Candidate name and position are required');
      return;
    }

    try {
      setCreating(true);
      setError(null);

      const response = await fetch('/api/vapi/assistants/specialized', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          candidateName: formData.candidateName,
          position: formData.position,
          companyName: formData.companyName
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAssistants(prev => [...prev, data.assistant]);
        setShowCreateForm(false);
        resetForm();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create specialized assistant');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setCreating(false);
    }
  };

  const deleteAssistant = async (assistantId: string) => {
    try {
      setDeletingId(assistantId);
      const response = await fetch(`/api/vapi/assistants?id=${assistantId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setAssistants(prev => prev.filter(a => a.id !== assistantId));
      } else {
        throw new Error('Failed to delete assistant');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      candidateName: '',
      position: '',
      companyName: '',
      interviewType: 'general',
      templateQuestions: []
    });
    setQuestionInput('');
  };

  const addQuestion = () => {
    if (questionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        templateQuestions: [...prev.templateQuestions, questionInput.trim()]
      }));
      setQuestionInput('');
    }
  };

  const removeQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      templateQuestions: prev.templateQuestions.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading assistants...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vapi Assistant Manager</h2>
          <p className="text-muted-foreground">
            Create and manage AI interview assistants with enhanced analysis
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Assistant
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              Create New Interview Assistant
            </CardTitle>
            <CardDescription>
              Configure an AI assistant with enhanced analysis capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="candidateName">Candidate Name *</Label>
                <Input
                  id="candidateName"
                  value={formData.candidateName}
                  onChange={(e) => setFormData(prev => ({ ...prev, candidateName: e.target.value }))}
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Software Engineer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="Acme Corp"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="interviewType">Interview Type</Label>
                <Select
                  value={formData.interviewType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, interviewType: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="behavioral">Behavioral</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="cultural">Cultural Fit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Questions */}
            <div className="space-y-2">
              <Label>Template Questions</Label>
              <div className="flex gap-2">
                <Input
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="Enter a custom interview question..."
                  onKeyPress={(e) => e.key === 'Enter' && addQuestion()}
                />
                <Button onClick={addQuestion} variant="outline">Add</Button>
              </div>
              
              {formData.templateQuestions.length > 0 && (
                <div className="space-y-2 mt-3">
                  {formData.templateQuestions.map((question, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                      <span className="flex-1 text-sm">{question}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeQuestion(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={createAssistant} 
                disabled={creating}
                className="gap-2"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Custom Assistant
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => createSpecializedAssistant('technical')} 
                  disabled={creating}
                  variant="outline"
                  size="sm"
                >
                  Technical
                </Button>
                <Button 
                  onClick={() => createSpecializedAssistant('behavioral')} 
                  disabled={creating}
                  variant="outline"
                  size="sm"
                >
                  Behavioral
                </Button>
                <Button 
                  onClick={() => createSpecializedAssistant('leadership')} 
                  disabled={creating}
                  variant="outline"
                  size="sm"
                >
                  Leadership
                </Button>
                <Button 
                  onClick={() => createSpecializedAssistant('sales')} 
                  disabled={creating}
                  variant="outline"
                  size="sm"
                >
                  Sales
                </Button>
              </div>

              <Button 
                onClick={() => {
                  setShowCreateForm(false);
                  resetForm();
                  setError(null);
                }} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assistants List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {assistants.map((assistant) => (
          <Card key={assistant.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">{assistant.name}</CardTitle>
                </div>
                <Badge 
                  variant={assistant.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {assistant.status === 'active' ? (
                    <>
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    'Inactive'
                  )}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <span className="font-mono text-xs">{assistant.id.substring(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{new Date(assistant.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="gap-1">
                  <Edit className="w-3 h-3" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => deleteAssistant(assistant.id)}
                  disabled={deletingId === assistant.id}
                  className="gap-1"
                >
                  {deletingId === assistant.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Trash2 className="w-3 h-3" />
                  )}
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assistants.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bot className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No assistants created yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first AI interview assistant to get started with enhanced analysis
            </p>
            <Button onClick={() => setShowCreateForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Assistant
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VapiAssistantManager;
