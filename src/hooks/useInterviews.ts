import { useState, useEffect } from 'react'

interface Interview {
  id: string
  candidateName: string
  candidateEmail: string
  position: string
  scheduledTime: string
  duration: number
  status: string
  interviewer: string
  progress: number
  transcript: string
  notes: string
  vapi_call_id?: string
  overall_score?: number
  analysis_score?: number
  started_at?: string
  completed_at?: string
}

interface UseInterviewsOptions {
  page?: number
  limit?: number
  search?: string
  position?: string
  status?: string
  interviewer?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseInterviewsReturn {
  interviews: Interview[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  refetch: () => Promise<void>
}

export function useInterviews(options: UseInterviewsOptions = {}): UseInterviewsReturn {
  const {
    page = 1,
    limit = 20,
    search = '',
    position = '',
    status = '',
    interviewer = '',
    autoRefresh = true,
    refreshInterval = 30000 // 30 seconds
  } = options

  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [debouncedSearch, setDebouncedSearch] = useState(search)

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 500)

    return () => clearTimeout(timer)
  }, [search])

  const fetchInterviews = async () => {
    try {
      setError(null)
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(position && position !== 'All Positions' && { position }),
        ...(status && status !== 'All Status' && { status }),
        ...(interviewer && interviewer !== 'All Interviewers' && { interviewer })
      })

      const response = await fetch(`/api/interviews?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch interviews: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setInterviews(data.interviews)
        setPagination(data.pagination)
      } else {
        throw new Error(data.error || 'Failed to fetch interviews')
      }
    } catch (err) {
      console.error('Error fetching interviews:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    setLoading(true)
    await fetchInterviews()
  }

  // Initial fetch and dependency updates
  useEffect(() => {
    setLoading(true)
    fetchInterviews()
  }, [page, limit, debouncedSearch, position, status, interviewer])

  // Auto-refresh for status updates
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // Only refresh if there are in-progress interviews
      const hasInProgressInterviews = interviews.some(
        interview => interview.status === 'in_progress'
      )
      
      if (hasInProgressInterviews) {
        fetchInterviews()
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, interviews])

  return {
    interviews,
    loading,
    error,
    pagination,
    refetch
  }
}

export type { Interview }
