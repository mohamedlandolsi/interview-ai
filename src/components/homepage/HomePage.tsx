"use client"

import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { HomeHeader } from "./HomeHeader"
import { HomeHero } from "./HomeHero"
import { HomeFeatures } from "./HomeFeatures"
import { HomeHowItWorks } from "./HomeHowItWorks"
import { HomeStats } from "./HomeStats"
import { HomeCTA } from "./HomeCTA"
import { HomeFooter } from "./HomeFooter"

export function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Only show homepage if user is not authenticated
  if (user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="w-full">
      <HomeHeader />
      <HomeHero />
      <HomeFeatures />
      <HomeHowItWorks />
      <HomeStats />
      <HomeCTA />
      <HomeFooter />
    </div>
  )
}