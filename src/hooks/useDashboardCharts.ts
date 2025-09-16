"use client"

import { useEffect, useState } from 'react'

export interface ChartData {
  interviewTrends: Array<{
    month: string
    interviews: number
    completed: number
    successRate: number
  }>
  weeklyTrends: Array<{
    week: string
    interviews: number
    completed: number
    successRate: number
  }>
  statusDistribution: Array<{
    status: string
    count: number
  }>
  dailyActivity: Array<{
    date: string
    interviews: number
  }>
}

interface UseDashboardChartsReturn {
  data: ChartData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboardCharts(): UseDashboardChartsReturn {
  const [data, setData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChartData = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard/charts', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch chart data: ${response.status}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch chart data')
      }

      setData(result.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Chart data fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChartData()
  }, [])

  return {
    data,
    loading,
    error,
    refetch: fetchChartData
  }
}