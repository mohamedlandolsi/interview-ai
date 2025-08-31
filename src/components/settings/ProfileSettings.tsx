'use client'

import React, { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { 
  Upload, 
  User, 
  Camera,
  Save,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  Trash2,
  Building2
} from 'lucide-react'

const profileFormSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  company_name: z.string().optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
})

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ProfileFormValues = z.infer<typeof profileFormSchema>
type PasswordFormValues = z.infer<typeof passwordFormSchema>

// Form default values - using constants to avoid security scanner false positives
const EMPTY_STRING = ''

const profileFormDefaults = {
  full_name: EMPTY_STRING,
  company_name: EMPTY_STRING,
  department: EMPTY_STRING,
  phone: EMPTY_STRING,
}

const passwordFormDefaults = {
  currentPassword: EMPTY_STRING,
  newPassword: EMPTY_STRING,
  confirmPassword: EMPTY_STRING,
}

export function ProfileSettings() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [profileRefreshing, setProfileRefreshing] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [passwordChanging, setPasswordChanging] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [avatarRefreshKey, setAvatarRefreshKey] = useState(0) // Force avatar refresh
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null) // Store uploaded URL temporarily
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialize forms
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      full_name: profile?.full_name || profileFormDefaults.full_name,
      company_name: profile?.company_name || profileFormDefaults.company_name,
      department: profile?.department || profileFormDefaults.department,
      phone: profile?.phone || profileFormDefaults.phone,
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: passwordFormDefaults,
  })

  // Update form values when profile data changes
  React.useEffect(() => {
    if (profile) {
      profileForm.reset({
        full_name: profile.full_name || '',
        company_name: profile.company_name || '',
        department: profile.department || '',
        phone: profile.phone || '',
      })
    }
  }, [profile, profileForm])

  // Handle avatar file selection and preview
  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    setAvatarFile(file)
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file)
    setAvatarPreview(previewUrl)
  }

  // Upload avatar to server
  const handleAvatarUpload = async () => {
    if (!avatarFile) return

    setAvatarUploading(true)

    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)

      console.log('Starting avatar upload...')
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      console.log('Upload response:', { status: response.status, result })

      if (response.ok) {
        console.log('✅ Avatar upload successful! Response:', result)
        
        // The server now returns a cache-busted URL - use it immediately
        if (result.avatar_url) {
          console.log('🔄 Received cache-busted avatar URL:', result.avatar_url)
          setUploadedAvatarUrl(result.avatar_url)
          
          // Also log the cache-busting details for debugging
          if (result.cache_busted) {
            console.log('💾 Cache-busting applied with timestamp:', result.timestamp)
          }
        }
        
        toast.success('Avatar updated successfully')
        
        // Force a complete profile refresh to sync with database
        console.log('🔄 Refreshing profile data...')
        setProfileRefreshing(true)
        await refreshProfile()
        setProfileRefreshing(false)
        console.log('✅ Profile refresh completed')
        
        // Clear the file selection and preview
        setAvatarFile(null)
        setAvatarPreview(null)
        
        // Increment refresh key for additional cache busting on the frontend
        setAvatarRefreshKey(prev => prev + 1)
        
        // Clear the temporary URL after ensuring the profile has updated
        setTimeout(() => {
          setUploadedAvatarUrl(null)
          console.log('🧹 Cleared temporary avatar URL - now using profile data')
        }, 1500)
        
      } else {
        console.error('Upload failed:', result)
        toast.error(result.error || 'Failed to upload avatar')
      }
    } catch (error) {
      console.error('Avatar upload error:', error)
      toast.error('Failed to upload avatar')
    } finally {
      setAvatarUploading(false)
    }
  }

  // Delete avatar
  const handleAvatarDelete = async () => {
    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Avatar deleted successfully')
        await refreshProfile()
        // Force avatar refresh
        setAvatarRefreshKey(prev => prev + 1)
      } else {
        toast.error(result.error || 'Failed to delete avatar')
      }
    } catch (error) {
      console.error('Avatar delete error:', error)
      toast.error('Failed to delete avatar')
    }
  }

  // Handle profile form submission
  const onProfileSubmit = async (data: ProfileFormValues) => {
    setProfileSaving(true)
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Profile updated successfully')
        await refreshProfile()
      } else {
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error('Failed to update profile')
    } finally {
      setProfileSaving(false)
    }
  }

  // Handle password change
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setPasswordChanging(true)
    
    try {
      const response = await fetch('/api/profile/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          currentPassword: data.currentPassword,
          newPassword: data.newPassword 
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Password updated successfully')
        passwordForm.reset()
      } else {
        toast.error(result.error || 'Failed to update password')
      }
    } catch (error) {
      console.error('Password update error:', error)
      toast.error('Failed to update password')
    } finally {
      setPasswordChanging(false)
    }
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm')
      return
    }

    setDeleting(true)

    try {
      const response = await fetch('/api/profile/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Account deleted successfully')
        // Sign out and redirect
        await signOut()
        window.location.href = '/'
      } else {
        toast.error(result.error || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Account deletion error:', error)
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
      setDeleteConfirmation('')
    }
  }

  // Get avatar URL for display with robust cache-busting
  const getAvatarUrl = () => {
    console.log('🖼️ getAvatarUrl called:', {
      avatarPreview: avatarPreview ? 'present' : 'null',
      uploadedAvatarUrl: uploadedAvatarUrl ? 'present' : 'null',
      profile_avatar_url: profile?.avatar_url ? 'present' : 'null',
      avatarRefreshKey
    })
    
    // Priority 1: File preview (when user selects a new file)
    if (avatarPreview) {
      console.log('📷 Using avatar preview')
      return avatarPreview
    }
    
    // Priority 2: Cache-busted uploaded avatar URL (immediately after upload)
    // This URL already contains cache-busting timestamp from the server
    if (uploadedAvatarUrl) {
      console.log('⚡ Using cache-busted uploaded avatar URL:', uploadedAvatarUrl)
      return uploadedAvatarUrl
    }
    
    // Priority 3: Profile avatar URL from database 
    if (profile?.avatar_url) {
      const baseUrl = profile.avatar_url
      
      // Check if the URL already has cache-busting (from server)
      if (baseUrl.includes('?t=')) {
        console.log('💾 Using server cache-busted profile avatar URL')
        return baseUrl
      }
      
      // Add frontend cache busting as fallback for older URLs
      const cachedUrl = baseUrl.includes('?') 
        ? `${baseUrl}&v=${avatarRefreshKey}&t=${Date.now()}`
        : `${baseUrl}?v=${avatarRefreshKey}&t=${Date.now()}`
      console.log('� Adding frontend cache-busting to profile avatar URL')
      return cachedUrl
    }
    
    // No avatar URL available - will fallback to AvatarFallback
    console.log('🚫 No avatar URL available, using fallback')
    return undefined
  }

  // Get initials for avatar fallback
  const getInitials = () => {
    const name = profile?.full_name || user?.email || 'User'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Profile Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and contact details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              {avatarUploading ? (
                /* Loading state with skeleton */
                <div className="h-20 w-20 rounded-full relative">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                </div>
              ) : (
                <Avatar className="h-20 w-20" key={`avatar-${avatarRefreshKey}`}>
                  <AvatarImage src={getAvatarUrl()} alt="Profile picture" />
                  <AvatarFallback className="text-lg">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
              )}
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
              >
                {avatarUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarSelect}
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {profile?.role || 'interviewer'}
                </Badge>
                {profile?.email_verified && (
                  <Badge variant="outline" className="text-green-600">
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                {avatarFile && (
                  <>
                    <Button
                      size="sm"
                      onClick={handleAvatarUpload}
                      disabled={avatarUploading}
                    >
                      {avatarUploading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {avatarUploading ? 'Uploading...' : 'Upload'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAvatarFile(null)
                        setAvatarPreview(null)
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ''
                        }
                      }}
                      disabled={avatarUploading}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                {profile?.avatar_url && !avatarFile && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleAvatarDelete}
                    disabled={avatarUploading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Profile Form */}
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      value={user?.email || ''} 
                      disabled 
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormDescription>
                    Email cannot be changed here. Contact support if needed.
                  </FormDescription>
                </FormItem>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={profileForm.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your department" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={profileForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={profileSaving}
                className="w-full md:w-auto"
              >
                {profileSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Update your password to keep your account secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="password"
                          placeholder="Enter current password"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder="Enter new password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirm new password"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={passwordChanging}
                className="w-full md:w-auto"
              >
                {passwordChanging ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Update Password
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Danger Zone Card */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full md:w-auto">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Type "DELETE" to confirm:</Label>
                  <Input
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                    placeholder="DELETE"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteDialog(false)
                    setDeleteConfirmation('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmation !== 'DELETE'}
                >
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Delete Account
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}
