'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { 
  Mic,
  Webhook,
  Key,
  Settings,
  Plus,
  Eye,
  EyeOff,
  TestTube,
  Loader2,
  Clock
} from 'lucide-react'

// Validation schema
const vapiConfigSchema = z.object({
  vapiApiKey: z.string().min(1, 'API key is required'),
  vapiAssistantId: z.string().optional(),
  vapiVoiceProvider: z.string().optional(),
  vapiVoiceId: z.string().optional(),
  vapiLanguage: z.string().optional(),
})

type VapiConfigValues = z.infer<typeof vapiConfigSchema>

// Types
interface VapiConfig {
  vapiApiKey: string | null
  vapiAssistantId: string | null
  vapiVoiceProvider: string | null
  vapiVoiceId: string | null
  vapiLanguage: string | null
  isConfigured: boolean
}

/**
 * Integrations Settings Component
 * 
 * This component provides company-level integration management capabilities
 * including Vapi configuration, webhooks, and API key management.
 * 
 * @access Admin/HR Manager only - This component should only be accessible to users with admin privileges
 */
export function IntegrationsSettings() {
  // State
  const [vapiConfig, setVapiConfig] = useState<VapiConfig>({
    vapiApiKey: null,
    vapiAssistantId: null,
    vapiVoiceProvider: null,
    vapiVoiceId: null,
    vapiLanguage: null,
    isConfigured: false
  })
  
  // UI State
  const [showApiKeys, setShowApiKeys] = useState<{[key: string]: boolean}>({})
  
  // Loading states
  const [isTestingVapi, setIsTestingVapi] = useState(false)
  const [isLoadingVapi, setIsLoadingVapi] = useState(true)
  const [isSavingVapi, setIsSavingVapi] = useState(false)

  // Forms
  const vapiForm = useForm<VapiConfigValues>({
    resolver: zodResolver(vapiConfigSchema),
    defaultValues: {
      vapiApiKey: '',
      vapiAssistantId: '',
      vapiVoiceProvider: '',
      vapiVoiceId: '',
      vapiLanguage: '',
    },
  })

  // Load initial data
  useEffect(() => {
    loadVapiConfig()
  }, [])

  // API Functions
  const loadVapiConfig = async () => {
    try {
      setIsLoadingVapi(true)
      const response = await fetch('/api/integrations/vapi')
      if (!response.ok) throw new Error('Failed to load Vapi configuration')
      
      const config = await response.json()
      setVapiConfig(config)
      
      // Update form with existing values including the decrypted API key
      vapiForm.reset({
        vapiApiKey: config.vapiApiKey || '',
        vapiAssistantId: config.vapiAssistantId || '',
        vapiVoiceProvider: config.vapiVoiceProvider || '',
        vapiVoiceId: config.vapiVoiceId || '',
        vapiLanguage: config.vapiLanguage || '',
      })
    } catch (error) {
      console.error('Failed to load Vapi config:', error)
      toast.error('Failed to load Vapi configuration')
    } finally {
      setIsLoadingVapi(false)
    }
  }

  // Vapi Functions
  const onVapiSubmit = async (data: VapiConfigValues) => {
    try {
      setIsSavingVapi(true)
      const response = await fetch('/api/integrations/vapi', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save configuration')
      }

      const result = await response.json()
      toast.success('Vapi configuration saved successfully')
      await loadVapiConfig() // Reload to get updated state
    } catch (error) {
      console.error('Failed to save Vapi config:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save configuration')
    } finally {
      setIsSavingVapi(false)
    }
  }

  const testVapiConnection = async () => {
    try {
      setIsTestingVapi(true)
      const response = await fetch('/api/integrations/vapi/test', {
        method: 'POST',
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Failed to test Vapi connection:', error)
      toast.error('Failed to test connection')
    } finally {
      setIsTestingVapi(false)
    }
  }

  if (isLoadingVapi) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Vapi Configuration */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Vapi Configuration
              </CardTitle>
              <CardDescription>
                Configure Vapi for AI-powered voice interviews.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={vapiConfig.isConfigured ? "default" : "secondary"}>
                {vapiConfig.isConfigured ? 'Connected' : 'Not Configured'}
              </Badge>
              {vapiConfig.isConfigured && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={testVapiConnection}
                  disabled={isTestingVapi}
                >
                  {isTestingVapi ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...vapiForm}>
            <form onSubmit={vapiForm.handleSubmit(onVapiSubmit)} className="space-y-4">
              <FormField
                control={vapiForm.control}
                name="vapiApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vapi API Key</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showApiKeys.vapi ? "text" : "password"}
                          placeholder="Enter your Vapi API key"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowApiKeys(prev => ({ ...prev, vapi: !prev.vapi }))}
                        >
                          {showApiKeys.vapi ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your private API key from Vapi dashboard
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={vapiForm.control}
                  name="vapiVoiceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice Provider (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select provider" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="azure">Azure</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vapiForm.control}
                  name="vapiVoiceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Voice ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={vapiForm.control}
                name="vapiLanguage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSavingVapi}>
                  {isSavingVapi ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Settings className="h-4 w-4 mr-2" />
                  )}
                  Save Configuration
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhooks
                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Coming Soon
                </Badge>
              </CardTitle>
              <CardDescription>
                Configure webhooks to receive real-time notifications.
              </CardDescription>
            </div>
            <Button disabled variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Webhook Integration Coming Soon</p>
            <p className="text-sm">This feature is currently under development and will be available in a future update.</p>
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card className="opacity-60">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
                <Badge variant="secondary" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                  <Clock className="h-3 w-3 mr-1" />
                  Coming Soon
                </Badge>
              </CardTitle>
              <CardDescription>
                Manage API keys for external integrations.
              </CardDescription>
            </div>
            <Button disabled variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add API Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">API Key Management Coming Soon</p>
            <p className="text-sm">This feature is currently under development and will be available in a future update.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
