"use client"

import { Bell, ChevronDown, Settings, LogOut, User, Menu } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/contexts/AuthContext"

interface DashboardHeaderProps {
  onMenuClick?: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { user, profile, company, loading, signOut } = useAuth()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const getDisplayName = () => {
    if (profile?.full_name) return profile.full_name
    if (user?.email) return user.email.split('@')[0]
    return 'User'
  }

  const getAvatarFallback = () => {
    const name = getDisplayName()
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Left side - Menu button (mobile) + Logo */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <div className="flex items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">IQ</span>
            </div>
            <span className="ml-2 text-xl font-bold text-foreground hidden sm:block">InterQ</span>
          </div>
        </div>

        {/* Right side - User info and actions */}
        <div className="flex items-center space-x-2 md:space-x-4">          {/* Company Name */}
          {loading ? (
            <div className="hidden md:block h-4 w-24 bg-muted animate-pulse rounded" />
          ) : (
            <div className="hidden md:block text-sm text-muted-foreground">
              {company?.name || profile?.company_name || 'Your Company'}
            </div>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4 md:h-5 md:w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 md:h-5 md:w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  3
                </Badge>
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">New interview scheduled</p>
                  <p className="text-xs text-muted-foreground">
                    John Doe - Frontend Developer position
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Interview completed</p>
                  <p className="text-xs text-muted-foreground">
                    Jane Smith - Backend Developer position
                  </p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">System update available</p>
                  <p className="text-xs text-muted-foreground">
                    New features and improvements
                  </p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {loading ? (
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
                </Button>
              ) : (
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={getDisplayName()} />
                    <AvatarFallback className="text-xs">
                      {getAvatarFallback()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">                  {loading ? (
                    <>
                      <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-32 bg-muted animate-pulse rounded" />
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium leading-none">
                        {getDisplayName()}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>                      {profile?.department && (
                        <p className="text-xs leading-none text-muted-foreground">
                          {profile.department}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleSignOut}
                disabled={isSigningOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}