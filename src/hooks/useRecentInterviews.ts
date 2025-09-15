"use client"

import { useEffect, useState } from 'react'

export interface RecentInterview {
  id: string
  sessionId: string
  candidateName?: string
  candidateEmail: string
  scheduledFor?: string
  createdAt: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  overallScore: number | null
  template?: {
    title: string
  }
}

export interface RecentInterviewsData {
  interviews: RecentInterview[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

interface UseRecentInterviewsReturn {
  interviews: RecentInterview[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  nextPage: () => void
  prevPage: () => void
  retry: () => void
}

interface UseRecentInterviewsOptions {
  limit?: number
}

export function useRecentInterviews(options: UseRecentInterviewsOptions = {}): UseRecentInterviewsReturn {
  const { limit = 5 } = options
  const [data, setData] = useState<RecentInterviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const fetchInterviews = async () => {
    try {
      setLoading(true)
      setError(null)

      const offset = (page - 1) * limit
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString()
      })

      const response = await fetch(`/api/dashboard/recent-interviews?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch recent interviews: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch recent interviews')
      }

      setData(result.data)
    } catch (err) {
      console.error('Recent interviews fetch error:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const nextPage = () => {
    if (data?.pagination.hasMore) {
      setPage(prev => prev + 1)
    }
  }

  const prevPage = () => {
    if (page > 1) {
      setPage(prev => prev - 1)
    }
  }

  const retry = () => {
    fetchInterviews()
  }

  useEffect(() => {
    fetchInterviews()
  }, [page, limit])

  // Calculate pagination data
  const totalPages = data ? Math.ceil(data.pagination.total / limit) : 0
  const hasNextPage = data?.pagination.hasMore || false
  const hasPreviousPage = page > 1

  return {
    interviews: data?.interviews || [],
    loading,
    error,
    pagination: {
      total: data?.pagination.total || 0,
      page,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    },
    nextPage,
    prevPage,
    retry,
  }
}
