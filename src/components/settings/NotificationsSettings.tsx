'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
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
import { 
  Bell,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Save,
  TestTube
} from 'lucide-react'

const notificationFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  emailFrequency: z.string().min(1, 'Please select email frequency'),
  timeZone: z.string().min(1, 'Please select a timezone'),
  quietHoursStart: z.string(),
  quietHoursEnd: z.string(),
})

type NotificationFormValues = z.infer<typeof notificationFormSchema>

interface NotificationSetting {
  id: string
  category: string
  name: string
  description: string
  email: boolean
  push: boolean
  sms: boolean
  inApp: boolean
}

const notificationSettings: NotificationSetting[] = [
  {
    id: 'interview_scheduled',
    category: 'Interviews',
    name: 'Interview Scheduled',
    description: 'When a new interview is scheduled',
    email: true,
    push: true,
    sms: false,
    inApp: true
  },
  {
    id: 'interview_completed',
    category: 'Interviews',
    name: 'Interview Completed',
    description: 'When an interview is completed',
    email: true,
    push: true,
    sms: false,
    inApp: true
  },
  {
    id: 'interview_cancelled',
    category: 'Interviews',
    name: 'Interview Cancelled',
    description: 'When an interview is cancelled',
    email: true,
    push: true,
    sms: true,
    inApp: true
  },
  {
    id: 'results_ready',
    category: 'Results',
    name: 'Results Ready',
    description: 'When interview results are available',
    email: true,
    push: true,
    sms: false,
    inApp: true
  },
  {
    id: 'team_invited',
    category: 'Team',
    name: 'Team Member Invited',
    description: 'When a new team member is invited',
    email: true,
    push: false,
    sms: false,
    inApp: true
  },
  {
    id: 'team_joined',
    category: 'Team',
    name: 'Team Member Joined',
    description: 'When a team member accepts invitation',
    email: false,
    push: false,
    sms: false,
    inApp: true
  },
  {
    id: 'usage_limit',
    category: 'Billing',
    name: 'Usage Limit Reached',
    description: 'When approaching or exceeding usage limits',
    email: true,
    push: true,
    sms: true,
    inApp: true
  },
  {
    id: 'payment_failed',
    category: 'Billing',
    name: 'Payment Failed',
    description: 'When a payment fails',
    email: true,
    push: true,
    sms: true,
    inApp: true
  },
  {
    id: 'weekly_report',
    category: 'Reports',
    name: 'Weekly Reports',
    description: 'Weekly summary of interview activities',
    email: true,
    push: false,
    sms: false,
    inApp: false
  },
  {
    id: 'monthly_report',
    category: 'Reports',
    name: 'Monthly Reports',
    description: 'Monthly analytics and insights',
    email: true,
    push: false,
    sms: false,
    inApp: false
  }
]

export function NotificationsSettings() {
  const [settings, setSettings] = useState<NotificationSetting[]>(notificationSettings)

  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      email: 'john.doe@company.com',
      emailFrequency: 'immediate',
      timeZone: 'America/New_York',
      quietHoursStart: '22:00',
      quietHoursEnd: '08:00',
    },
  })

  const onSubmit = (data: NotificationFormValues) => {
    console.log('Notification settings:', data)
    // TODO: Implement settings update
  }

  const updateNotificationSetting = (id: string, channel: keyof Pick<NotificationSetting, 'email' | 'push' | 'sms' | 'inApp'>, value: boolean) => {
    setSettings(prev => prev.map(setting => 
      setting.id === id 
        ? { ...setting, [channel]: value }
        : setting
    ))
  }

  const testNotification = async (channel: string) => {
    console.log(`Testing ${channel} notification...`)
    // TODO: Implement notification test
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'interviews':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'results':
        return <BarChart3 className="h-4 w-4 text-green-500" />
      case 'team':
        return <Users className="h-4 w-4 text-purple-500" />
      case 'billing':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'reports':
        return <Mail className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = []
    }
    acc[setting.category].push(setting)
    return acc
  }, {} as Record<string, NotificationSetting[]>)

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Notification Settings</CardTitle>
          <CardDescription>
            Configure your notification preferences and delivery settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Enter email address" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Primary email address for notifications.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="emailFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">Immediate</SelectItem>
                          <SelectItem value="hourly">Hourly digest</SelectItem>
                          <SelectItem value="daily">Daily digest</SelectItem>
                          <SelectItem value="weekly">Weekly digest</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="timeZone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Zone</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="Europe/London">GMT</SelectItem>
                          <SelectItem value="Europe/Paris">CET</SelectItem>
                          <SelectItem value="Asia/Tokyo">JST</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quietHoursStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiet Hours Start</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input type="time" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="quietHoursEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quiet Hours End</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input type="time" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Notification Channels</CardTitle>
              <CardDescription>
                Test your notification channels to ensure they're working correctly.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => testNotification('email')}>
                <TestTube className="h-4 w-4 mr-2" />
                Test Email
              </Button>
              <Button variant="outline" size="sm" onClick={() => testNotification('push')}>
                <TestTube className="h-4 w-4 mr-2" />
                Test Push
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-500" />
                <Label>Email Notifications</Label>
                <Badge variant="default">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">john.doe@company.com</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-green-500" />
                <Label>Push Notifications</Label>
                <Badge variant="default">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Browser notifications enabled</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-orange-500" />
                <Label>SMS Notifications</Label>
                <Badge variant="secondary">Not configured</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Add phone number to enable</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                <Label>In-App Notifications</Label>
                <Badge variant="default">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground">Notifications within the app</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Choose which notifications you want to receive and how.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(groupedSettings).map(([category, categorySettings]) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  <h3 className="text-lg font-semibold">{category}</h3>
                </div>
                <div className="space-y-3">
                  {categorySettings.map((setting) => (
                    <div key={setting.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium">{setting.name}</h4>
                          <p className="text-sm text-muted-foreground">{setting.description}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <Label>Email</Label>
                          </div>
                          <Switch
                            checked={setting.email}
                            onCheckedChange={(checked) => 
                              updateNotificationSetting(setting.id, 'email', checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <Label>Push</Label>
                          </div>
                          <Switch
                            checked={setting.push}
                            onCheckedChange={(checked) => 
                              updateNotificationSetting(setting.id, 'push', checked)
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <Label>SMS</Label>
                          </div>
                          <Switch
                            checked={setting.sms}
                            onCheckedChange={(checked) => 
                              updateNotificationSetting(setting.id, 'sms', checked)
                            }
                            disabled={true} // Disabled until SMS is configured
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <Label>In-App</Label>
                          </div>
                          <Switch
                            checked={setting.inApp}
                            onCheckedChange={(checked) => 
                              updateNotificationSetting(setting.id, 'inApp', checked)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {category !== 'Reports' && <Separator />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
