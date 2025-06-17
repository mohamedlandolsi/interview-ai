'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
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
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Mic,
  Webhook,
  Key,
  Globe,
  Settings,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  TestTube
} from 'lucide-react'

const vapiConfigSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  assistantId: z.string().min(1, 'Assistant ID is required'),
  voiceProvider: z.string().min(1, 'Please select a voice provider'),
  voiceId: z.string().min(1, 'Please select a voice'),
  language: z.string().min(1, 'Please select a language'),
  webhook_url: z.string().url('Invalid webhook URL').optional().or(z.literal('')),
})

const webhookSchema = z.object({
  name: z.string().min(1, 'Webhook name is required'),
  url: z.string().url('Invalid webhook URL'),
  events: z.array(z.string()).min(1, 'Select at least one event'),
  secret: z.string().optional(),
})

const apiKeySchema = z.object({
  name: z.string().min(1, 'API key name is required'),
  permissions: z.array(z.string()).min(1, 'Select at least one permission'),
})

type VapiConfigValues = z.infer<typeof vapiConfigSchema>
type WebhookValues = z.infer<typeof webhookSchema>
type ApiKeyValues = z.infer<typeof apiKeySchema>

interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  created: string
  lastUsed?: string
  status: 'active' | 'inactive'
}

interface Webhook {
  id: string
  name: string
  url: string
  events: string[]
  status: 'active' | 'inactive'
  lastTriggered?: string
}

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production API',
    key: 'sk_live_1234567890abcdef',
    permissions: ['read', 'write'],
    created: '2024-01-15',
    lastUsed: '2024-06-17',
    status: 'active'
  },
  {
    id: '2',
    name: 'Development API',
    key: 'sk_test_abcdef1234567890',
    permissions: ['read'],
    created: '2024-03-10',
    lastUsed: '2024-06-15',
    status: 'active'
  }
]

const mockWebhooks: Webhook[] = [
  {
    id: '1',
    name: 'Interview Completed',
    url: 'https://api.company.com/webhooks/interview-completed',
    events: ['interview.completed', 'interview.scored'],
    status: 'active',
    lastTriggered: '2024-06-17'
  }
]

export function IntegrationsSettings() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys)
  const [webhooks, setWebhooks] = useState<Webhook[]>(mockWebhooks)
  const [isWebhookDialogOpen, setIsWebhookDialogOpen] = useState(false)
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false)
  const [showApiKeys, setShowApiKeys] = useState<{[key: string]: boolean}>({})
  const [vapiConnected, setVapiConnected] = useState(true)

  const vapiForm = useForm<VapiConfigValues>({
    resolver: zodResolver(vapiConfigSchema),
    defaultValues: {
      apiKey: 'vapi_123456789',
      assistantId: 'asst_abc123',
      voiceProvider: 'eleven_labs',
      voiceId: 'voice_123',
      language: 'en-US',
      webhook_url: 'https://api.company.com/vapi/webhook',
    },
  })

  const webhookForm = useForm<WebhookValues>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      name: '',
      url: '',
      events: [],
      secret: '',
    },
  })

  const apiKeyForm = useForm<ApiKeyValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      name: '',
      permissions: [],
    },
  })

  const onVapiSubmit = (data: VapiConfigValues) => {
    console.log('Vapi config:', data)
    // TODO: Implement Vapi configuration
  }

  const onWebhookSubmit = (data: WebhookValues) => {
    console.log('Webhook data:', data)
    // TODO: Implement webhook creation
    setIsWebhookDialogOpen(false)
    webhookForm.reset()
  }

  const onApiKeySubmit = (data: ApiKeyValues) => {
    console.log('API key data:', data)
    // TODO: Implement API key creation
    setIsApiKeyDialogOpen(false)
    apiKeyForm.reset()
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // TODO: Show success toast
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const toggleApiKeyVisibility = (keyId: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }))
  }

  const testVapiConnection = async () => {
    // TODO: Implement Vapi connection test
    console.log('Testing Vapi connection...')
  }

  const testWebhook = async (webhookId: string) => {
    // TODO: Implement webhook test
    console.log('Testing webhook:', webhookId)
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
              <Badge variant={vapiConnected ? "default" : "secondary"}>
                {vapiConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <Button variant="outline" size="sm" onClick={testVapiConnection}>
                <TestTube className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...vapiForm}>
            <form onSubmit={vapiForm.handleSubmit(onVapiSubmit)} className="space-y-4">
              <FormField
                control={vapiForm.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vapi API Key</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="password" 
                          placeholder="Enter your Vapi API key" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => copyToClipboard(field.value)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your Vapi API key from the dashboard.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={vapiForm.control}
                name="assistantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assistant ID</FormLabel>
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
                  name="voiceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voice Provider</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                  name="voiceId"
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
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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

              <FormField
                control={vapiForm.control}
                name="webhook_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Webhook URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://your-domain.com/vapi/webhook" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL to receive Vapi events and callbacks.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">
                  <Settings className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </form>
          </Form>
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Webhook</DialogTitle>
                  <DialogDescription>
                    Create a new webhook endpoint.
                  </DialogDescription>
                </DialogHeader>
                <Form {...webhookForm}>
                  <form onSubmit={webhookForm.handleSubmit(onWebhookSubmit)} className="space-y-4">
                    <FormField
                      control={webhookForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter webhook name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={webhookForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Webhook URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://your-domain.com/webhook" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={webhookForm.control}
                      name="secret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secret (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter webhook secret" {...field} />
                          </FormControl>
                          <FormDescription>
                            Used to verify webhook authenticity.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsWebhookDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
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
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{webhook.name}</h4>
                    <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                      {webhook.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{webhook.url}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      Events: {webhook.events.join(', ')}
                    </span>
                    {webhook.lastTriggered && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          Last triggered: {new Date(webhook.lastTriggered).toLocaleDateString()}
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
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    Test
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
              <DialogContent>
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
                            <Input placeholder="Enter API key name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-3">
                      <Label>Permissions</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {['read', 'write', 'delete', 'admin'].map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={permission}
                              className="rounded"
                            />
                            <Label htmlFor={permission} className="capitalize">
                              {permission}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsApiKeyDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
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
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{apiKey.name}</h4>
                    <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                      {apiKey.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                      {showApiKeys[apiKey.id] ? apiKey.key : '••••••••••••••••'}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleApiKeyVisibility(apiKey.id)}
                    >
                      {showApiKeys[apiKey.id] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(apiKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      Permissions: {apiKey.permissions.join(', ')}
                    </span>
                    {apiKey.lastUsed && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          Last used: {new Date(apiKey.lastUsed).toLocaleDateString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
