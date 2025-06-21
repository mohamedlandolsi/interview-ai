'use client'

import { Suspense } from 'react'
import { InterviewResultsComponent } from '@/components/results/InterviewResultsComponent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardLayout } from '@/components/Layout'
import { DashboardRoute } from '@/components/auth/ProtectedRoute'

function ResultsPageContent() {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Interview Results</h1>
          <p className="text-gray-600">
            View detailed analysis and insights from your interview session.
          </p>
        </div>
        
        <Suspense fallback={<ResultsPageSkeleton />}>
          <InterviewResultsComponent />
        </Suspense>
      </div>
    </DashboardLayout>
  )
}

function ResultsPageSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
          <Skeleton className="h-32" />
          <Skeleton className="h-24" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <DashboardRoute>
      <ResultsPageContent />
    </DashboardRoute>
  )
}
