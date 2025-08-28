'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Check,
  X,
  RefreshCw,
  TestTube,
  Loader2,
  AlertCircle
} from 'lucide-react'

// Validation schemas
const vapiConfigSchema = z.object({
  vapiApiKey: z.string().min(1, 'API key is required'),
  vapiAssistantId: z.string().optional(),
  vapiVoiceProvider: z.string().optional(),
  vapiVoiceId: z.string().optional(),
  vapiLanguage: z.string().optional(),
})

const webhookSchema = z.object({
  url: z.string().url('Invalid webhook URL'),
  events: z.array(z.string()).min(1, 'Select at least one event'),
})

const apiKeySchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be less than 50 characters'),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
})

type VapiConfigValues = z.infer<typeof vapiConfigSchema>
type WebhookValues = z.infer<typeof webhookSchema>
type ApiKeyValues = z.infer<typeof apiKeySchema>

// Types
interface VapiConfig {
  vapiApiKey: string | null
  vapiAssistantId: string | null
  vapiVoiceProvider: string | null
  vapiVoiceId: string | null
  vapiLanguage: string | null
  isConfigured: boolean
}

interface WebhookData {
  id: string
  url: string
  events: string[]
  isActive: boolean
  lastTriggeredAt: string | null
  createdAt: string
}

interface ApiKeyData {
  id: string
  prefix: string
  name: string
  permissions: string[]
  lastUsedAt: string | null
  createdAt: string
}

interface NewApiKey extends ApiKeyData {
  key: string // Only returned once upon creation
}

// Available webhook events
const WEBHOOK_EVENTS = [
  'interview.started',
  'interview.completed', 
  'interview.cancelled',
  'candidate.invited',
  'template.created',
  'template.updated'
] as const

// Available API permissions
const API_PERMISSIONS = [
  'interviews:read',
  'interviews:create',
  'interviews:update', 
  'interviews:delete',
  'templates:read',
  'templates:create',
  'templates:update',
  'templates:delete',
  'candidates:read',
  'candidates:create',
  'candidates:update',
  'results:read',
  'webhooks:send'
] as const

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
  const [webhooks, setWebhooks] = useState<WebhookData[]>([])
  const [apiKeys, setApiKeys] = useState<ApiKeyData[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([])
  
  // UI State
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false)
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
  const [newApiKeyResult, setNewApiKeyResult] = useState<NewApiKey | null>(null)
  const [isNewApiKeyDialogOpen, setIsNewApiKeyDialogOpen] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState<{[key: string]: boolean}>({})
  
  // Loading states
  const [isTestingVapi, setIsTestingVapi] = useState(false)
  const [isLoadingVapi, setIsLoadingVapi] = useState(true)
  const [isLoadingWebhooks, setIsLoadingWebhooks] = useState(true)
  const [isLoadingApiKeys, setIsLoadingApiKeys] = useState(true)
  const [isSavingVapi, setIsSavingVapi] = useState(false)
  const [isCreatingWebhook, setIsCreatingWebhook] = useState(false)
  const [isCreatingApiKey, setIsCreatingApiKey] = useState(false)
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set())
  const [testingWebhooks, setTestingWebhooks] = useState<Set<string>>(new Set())

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

  const webhookForm = useForm<WebhookValues>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      url: '',
      events: [],
    },
  })

  const apiKeyForm = useForm<ApiKeyValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: '',
      permissions: [],
    },
  })

  // Load initial data
  useEffect(() => {
    loadVapiConfig()
    loadWebhooks()
    loadApiKeys()
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

  const loadWebhooks = async () => {
    try {
      setIsLoadingWebhooks(true)
      const response = await fetch('/api/integrations/webhooks')
      if (!response.ok) throw new Error('Failed to load webhooks')
      
      const data = await response.json()
      setWebhooks(data.webhooks)
    } catch (error) {
      console.error('Failed to load webhooks:', error)
      toast.error('Failed to load webhooks')
    } finally {
      setIsLoadingWebhooks(false)
    }
  }

  const loadApiKeys = async () => {
    try {
      setIsLoadingApiKeys(true)
      const response = await fetch('/api/integrations/apikeys')
      if (!response.ok) throw new Error('Failed to load API keys')
      
      const data = await response.json()
      setApiKeys(data.apiKeys)
      setAvailablePermissions(data.availablePermissions)
    } catch (error) {
      console.error('Failed to load API keys:', error)
      toast.error('Failed to load API keys')
    } finally {
      setIsLoadingApiKeys(false)
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

  // Webhook Functions
  const onWebhookSubmit = async (data: WebhookValues) => {
    try {
      setIsCreatingWebhook(true)
      const response = await fetch('/api/integrations/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create webhook')
      }

      const result = await response.json()
      toast.success('Webhook created successfully')
      setIsWebhookDialogOpen(false)
      webhookForm.reset()
      await loadWebhooks()
    } catch (error) {
      console.error('Failed to create webhook:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create webhook')
    } finally {
      setIsCreatingWebhook(false)
    }
  }

  const deleteWebhook = async (webhookId: string) => {
    try {
      setDeletingItems(prev => new Set(prev).add(webhookId))
      const response = await fetch(`/api/integrations/webhooks/${webhookId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete webhook')
      }

      toast.success('Webhook deleted successfully')
      await loadWebhooks()
    } catch (error) {
      console.error('Failed to delete webhook:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete webhook')
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(webhookId)
        return newSet
      })
    }
  }

  const testWebhook = async (webhookId: string) => {
    try {
      setTestingWebhooks(prev => new Set(prev).add(webhookId))
      const response = await fetch(`/api/integrations/webhooks/${webhookId}`, {
        method: 'POST',
      })

      const result = await response.json()
      
      if (result.success) {
        toast.success(`Webhook test successful (${result.statusCode})`)
      } else {
        toast.error(`Webhook test failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to test webhook:', error)
      toast.error('Failed to test webhook')
    } finally {
      setTestingWebhooks(prev => {
        const newSet = new Set(prev)
        newSet.delete(webhookId)
        return newSet
      })
    }
  }

  // API Key Functions
  const onApiKeySubmit = async (data: ApiKeyValues) => {
    try {
      setIsCreatingApiKey(true)
      const response = await fetch('/api/integrations/apikeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create API key')
      }

      const result = await response.json()
      setNewApiKeyResult(result.apiKey)
      setIsNewApiKeyDialogOpen(true)
      setIsApiKeyDialogOpen(false)
      apiKeyForm.reset()
      await loadApiKeys()
      toast.success('API key created successfully')
    } catch (error) {
      console.error('Failed to create API key:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create API key')
    } finally {
      setIsCreatingApiKey(false)
    }
  }

  const deleteApiKey = async (apiKeyId: string) => {
    try {
      setDeletingItems(prev => new Set(prev).add(apiKeyId))
      const response = await fetch(`/api/integrations/apikeys/${apiKeyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete API key')
      }

      toast.success('API key deleted successfully')
      await loadApiKeys()
    } catch (error) {
      console.error('Failed to delete API key:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete API key')
    } finally {
      setDeletingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(apiKeyId)
        return newSet
      })
    }
  }

  // Utility Functions
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard')
    } catch (err) {
      console.error('Failed to copy:', err)
      toast.error('Failed to copy to clipboard')
    }
  }

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoadingVapi && isLoadingWebhooks && isLoadingApiKeys) {
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
          {isLoadingVapi ? (
            <div className="space-y-4">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
            </div>
          ) : (
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
                            type="password" 
                            placeholder={vapiConfig.isConfigured ? "API key is configured" : "Enter your Vapi API key"}
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Your Vapi API key from the dashboard. Leave empty to keep current key.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={vapiForm.control}
                  name="vapiAssistantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assistant ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter assistant ID" {...field} />
                      </FormControl>
                      <FormDescription>
                        The ID of your configured Vapi assistant.
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
                        <FormLabel>Voice Provider</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select voice provider" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="eleven_labs">ElevenLabs</SelectItem>
                            <SelectItem value="azure">Azure</SelectItem>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="playht">PlayHT</SelectItem>
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
                        <FormLabel>Voice ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter voice ID" {...field} />
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
                      <FormLabel>Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="en-GB">English (UK)</SelectItem>
                          <SelectItem value="es-ES">Spanish</SelectItem>
                          <SelectItem value="fr-FR">French</SelectItem>
                          <SelectItem value="de-DE">German</SelectItem>
                          <SelectItem value="it-IT">Italian</SelectItem>
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
          )}
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Webhooks
              </CardTitle>
              <CardDescription>
                Configure webhooks to receive real-time notifications.
              </CardDescription>
            </div>
            <Dialog open={isWebhookDialogOpen} onOpenChange={setIsWebhookDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add New Webhook</DialogTitle>
                  <DialogDescription>
                    Create a new webhook endpoint to receive event notifications.
                  </DialogDescription>
                </DialogHeader>
                <Form {...webhookForm}>
                  <form onSubmit={webhookForm.handleSubmit(onWebhookSubmit)} className="space-y-4">
                    <FormField
                      control={webhookForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://your-domain.com/webhook" {...field} />
                          </FormControl>
                          <FormDescription>
                            Must be HTTPS and not localhost
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={webhookForm.control}
                      name="events"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Events</FormLabel>
                          <FormDescription>
                            Select which events to send to this webhook
                          </FormDescription>
                          <div className="grid grid-cols-1 gap-3 mt-2">
                            {WEBHOOK_EVENTS.map((event) => (
                              <div key={event} className="flex items-center space-x-2">
                                <Checkbox
                                  id={event}
                                  checked={field.value?.includes(event) || false}
                                  onCheckedChange={(checked) => {
                                    const updatedEvents = checked
                                      ? [...(field.value || []), event]
                                      : (field.value || []).filter((e) => e !== event)
                                    field.onChange(updatedEvents)
                                  }}
                                />
                                <Label htmlFor={event} className="text-sm">
                                  {event.replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsWebhookDialogOpen(false)}
                        disabled={isCreatingWebhook}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreatingWebhook}>
                        {isCreatingWebhook ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Create Webhook
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingWebhooks ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : webhooks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Webhook className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No webhooks configured</p>
              <p className="text-sm">Add a webhook to receive real-time notifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((webhook) => (
                <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{webhook.url}</h4>
                      <Badge variant={webhook.isActive ? 'default' : 'secondary'}>
                        {webhook.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Events: {webhook.events.join(', ')}
                      </span>
                      {webhook.lastTriggeredAt && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            Last triggered: {formatDate(webhook.lastTriggeredAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testWebhook(webhook.id)}
                      disabled={testingWebhooks.has(webhook.id)}
                    >
                      {testingWebhooks.has(webhook.id) ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4 mr-2" />
                      )}
                      Test
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingItems.has(webhook.id)}
                        >
                          {deletingItems.has(webhook.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this webhook? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteWebhook(webhook.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage API keys for external integrations.
              </CardDescription>
            </div>
            <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate API Key
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Generate New API Key</DialogTitle>
                  <DialogDescription>
                    Create a new API key for external access.
                  </DialogDescription>
                </DialogHeader>
                <Form {...apiKeyForm}>
                  <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)} className="space-y-4">
                    <FormField
                      control={apiKeyForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Production Integration" {...field} />
                          </FormControl>
                          <FormDescription>
                            A descriptive name for this API key
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={apiKeyForm.control}
                      name="permissions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Permissions</FormLabel>
                          <FormDescription>
                            Select which operations this API key can perform
                          </FormDescription>
                          <div className="grid grid-cols-1 gap-3 mt-2 max-h-48 overflow-y-auto">
                            {availablePermissions.map((permission) => (
                              <div key={permission} className="flex items-center space-x-2">
                                <Checkbox
                                  id={permission}
                                  checked={field.value?.includes(permission) || false}
                                  onCheckedChange={(checked) => {
                                    const updatedPermissions = checked
                                      ? [...(field.value || []), permission]
                                      : (field.value || []).filter((p) => p !== permission)
                                    field.onChange(updatedPermissions)
                                  }}
                                />
                                <Label htmlFor={permission} className="text-sm">
                                  {permission.replace(':', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                                </Label>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsApiKeyDialogOpen(false)}
                        disabled={isCreatingApiKey}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreatingApiKey}>
                        {isCreatingApiKey ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Key className="h-4 w-4 mr-2" />
                        )}
                        Generate Key
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingApiKeys ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted animate-pulse rounded w-1/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                  </div>
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No API keys generated</p>
              <p className="text-sm">Generate an API key to enable external integrations</p>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{apiKey.name}</h4>
                      <Badge variant="default">Active</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                        {apiKey.prefix}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.prefix)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Permissions: {apiKey.permissions.slice(0, 3).join(', ')}
                        {apiKey.permissions.length > 3 && ` +${apiKey.permissions.length - 3} more`}
                      </span>
                      {apiKey.lastUsedAt && (
                        <>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">
                            Last used: {formatDate(apiKey.lastUsedAt)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          disabled={deletingItems.has(apiKey.id)}
                        >
                          {deletingItems.has(apiKey.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this API key? Any applications using this key will lose access immediately.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteApiKey(apiKey.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New API Key Display Dialog */}
      <Dialog open={isNewApiKeyDialogOpen} onOpenChange={setIsNewApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              API Key Created Successfully
            </DialogTitle>
            <DialogDescription>
              Your new API key has been generated. Copy it now - it will not be shown again.
            </DialogDescription>
          </DialogHeader>
          
          {newApiKeyResult && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-sm font-medium">API Key</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 text-sm font-mono p-2 bg-background border rounded">
                    {newApiKeyResult.key}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(newApiKeyResult.key)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Important:</strong> This is the only time you'll see this key. Store it securely and don't share it.
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={() => {
              setIsNewApiKeyDialogOpen(false)
              setNewApiKeyResult(null)
            }}>
              I've Copied It
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}