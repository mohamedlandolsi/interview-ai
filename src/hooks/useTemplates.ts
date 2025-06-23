import { useState, useEffect, useCallback } from 'react'

export interface Template {
  id: string
  name: string
  description: string
  instruction?: string
  category: string
  questions: number
  duration: number
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  usageCount: number
  lastUsed: string
  isBuiltIn: boolean
  tags: string[]
  creator?: {
    id: string
    full_name: string | null
    role: string
  }
  created_at: string
  updated_at: string
  rawQuestions?: any[]
}

export interface TemplateFilters {
  search: string
  category: string
  difficulty: string
  type: 'all' | 'custom' | 'library'
}

interface UseTemplatesReturn {
  templates: Template[]
  loading: boolean
  error: string | null
  filters: TemplateFilters
  setFilters: (filters: Partial<TemplateFilters>) => void
  refreshTemplates: () => Promise<void>
  createTemplate: (template: Partial<Template>) => Promise<Template | null>
  updateTemplate: (id: string, template: Partial<Template>) => Promise<Template | null>
  deleteTemplate: (id: string) => Promise<boolean>
  duplicateTemplate: (id: string) => Promise<Template | null>
  getTemplate: (id: string) => Promise<Template | null>
}

export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<TemplateFilters>({
    search: '',
    category: 'All Categories',
    difficulty: 'All Levels',
    type: 'all'
  })

  const setFilters = useCallback((newFilters: Partial<TemplateFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.category && filters.category !== 'All Categories') {
        params.append('category', filters.category)
      }
      if (filters.difficulty && filters.difficulty !== 'All Levels') {
        params.append('difficulty', filters.difficulty)
      }
      params.append('type', filters.type)

      const response = await fetch(`/api/templates?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch templates: ${response.status}`)
      }

      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (err) {
      console.error('Error fetching templates:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch templates')
    } finally {
      setLoading(false)
    }
  }, [filters])

  const refreshTemplates = useCallback(async () => {
    await fetchTemplates()
  }, [fetchTemplates])

  const createTemplate = useCallback(async (templateData: Partial<Template>): Promise<Template | null> => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: templateData.name,
          description: templateData.description,
          questions: templateData.rawQuestions || []
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to create template: ${response.status}`)
      }

      const data = await response.json()
      await refreshTemplates() // Refresh the list
      return data.template
    } catch (err) {
      console.error('Error creating template:', err)
      setError(err instanceof Error ? err.message : 'Failed to create template')
      return null
    }
  }, [refreshTemplates])

  const updateTemplate = useCallback(async (id: string, templateData: Partial<Template>): Promise<Template | null> => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: templateData.name,
          description: templateData.description,
          questions: templateData.rawQuestions
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update template: ${response.status}`)
      }

      const data = await response.json()
      await refreshTemplates() // Refresh the list
      return data.template
    } catch (err) {
      console.error('Error updating template:', err)
      setError(err instanceof Error ? err.message : 'Failed to update template')
      return null
    }
  }, [refreshTemplates])

  const deleteTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete template: ${response.status}`)
      }

      await refreshTemplates() // Refresh the list
      return true
    } catch (err) {
      console.error('Error deleting template:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete template')
      return false
    }
  }, [refreshTemplates])

  const duplicateTemplate = useCallback(async (id: string): Promise<Template | null> => {
    try {
      const response = await fetch(`/api/templates/${id}/duplicate`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(`Failed to duplicate template: ${response.status}`)
      }

      const data = await response.json()
      await refreshTemplates() // Refresh the list
      return data.template
    } catch (err) {
      console.error('Error duplicating template:', err)
      setError(err instanceof Error ? err.message : 'Failed to duplicate template')
      return null
    }
  }, [refreshTemplates])

  const getTemplate = useCallback(async (id: string): Promise<Template | null> => {
    try {
      const response = await fetch(`/api/templates/${id}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch template: ${response.status}`)
      }

      const data = await response.json()
      return data.template
    } catch (err) {
      console.error('Error fetching template:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch template')
      return null
    }
  }, [])

  // Fetch templates when filters change
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  return {
    templates,
    loading,
    error,
    filters,
    setFilters,
    refreshTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    getTemplate
  }
}
