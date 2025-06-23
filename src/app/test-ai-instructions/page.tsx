'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/components/Layout'
import { DashboardRoute } from '@/components/auth/ProtectedRoute'

export default function TestAIInstructionsPage() {
  const [prompt, setPrompt] = useState('')
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateInstructions = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/ai/generate-instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          templateName: 'Test Template',
          category: 'Technical',
          difficulty: 'intermediate',
          position: 'Software Engineer'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setInstructions(data.instructions)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate instructions')
      }
    } catch (err) {
      setError('Failed to generate AI instructions')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }
  return (
    <DashboardRoute>
      <DashboardLayout>
        <div className="container mx-auto py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">AI Instruction Generation Test</h1>
            <p className="text-muted-foreground">
              Test the AI-powered instruction generation feature for interview templates.
            </p>
          </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Instructions
            </CardTitle>
            <CardDescription>
              Enter a prompt to generate AI interviewer instructions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Prompt
              </label>
              <Textarea
                placeholder="e.g., 'Focus on problem-solving skills for a senior software engineer role. Ask about system design and coding best practices.'"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            
            <Button
              onClick={generateInstructions}
              disabled={!prompt.trim() || loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Instructions
                </>
              )}
            </Button>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated Instructions</CardTitle>
            <CardDescription>
              AI-generated instructions for the interview template
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={instructions}
              readOnly
              placeholder="Generated instructions will appear here..."
              className="min-h-[200px] resize-none"
            />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Example Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Focus on problem-solving skills for a senior software engineer role. Ask about system design and coding best practices.")}
              >
                Software Engineer Focus
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Emphasize leadership experience and team management capabilities for a project manager position.")}
              >
                Project Manager Focus
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Ask detailed questions about React, TypeScript, and modern frontend development practices.")}
              >
                Frontend Developer Focus
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPrompt("Prioritize cultural fit and communication skills for a customer service role.")}
              >
                Customer Service Focus              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
        </div>
      </DashboardLayout>
    </DashboardRoute>
  )
}
