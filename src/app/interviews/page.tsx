"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Play, 
  CheckCircle, 
  XCircle, 
  MoreHorizontal,
  Download,
  Trash2,
  RefreshCw,
  Eye,
  FileText,
  Loader2,
  Share,
  Copy,
  Mail,
  Timer,
  Star,
  Target,
  TrendingUp,
  MessageSquare
} from "lucide-react"
import { DashboardLayout } from "@/components/Layout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useTemplates } from "@/hooks/useTemplates"
import { useInterviews } from "@/hooks/useInterviews"

// Status badge component
const getStatusBadge = (status: string) => {
  switch (status) {
    case "Scheduled":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Scheduled</Badge>
    case "In Progress":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">In Progress</Badge>
    case "Completed":
      return <Badge variant="secondary" className="bg-green-100 text-green-700">Completed</Badge>
    case "Cancelled":
      return <Badge variant="secondary" className="bg-red-100 text-red-700">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Template Selection Dialog Component
const TemplateSelectionDialog = ({ isOpen, onClose, onSelectTemplate, onGenerateLink }: {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (templateId: string | null) => void
  onGenerateLink: (templateId: string | null) => void
}) => {
  const { templates, loading, error, refreshTemplates } = useTemplates()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    if (isOpen) {
      refreshTemplates()
    }
  }, [isOpen, refreshTemplates])

  const categories = ["All", ...Array.from(new Set(templates.map(t => t.category)))]
  
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleStartInterview = (templateId: string) => {
    onSelectTemplate(templateId)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Select Interview Template</DialogTitle>
          <DialogDescription>
            Choose a template for your live interview or start a general interview
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* General Interview Option */}
          <Card className="border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
                onClick={() => onGenerateLink(null)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Share className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">General Interview</h3>
                    <p className="text-sm text-muted-foreground">Generate a link for an open-ended interview without a specific template</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onGenerateLink(null)
                  }}
                >
                  <Share className="w-4 h-4 mr-1" />
                  Generate Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Templates List */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Loading templates...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-600">
                <p>Error loading templates: {error}</p>
              </div>
            )}

            {!loading && !error && filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-8 h-8 mx-auto mb-2" />
                <p>No templates found</p>
              </div>
            )}

            {filteredTemplates.map((template) => (
              <Card key={template.id} 
                    className="hover:shadow-md transition-shadow border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="secondary">{template.category}</Badge>
                        <Badge variant="outline">{template.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{template.questions} questions</span>
                        <span>{template.duration} min</span>
                        <span>Used {template.usageCount} times</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onGenerateLink(template.id)}
                      >
                        <Share className="w-4 h-4 mr-1" />
                        Generate Link
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Link Generation Dialog Component
const LinkGenerationDialog = ({ isOpen, onClose, templateId }: {
  isOpen: boolean
  onClose: () => void
  templateId: string | null
}) => {
  const { getTemplate } = useTemplates()
  const [templateData, setTemplateData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [position, setPosition] = useState("")
  const [duration, setDuration] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (isOpen && templateId) {
      const fetchTemplate = async () => {
        setLoading(true)
        try {
          const template = await getTemplate(templateId)
          setTemplateData(template)
          setDuration(template.duration?.toString() || "30")
        } catch (error) {
          console.error('Error fetching template:', error)
        } finally {
          setLoading(false)
        }
      }

      fetchTemplate()
    } else if (isOpen) {
      // Reset form for general interviews
      setTemplateData(null)
      setDuration("30")
    }
    
    // Reset form when dialog opens
    if (isOpen) {
      setPosition("")
      setDescription("")
      setGeneratedLink("")
    }
  }, [templateId, getTemplate, isOpen])

  const generateInterviewLink = async () => {
    if (!position.trim()) {
      console.error("Position is required")
      return
    }
    
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/interviews/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: templateId,
          position: position.trim(),
          duration: duration ? parseInt(duration) : undefined,
          description: description.trim() || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const fullLink = data.session.link
        setGeneratedLink(fullLink)
        console.log("Link Generated Successfully: Interview link has been created and is ready to share.")
      } else {
        const errorData = await response.json()
        if (errorData.code === 'TEMPLATE_NOT_FOUND') {
          console.error("Template Not Found: The selected template could not be found. Please try again.")
        } else if (errorData.code === 'TEMPLATE_ACCESS_DENIED') {
          console.error("Access Denied: You don't have permission to use this template.")
        }
      }
    } catch (error) {
      console.error("Error: Failed to generate interview link. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink)
      console.log("Copied! Interview link copied to clipboard.")
    } catch (error) {
      console.error("Error: Failed to copy link. Please copy manually.")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Interview Link</DialogTitle>
          <DialogDescription>
            Create a shareable link for candidates to join the interview
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading template details...</span>
            </div>
          )}

          {templateData && !loading && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{templateData.name}</CardTitle>
                <CardDescription>{templateData.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{templateData.questions} questions</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{templateData.duration} minutes</span>
                  </div>
                  <Badge variant="secondary">{templateData.category}</Badge>
                  <Badge variant="outline">{templateData.difficulty}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {!templateId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">General Interview</CardTitle>
                <CardDescription>
                  Open-ended interview without a specific template. The AI will adapt questions based on the conversation.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {generatedLink ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Interview Link</label>
                <div className="mt-1 flex gap-2">
                  <Input 
                    value={generatedLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button 
                    variant="outline"
                    onClick={copyToClipboard}
                    className="px-3"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Instructions for Candidates:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Click the link to join the interview</li>
                  <li>• Ensure you have a stable internet connection</li>
                  <li>• Use a quiet environment for the best experience</li>
                  <li>• Have your microphone ready</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setGeneratedLink("")
                  setPosition("")
                  setDescription("")
                }}>
                  Generate New Link
                </Button>
                <Button onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Interview Details Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Position <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Software Engineer, Product Manager"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Duration (minutes)
                  </label>
                  <Input
                    type="number"
                    placeholder="30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="10"
                    max="120"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Description (optional)
                  </label>
                  <Input
                    placeholder="Additional notes about this interview"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={generateInterviewLink}
                  disabled={isGenerating || !position.trim()}
                  className="flex-1"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Share className="w-4 h-4 mr-2" />
                      Generate Link
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function InterviewsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [positionFilter, setPositionFilter] = useState("All Positions")
  const [interviewerFilter, setInterviewerFilter] = useState("All Interviewers")
  const [selectedInterviews, setSelectedInterviews] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isLinkGenerationDialogOpen, setIsLinkGenerationDialogOpen] = useState(false)
  const [selectedTemplateForLink, setSelectedTemplateForLink] = useState<string | null>(null)
  
  // Delete-related state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [interviewToDelete, setInterviewToDelete] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // View-related state
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [interviewToView, setInterviewToView] = useState<any>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const itemsPerPage = 6

  // Fetch interviews data dynamically
  const { 
    interviews, 
    loading: interviewsLoading, 
    error: interviewsError,
    pagination,
    refetch 
  } = useInterviews({
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    position: positionFilter,
    status: statusFilter,
    interviewer: interviewerFilter,
    autoRefresh: true,
    refreshInterval: 30000 // Refresh every 30 seconds to update status
  })

  // Handler functions
  const handleTemplateSelection = (templateId: string | null) => {
    if (templateId) {
      // Navigate to conduct page with template ID
      window.location.href = `/interviews/conduct?template=${templateId}`
    } else {
      // Navigate to conduct page for general interview
      window.location.href = '/interviews/conduct'
    }
  }
  
  const handleGenerateLink = (templateId: string | null) => {
    // Open link generation dialog
    setSelectedTemplateForLink(templateId)
    setIsLinkGenerationDialogOpen(true)
    setIsTemplateDialogOpen(false)
  }

  // Get dynamic positions and interviewers from the loaded interviews
  const uniquePositions = ["All Positions", ...Array.from(new Set(interviews.map(i => i.position)))]
  const uniqueInterviewers = ["All Interviewers", ...Array.from(new Set(interviews.map(i => i.interviewer)))]
  
  const handleSelectInterview = (interviewId: string) => {
    setSelectedInterviews(prev => 
      prev.includes(interviewId) 
        ? prev.filter(id => id !== interviewId)
        : [...prev, interviewId]
    )
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for interviews:`, selectedInterviews)
    // Here you would implement the actual bulk actions
    setSelectedInterviews([])
  }

  // Delete functionality
  const handleDeleteInterview = (interview: { id: string; candidateName?: string; position: string; status: string }) => {
    setInterviewToDelete(interview)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteInterview = async () => {
    if (!interviewToDelete) return
    
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/interviews/${interviewToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        console.log("Interview deleted successfully")
        setIsDeleteDialogOpen(false)
        setInterviewToDelete(null)
        // Refresh the interviews list
        refetch()
      } else {
        const errorData = await response.json()
        console.error("Error deleting interview:", errorData.error)
        
        if (errorData.code === 'INTERVIEW_IN_PROGRESS') {
          console.error("Cannot delete an interview that is currently in progress")
        } else {
          console.error("Failed to delete interview. Please try again.")
        }
      }
    } catch (error) {
      console.error("Error deleting interview:", error)
      console.error("Failed to delete interview. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const cancelDeleteInterview = () => {
    setIsDeleteDialogOpen(false)
    setInterviewToDelete(null)
  }

  // View functionality
  const handleViewInterview = async (interview: { id: string }) => {
    setInterviewToView(interview)
    setIsViewDialogOpen(true)
    setIsLoadingDetails(true)
    
    try {
      // Fetch detailed interview data
      const response = await fetch(`/api/interviews/${interview.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setInterviewToView(data.session)
      } else {
        console.error("Failed to fetch interview details")
        // Use the basic interview data if API fails
        setInterviewToView(interview)
      }
    } catch (error) {
      console.error("Error fetching interview details:", error)
      // Use the basic interview data if API fails
      setInterviewToView(interview)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const closeViewDialog = () => {
    setIsViewDialogOpen(false)
    setInterviewToView(null)
    setIsLoadingDetails(false)
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Interviews</h1>
              <p className="text-muted-foreground">
                Manage and monitor all candidate interviews
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.location.href = '/interviews/demo'}>
                <Play className="w-4 h-4 mr-2" />
                Demo Interview
              </Button>
              <Button onClick={() => setIsTemplateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Start Live Interview
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search candidates, positions, or emails..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={refetch}
                    disabled={interviewsLoading}
                    className="px-3"
                  >
                    <RefreshCw className={`w-4 h-4 ${interviewsLoading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Status">All Status</SelectItem>
                      <SelectItem value="Scheduled">Scheduled</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={positionFilter} onValueChange={setPositionFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {uniquePositions.map(position => (
                        <SelectItem key={position} value={position}>{position}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={interviewerFilter} onValueChange={setInterviewerFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueInterviewers.map(interviewer => (
                        <SelectItem key={interviewer} value={interviewer}>{interviewer}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedInterviews.length > 0 && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {selectedInterviews.length} interview(s) selected
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleBulkAction('export')}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Export
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleBulkAction('delete')}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interviews List */}
          <div className="space-y-4">
            {/* Loading State */}
            {interviewsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                    <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">Loading Interviews</p>
                    <p className="text-sm text-muted-foreground">Fetching the latest interview data...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error State */}
            {interviewsError && (
              <Card className="border-destructive/50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
                      <XCircle className="w-8 h-8 text-destructive" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-destructive">Error Loading Interviews</p>
                      <p className="text-sm text-muted-foreground">{interviewsError}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={refetch}
                      className="mt-4"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!interviewsLoading && !interviewsError && interviews.length === 0 && (
              <Card>
                <CardContent className="pt-12 pb-12">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted">
                      <Calendar className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">No Interviews Found</p>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm || statusFilter !== "All Status" || positionFilter !== "All Positions" || interviewerFilter !== "All Interviewers"
                          ? "No interviews match your current filters. Try adjusting your search criteria."
                          : "Get started by creating your first interview."
                        }
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      {(searchTerm || statusFilter !== "All Status" || positionFilter !== "All Positions" || interviewerFilter !== "All Interviewers") && (
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSearchTerm("")
                            setStatusFilter("All Status")
                            setPositionFilter("All Positions")
                            setInterviewerFilter("All Interviewers")
                          }}
                        >
                          Clear Filters
                        </Button>
                      )}
                      <Button onClick={() => setIsTemplateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Start Interview
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Interviews Grid */}
            {!interviewsLoading && !interviewsError && interviews.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {interviews.map((interview) => (
                  <Card key={interview.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedInterviews.includes(interview.id)}
                              onCheckedChange={() => handleSelectInterview(interview.id)}
                              className="mt-0.5"
                            />
                            <CardTitle className="text-lg leading-none">
                              {interview.candidateName}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-sm">
                            {interview.position}
                          </CardDescription>
                        </div>
                        {getStatusBadge(interview.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{interview.interviewer}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(interview.scheduledTime).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>{new Date(interview.scheduledTime).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewInterview(interview)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="px-2">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewInterview(interview)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteInterview(interview)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!interviewsLoading && !interviewsError && interviews.length > 0 && pagination && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} interviews
              </p>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => pagination.page > 1 && setCurrentPage(pagination.page - 1)}
                      className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={page === pagination.page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => pagination.page < pagination.totalPages && setCurrentPage(pagination.page + 1)}
                      className={pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Template Selection Dialog */}
          <TemplateSelectionDialog
            isOpen={isTemplateDialogOpen}
            onClose={() => setIsTemplateDialogOpen(false)}
            onSelectTemplate={handleTemplateSelection}
            onGenerateLink={handleGenerateLink}
          />

          {/* Link Generation Dialog */}
          <LinkGenerationDialog
            isOpen={isLinkGenerationDialogOpen}
            onClose={() => setIsLinkGenerationDialogOpen(false)}
            templateId={selectedTemplateForLink}
          />

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete Interview</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this interview? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              
              {interviewToDelete && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium">Candidate:</span> {interviewToDelete.candidateName || 'Not specified'}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Position:</span> {interviewToDelete.position}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Status:</span> {interviewToDelete.status}
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={cancelDeleteInterview}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={confirmDeleteInterview}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* View Interview Details Dialog */}
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Interview Details
                </DialogTitle>
                <DialogDescription>
                  Complete information about this interview session
                </DialogDescription>
              </DialogHeader>
              
              {isLoadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Loading interview details...</span>
                </div>
              ) : interviewToView ? (
                <div className="space-y-6 overflow-y-auto max-h-[70vh]">
                  {/* Basic Information */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Candidate Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Name:</span>
                          <span>{interviewToView.candidateName || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Email:</span>
                          <span>{interviewToView.candidateEmail || 'Not provided'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Position:</span>
                          <span>{interviewToView.position}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          Interview Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Status:</span>
                          {getStatusBadge(interviewToView.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Duration:</span>
                          <span>{interviewToView.duration} minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Created:</span>
                          <span>{new Date(interviewToView.createdAt).toLocaleDateString()}</span>
                        </div>
                        {interviewToView.startedAt && (
                          <div className="flex items-center gap-2">
                            <Play className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Started:</span>
                            <span>{new Date(interviewToView.startedAt).toLocaleString()}</span>
                          </div>
                        )}
                        {interviewToView.completedAt && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">Completed:</span>
                            <span>{new Date(interviewToView.completedAt).toLocaleString()}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Template Information */}
                  {interviewToView.template && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Interview Template
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Template:</span>
                            <p className="text-sm text-muted-foreground mt-1">{interviewToView.template.title || interviewToView.template.name}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge variant="secondary">{interviewToView.template.category}</Badge>
                            <Badge variant="outline">{interviewToView.template.difficulty}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Performance Metrics */}
                  {interviewToView.overallScore !== null && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Performance Summary
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium">Overall Score:</span>
                            <Badge variant={interviewToView.overallScore >= 80 ? "default" : interviewToView.overallScore >= 60 ? "secondary" : "destructive"}>
                              {interviewToView.overallScore}%
                            </Badge>
                          </div>
                        </div>
                        
                        {interviewToView.analysis_score && (
                          <div className="space-y-2">
                            <span className="font-medium">AI Analysis Score:</span>
                            <Progress value={interviewToView.analysis_score} className="w-full" />
                            <p className="text-sm text-muted-foreground">{interviewToView.analysis_score}% based on AI evaluation</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Insights */}
                  {(interviewToView.strengths || interviewToView.areas_for_improvement || interviewToView.key_insights) && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <MessageSquare className="w-5 h-5" />
                          AI Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {interviewToView.strengths && (
                          <div>
                            <h4 className="font-medium text-green-600 mb-2">Strengths</h4>
                            <p className="text-sm text-muted-foreground">{interviewToView.strengths}</p>
                          </div>
                        )}
                        
                        {interviewToView.areas_for_improvement && (
                          <div>
                            <h4 className="font-medium text-orange-600 mb-2">Areas for Improvement</h4>
                            <p className="text-sm text-muted-foreground">{interviewToView.areas_for_improvement}</p>
                          </div>
                        )}
                        
                        {interviewToView.key_insights && (
                          <div>
                            <h4 className="font-medium text-blue-600 mb-2">Key Insights</h4>
                            <p className="text-sm text-muted-foreground">{interviewToView.key_insights}</p>
                          </div>
                        )}
                        
                        {interviewToView.hiring_recommendation && (
                          <div>
                            <h4 className="font-medium mb-2">Hiring Recommendation</h4>
                            <Badge variant={interviewToView.hiring_recommendation === 'HIRE' ? "default" : interviewToView.hiring_recommendation === 'CONSIDER' ? "secondary" : "destructive"}>
                              {interviewToView.hiring_recommendation}
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Technical Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Technical Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Interview ID:</span>
                          <p className="text-muted-foreground font-mono text-xs">{interviewToView.id}</p>
                        </div>
                        {interviewToView.template && (
                          <div>
                            <span className="font-medium">Template ID:</span>
                            <p className="text-muted-foreground font-mono text-xs">{interviewToView.templateId}</p>
                          </div>
                        )}
                      </div>
                      {interviewToView.vapi_call_id && (
                        <div>
                          <span className="font-medium">Vapi Call ID:</span>
                          <p className="text-muted-foreground font-mono text-xs">{interviewToView.vapi_call_id}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No interview details available</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={closeViewDialog}>
                  Close
                </Button>
                {interviewToView?.status === 'completed' && (
                  <Button variant="default">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
