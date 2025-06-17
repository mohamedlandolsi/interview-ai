'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  CreditCard,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Mic,
  BarChart3,
  CheckCircle,
  X,
  ExternalLink,
  AlertTriangle,
  Crown,
  Zap,
  Star
} from 'lucide-react'

interface UsageMetric {
  name: string
  current: number
  limit: number
  unit: string
  icon: React.ReactNode
}

interface BillingPlan {
  id: string
  name: string
  price: number
  interval: string
  features: string[]
  limits: {
    interviews: number
    users: number
    storage: string
    support: string
  }
  popular?: boolean
  current?: boolean
}

interface Invoice {
  id: string
  date: string
  amount: number
  status: 'paid' | 'pending' | 'failed'
  description: string
  downloadUrl: string
}

const usageMetrics: UsageMetric[] = [
  {
    name: 'Interviews Conducted',
    current: 187,
    limit: 500,
    unit: 'interviews',
    icon: <Mic className="h-4 w-4" />
  },
  {
    name: 'Team Members',
    current: 8,
    limit: 15,
    unit: 'members',
    icon: <Users className="h-4 w-4" />
  },
  {
    name: 'Storage Used',
    current: 2.3,
    limit: 10,
    unit: 'GB',
    icon: <BarChart3 className="h-4 w-4" />
  }
]

const billingPlans: BillingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29,
    interval: 'month',
    features: [
      'Up to 100 interviews/month',
      '5 team members',
      '2GB storage',
      'Email support',
      'Basic analytics',
      'Standard templates'
    ],
    limits: {
      interviews: 100,
      users: 5,
      storage: '2GB',
      support: 'Email'
    }
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79,
    interval: 'month',
    features: [
      'Up to 500 interviews/month',
      '15 team members',
      '10GB storage',
      'Priority support',
      'Advanced analytics',
      'Custom templates',
      'Integrations',
      'Bulk operations'
    ],
    limits: {
      interviews: 500,
      users: 15,
      storage: '10GB',
      support: 'Priority'
    },
    popular: true,
    current: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199,
    interval: 'month',
    features: [
      'Unlimited interviews',
      'Unlimited team members',
      '100GB storage',
      '24/7 phone support',
      'Custom analytics',
      'White-label solution',
      'API access',
      'Custom integrations',
      'Dedicated account manager'
    ],
    limits: {
      interviews: -1, // unlimited
      users: -1, // unlimited
      storage: '100GB',
      support: '24/7 Phone'
    }
  }
]

const recentInvoices: Invoice[] = [
  {
    id: 'inv_001',
    date: '2024-06-01',
    amount: 79.00,
    status: 'paid',
    description: 'Professional Plan - June 2024',
    downloadUrl: '/invoices/inv_001.pdf'
  },
  {
    id: 'inv_002',
    date: '2024-05-01',
    amount: 79.00,
    status: 'paid',
    description: 'Professional Plan - May 2024',
    downloadUrl: '/invoices/inv_002.pdf'
  },
  {
    id: 'inv_003',
    date: '2024-04-01',
    amount: 79.00,
    status: 'paid',
    description: 'Professional Plan - April 2024',
    downloadUrl: '/invoices/inv_003.pdf'
  }
]

export function BillingSettings() {
  const [selectedPlan, setSelectedPlan] = useState<string>('professional')
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly')

  const currentPlan = billingPlans.find(plan => plan.current)
  const nextBillingDate = '2024-07-01'

  const getUsagePercentage = (current: number, limit: number) => {
    if (limit === -1) return 0 // unlimited
    return Math.min((current / limit) * 100, 100)
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'failed':
        return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'starter':
        return <Zap className="h-5 w-5 text-blue-500" />
      case 'professional':
        return <Star className="h-5 w-5 text-purple-500" />
      case 'enterprise':
        return <Crown className="h-5 w-5 text-yellow-500" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId)
    // TODO: Implement plan change
    console.log('Changing to plan:', planId)
  }

  const downloadInvoice = (invoice: Invoice) => {
    // TODO: Implement invoice download
    console.log('Downloading invoice:', invoice.id)
  }

  const formatPrice = (price: number, interval: string) => {
    const yearlyPrice = billingInterval === 'yearly' ? price * 10 : price // 2 months free
    return billingInterval === 'yearly' 
      ? `$${yearlyPrice}/year` 
      : `$${price}/${interval}`
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Plan
          </CardTitle>
          <CardDescription>
            Your subscription details and billing information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentPlan && (
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {getPlanIcon(currentPlan.name)}
                <div>
                  <h3 className="text-lg font-semibold">{currentPlan.name} Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    ${currentPlan.price}/{currentPlan.interval} • Next billing: {nextBillingDate}
                  </p>
                </div>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Billing Cycle</span>
              </div>
              <p className="text-sm text-muted-foreground">Monthly subscription</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Payment Method</span>
              </div>
              <p className="text-sm text-muted-foreground">•••• •••• •••• 4242</p>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Change Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Choose Your Plan</DialogTitle>
                  <DialogDescription>
                    Select the plan that best fits your needs.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                      <Button
                        variant={billingInterval === 'monthly' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setBillingInterval('monthly')}
                      >
                        Monthly
                      </Button>
                      <Button
                        variant={billingInterval === 'yearly' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setBillingInterval('yearly')}
                      >
                        Yearly
                        <Badge variant="secondary" className="ml-2">Save 20%</Badge>
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {billingPlans.map((plan) => (
                      <Card 
                        key={plan.id} 
                        className={`relative ${plan.popular ? 'border-primary' : ''} ${selectedPlan === plan.id ? 'ring-2 ring-primary' : ''}`}
                      >
                        {plan.popular && (
                          <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            Most Popular
                          </Badge>
                        )}
                        <CardHeader className="text-center">
                          <div className="flex justify-center mb-2">
                            {getPlanIcon(plan.name)}
                          </div>
                          <CardTitle>{plan.name}</CardTitle>
                          <div className="text-3xl font-bold">
                            {formatPrice(plan.price, plan.interval)}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <ul className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <Button 
                            className="w-full" 
                            variant={plan.current ? 'outline' : 'default'}
                            onClick={() => handlePlanChange(plan.id)}
                            disabled={plan.current}
                          >
                            {plan.current ? 'Current Plan' : 'Select Plan'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline">
              Update Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Usage This Month
          </CardTitle>
          <CardDescription>
            Track your current usage against plan limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {usageMetrics.map((metric) => {
            const percentage = getUsagePercentage(metric.current, metric.limit)
            const isNearLimit = percentage >= 75
            return (
              <div key={metric.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {metric.icon}
                    <span className="font-medium">{metric.name}</span>
                    {isNearLimit && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {metric.current} / {metric.limit === -1 ? '∞' : metric.limit} {metric.unit}
                  </span>
                </div>
                <div className="space-y-1">
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage.toFixed(1)}% used</span>
                    {isNearLimit && (
                      <span className="text-yellow-600 dark:text-yellow-400">
                        Approaching limit
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and download your past invoices.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInvoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{invoice.description}</h4>
                    {getStatusBadge(invoice.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(invoice.date).toLocaleDateString()} • ${invoice.amount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadInvoice(invoice)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Alerts</CardTitle>
          <CardDescription>
            Get notified when you're approaching your plan limits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h4 className="font-medium">Interview Limit Warning</h4>
                <p className="text-sm text-muted-foreground">
                  You've used 75% of your monthly interview quota.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              Upgrade Plan
            </Button>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Alert Preferences</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Notify at 75% usage</span>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Notify at 90% usage</span>
                <Badge variant="secondary">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Notify when limit reached</span>
                <Badge variant="secondary">Enabled</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
