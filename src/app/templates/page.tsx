"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Plus, 
  Search,
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react"
import { TemplateEditor } from "@/components/templates/TemplateEditor"
import { TemplatePreview } from "@/components/templates/TemplatePreview"
import { TemplateCard } from "@/components/templates/TemplateCard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { DashboardLayout } from "@/components/Layout"
import { DashboardRoute } from "@/components/auth/ProtectedRoute"
import { useTemplates } from "@/hooks/useTemplates"
import { useDebounce } from "../../hooks/useDebounce"

const categories = ["All Categories", "Technical", "Leadership", "Creative", "Sales", "Customer Service", "General"]
const difficulties = ["All Levels", "Beginner", "Intermediate", "Advanced"]

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [localSearchTerm, setLocalSearchTerm] = useState("")

  // Use the templates hook
  const {
    templates,
    loading,
    error,
    filters,
    setFilters,
    refreshTemplates,
    deleteTemplate,
    duplicateTemplate
  } = useTemplates()

  // Debounce search term to avoid too many API calls
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300)

  // Update filters when debounced search term changes
  useEffect(() => {
    setFilters({ search: debouncedSearchTerm })
  }, [debouncedSearchTerm, setFilters])

  // Update filters when tab changes
  useEffect(() => {
    setFilters({ type: activeTab as 'all' | 'custom' | 'library' })
  }, [activeTab, setFilters])

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    setIsEditing(true)
    setIsPreviewing(false)
  }

  const handlePreviewTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    setIsPreviewing(true)
    setIsEditing(false)
  }

  const handleDuplicateTemplate = async (templateId: string) => {
    const duplicated = await duplicateTemplate(templateId)
    if (duplicated) {
      console.log("Template duplicated successfully")
    }
  }
  const handleDeleteTemplate = async (templateId: string) => {
    const deleted = await deleteTemplate(templateId)
    if (deleted) {
      console.log("Template deleted successfully")
    }
  }

  const handleCreateNew = () => {
    setSelectedTemplate(null)
    setIsEditing(true)
    setIsPreviewing(false)
  }

  const handleCategoryChange = (category: string) => {
    setFilters({ category })
  }

  const handleDifficultyChange = (difficulty: string) => {
    setFilters({ difficulty })
  }

  const clearAllFilters = () => {
    setLocalSearchTerm("")
    setFilters({ 
      search: "", 
      category: "All Categories", 
      difficulty: "All Levels" 
    })
  }

  if (isEditing) {
    return (
      <TemplateEditor
        templateId={selectedTemplate}
        onBack={() => {
          setIsEditing(false)
          refreshTemplates() // Refresh templates when coming back from editor
        }}
        onSave={() => {
          setIsEditing(false)
          refreshTemplates() // Refresh templates after saving
        }}
      />
    )
  }

  if (isPreviewing && selectedTemplate) {
    return (
      <TemplatePreview
        templateId={selectedTemplate}
        onBack={() => setIsPreviewing(false)}
        onEdit={() => {
          setIsPreviewing(false)
          setIsEditing(true)
        }}
      />
    )
  }

  return (
    <DashboardRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Interview Templates</h1>
              <p className="text-muted-foreground">
                Create and manage interview question templates for different roles
              </p>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search templates, descriptions, or tags..."
                      value={localSearchTerm}
                      onChange={(e) => setLocalSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={filters.category} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="w-full sm:w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filters.difficulty} onValueChange={handleDifficultyChange}>
                    <SelectTrigger className="w-full sm:w-[140px]">
                      <SelectValue placeholder="Difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map(difficulty => (
                        <SelectItem key={difficulty} value={difficulty}>{difficulty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Templates Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Templates</TabsTrigger>
              <TabsTrigger value="custom">My Templates</TabsTrigger>
              <TabsTrigger value="library">Template Library</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading templates...</span>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && templates.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No templates found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === 'custom' 
                      ? "You haven't created any templates yet."
                      : activeTab === 'library'
                      ? "No library templates available."
                      : "No templates match your current filters."
                    }
                  </p>
                  <div className="flex gap-2 justify-center">
                    {activeTab === 'custom' && (
                      <Button onClick={handleCreateNew}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Template
                      </Button>
                    )}
                    {(localSearchTerm || filters.category !== 'All Categories' || filters.difficulty !== 'All Levels') && (
                      <Button variant="outline" onClick={clearAllFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Template Grid */}
              {!loading && templates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onPreview={handlePreviewTemplate}
                      onEdit={handleEditTemplate}
                      onDuplicate={handleDuplicateTemplate}
                      onDelete={handleDeleteTemplate}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </DashboardRoute>
  )
}
