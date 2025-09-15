import { useState, useEffect } from 'react'

export interface ActivityItem {
  id: string
  type: string
  title: string
  description: string
  time: string
  icon: string
  iconColor: string
}

export interface ActivityResponse {
  success: boolean
  activities: ActivityItem[]
}

export function useRecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActivities = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/dashboard/recent-activity', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.status}`)
      }

      const data: ActivityResponse = await response.json()
      
      if (data.success) {
        setActivities(data.activities)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activities'
      setError(errorMessage)
      console.error('Error fetching recent activities:', err)
      
      // Set empty array on error
      setActivities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivities()
  }, [])

  const refetch = () => {
    fetchActivities()
  }

  return {
    activities,
    loading,
    error,
    refetch
  }
}