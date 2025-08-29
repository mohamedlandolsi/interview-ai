'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { toast } from 'sonner'
import { 
  Building2, 
  Globe, 
  Users, 
  Plus, 
  Trash2, 
  Mail,
  Phone,
  MapPin,
  Upload,
  Save,
  UserPlus,
  MoreHorizontal,
  Crown,
  Shield,
  User,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react'

interface Company {
  id: string
  name: string
  website?: string | null
  industry?: string | null
  companySize?: string | null
  description?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  logoUrl?: string | null
  createdAt: string
  updatedAt: string
}

const companyFormSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  industry: z.string().min(1, 'Please select an industry'),
  companySize: z.string().min(1, 'Please select company size'),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
})

const inviteFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.string().min(1, 'Please select a role'),
  department: z.string().optional(),
})

type CompanyFormValues = z.infer<typeof companyFormSchema>
type InviteFormValues = z.infer<typeof inviteFormSchema>

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  department: string
  avatar?: string
  status: 'active' | 'pending' | 'inactive'
  joinedAt: string
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    role: 'Admin',
    department: 'Human Resources',
    status: 'active',
    joinedAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    role: 'Manager',
    department: 'Engineering',
    status: 'active',
    joinedAt: '2024-02-20'
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@company.com',
    role: 'User',
    department: 'Marketing',
    status: 'pending',
    joinedAt: '2024-06-10'
  }
]

export function CompanySettings() {
  const { refreshProfile } = useAuth()
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: '',
      website: '',
      industry: '',
      companySize: '',
      description: '',
      address: '',
      phone: '',
      email: '',
    },
  })

  // Load company data on mount
  useEffect(() => {
    loadCompanyData()
  }, [])

  const loadCompanyData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/company')
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to load company data')
      }
      
      const data = await response.json()
      
      if (data.company) {
        setCompany(data.company)
        // Update form with company data
        companyForm.reset({
          name: data.company.name || '',
          website: data.company.website || '',
          industry: data.company.industry || '',
          companySize: data.company.companySize || '',
          description: data.company.description || '',
          address: data.company.address || '',
          phone: data.company.phone || '',
          email: data.company.email || '',
        })
      }
    } catch (err) {
      console.error('Error loading company data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load company data')
      toast.error('Failed to load company data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const onCompanySubmit = async (data: CompanyFormValues) => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch('/api/company', {
        method: company ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save company data')
      }

      const result = await response.json()
      setCompany(result.company)
      
      // Refresh the AuthContext to update company data globally
      await refreshProfile()
      
      toast.success(company ? "Company information updated successfully." : "Company created successfully.")
    } catch (err) {
      console.error('Error saving company data:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save company data'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file.")
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB.")
      return
    }

    try {
      setUploading(true)
      setError(null)

      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/company/logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to upload logo')
      }

      const result = await response.json()
      
      // Update company state with new logo URL
      setCompany(prev => prev ? { ...prev, logoUrl: result.logoUrl } : null)
      setLogoFile(file)
      
      toast.success("Company logo uploaded successfully.")
    } catch (err) {
      console.error('Error uploading logo:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload logo'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleLogoRemove = async () => {
    if (!company?.logoUrl) return

    try {
      setUploading(true)
      setError(null)

      const response = await fetch('/api/company/logo', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to remove logo')
      }

      // Update company state to remove logo
      setCompany(prev => prev ? { ...prev, logoUrl: null } : null)
      setLogoFile(null)
      
      toast.success("Company logo removed successfully.")
    } catch (err) {
      console.error('Error removing logo:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove logo'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Loading company details...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Update your company details and branding.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : company?.logoUrl ? (
                  <img 
                    src={company.logoUrl} 
                    alt="Company logo" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : logoFile ? (
                  <img 
                    src={URL.createObjectURL(logoFile)} 
                    alt="Company logo" 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Company Logo</h3>
              <p className="text-sm text-muted-foreground">
                Upload your company logo. PNG, JPG or SVG. Max size 5MB.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild disabled={uploading}>
                  <Label htmlFor="logo-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                  </Label>
                </Button>
                {(company?.logoUrl || logoFile) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogoRemove}
                    disabled={uploading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
                <Input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Company Form */}
          <Form {...companyForm}>
            <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
              <FormField
                control={companyForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="https://company.com" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="info@company.com" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={companyForm.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={companyForm.control}
                  name="companySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501-1000">501-1000 employees</SelectItem>
                          <SelectItem value="1000+">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={companyForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Enter phone number" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={companyForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Company address" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={companyForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your company..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Brief description of your company. Maximum 1000 characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
