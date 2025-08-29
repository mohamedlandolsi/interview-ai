"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { Menu, X, User, LogOut, Settings, BarChart3, FileText, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, company, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">          {/* Logo */}
          <div className="flex items-center">
            {company?.name ? (
              <>
                {company.logoUrl ? (
                  <Image 
                    src={company.logoUrl} 
                    alt={`${company.name} logo`}
                    width={32}
                    height={32}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <span className="text-sm font-bold text-primary-foreground">IQ</span>
                  </div>
                )}
                <span className="ml-2 text-xl font-bold text-foreground">{company.name}</span>
              </>
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-sm font-bold text-primary-foreground">IQ</span>
                </div>
                <span className="ml-2 text-xl font-bold text-foreground">InterQ</span>
              </>
            )}
          </div>          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:space-x-8">
            {!user ? (
              <>
                <a
                  href="#features"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Features
                </a>
                <a
                  href="#testimonials"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Testimonials
                </a>
                <a
                  href="#pricing"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Pricing
                </a>
                <a
                  href="#contact"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact
                </a>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Dashboard
                </Link>
                <Link
                  href="/interviews"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Interviews
                </Link>
                <Link
                  href="/templates"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Templates
                </Link>
                <Link
                  href="/results"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Results
                </Link>
              </>
            )}
          </nav>          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <ThemeToggle />
            {!loading && (
              <>
                {!user ? (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Get Started
                      </Button>
                    </Link>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                          <AvatarFallback className="text-xs">
                            {getInitials(profile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {profile?.full_name || "User"}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                          {profile?.company_name && (
                            <p className="text-xs leading-none text-muted-foreground">
                              {profile.company_name}
                            </p>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/interviews" className="flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          Interviews
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/templates" className="flex items-center">
                          <FileText className="mr-2 h-4 w-4" />
                          Templates
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/results" className="flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Results
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            {!loading && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || "User"} />
                      <AvatarFallback className="text-xs">
                        {getInitials(profile?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t">
              {!user ? (
                <>
                  <a
                    href="#features"
                    className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Features
                  </a>
                  <a
                    href="#testimonials"
                    className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Testimonials
                  </a>
                  <a
                    href="#pricing"
                    className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Pricing
                  </a>
                  <a
                    href="#contact"
                    className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Contact
                  </a>
                  <div className="px-3 py-2 space-y-2">
                    <Link href="/login" className="block">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/register" className="block">
                      <Button size="sm" className="w-full bg-primary hover:bg-primary/90">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/interviews"
                    className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Interviews
                  </Link>
                  <Link
                    href="/templates"
                    className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Templates
                  </Link>
                  <Link
                    href="/results"
                    className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Results
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    Settings
                  </Link>
                  <div className="px-3 py-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}