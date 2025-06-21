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
  DialogTrigger,
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
import {   Plus, 
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
  Copy
} from "lucide-react"
import { DashboardLayout } from "@/components/Layout"
import { DashboardRoute } from "@/components/auth/ProtectedRoute"
import { useTemplates } from "@/hooks/useTemplates"

// Mock data
const interviews = [
  {
    id: "INT-001",
    candidateName: "Sarah Wilson",
    candidateEmail: "sarah.wilson@email.com",
    position: "Frontend Developer",
    scheduledTime: "2024-06-17T10:00:00",
    duration: 45,
    status: "scheduled",
    interviewer: "John Smith",
    progress: 0,
    transcript: "Interview hasn't started yet.",
    notes: "Strong portfolio, experience with React and TypeScript"
  },
  {
    id: "INT-002",
    candidateName: "Michael Chen",
    candidateEmail: "michael.chen@email.com",
    position: "Product Manager",
    scheduledTime: "2024-06-17T14:30:00",
    duration: 60,
    status: "in_progress",
    interviewer: "Jane Doe",
    progress: 65,
    transcript: "Interviewer: Can you tell me about your experience with product roadmaps?\n\nCandidate: I've been working with product roadmaps for the past 3 years...",
    notes: "Good communication skills, strong product sense"
  },
  {
    id: "INT-003",
    candidateName: "Emma Thompson",
    candidateEmail: "emma.thompson@email.com",
    position: "Backend Developer",
    scheduledTime: "2024-06-16T09:00:00",
    duration: 50,
    status: "completed",
    interviewer: "Mike Johnson",
    progress: 100,
    transcript: "Full interview transcript available. Candidate demonstrated strong technical skills...",
    notes: "Excellent technical knowledge, good problem-solving approach"
  },
  {
    id: "INT-004",
    candidateName: "James Rodriguez",
    candidateEmail: "james.rodriguez@email.com",
    position: "UI/UX Designer",
    scheduledTime: "2024-06-16T16:00:00",
    duration: 40,
    status: "failed",
    interviewer: "Sarah Lee",
    progress: 100,
    transcript: "Interview completed but candidate did not meet requirements...",
    notes: "Portfolio needs improvement, limited experience with design systems"
  },
  {
    id: "INT-005",
    candidateName: "Lisa Anderson",
    candidateEmail: "lisa.anderson@email.com",
    position: "Data Scientist",
    scheduledTime: "2024-06-18T11:00:00",
    duration: 55,
    status: "scheduled",
    interviewer: "David Wilson",
    progress: 0,
    transcript: "Interview scheduled for tomorrow.",
    notes: "PhD in Statistics, 5 years industry experience"
  },
  {
    id: "INT-006",
    candidateName: "Robert Kim",
    candidateEmail: "robert.kim@email.com",
    position: "DevOps Engineer",
    scheduledTime: "2024-06-17T15:30:00",
    duration: 45,
    status: "in_progress",
    interviewer: "Alex Chen",
    progress: 30,
    transcript: "Interview in progress. Discussing Docker and Kubernetes experience...",
    notes: "Strong infrastructure background, AWS certified"
  }
]

const positions = ["All Positions", "Frontend Developer", "Backend Developer", "Product Manager", "UI/UX Designer", "Data Scientist", "DevOps Engineer"]
const interviewers = ["All Interviewers", "John Smith", "Jane Doe", "Mike Johnson", "Sarah Lee", "David Wilson", "Alex Chen"]
const statuses = ["All Status", "scheduled", "in_progress", "completed", "failed"]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "scheduled":
      return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100"><Clock className="w-3 h-3 mr-1" />Scheduled</Badge>
    case "in_progress":
      return <Badge variant="warning" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100"><Play className="w-3 h-3 mr-1" />In Progress</Badge>
    case "completed":
      return <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>
    case "failed":
      return <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString)
  return {
    date: date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }),
    time: date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }
}

// Template Selection Dialog Component
const TemplateSelectionDialog = ({ isOpen, onClose, onSelectTemplate, onGenerateLink }: {
  isOpen: boolean
  onClose: () => void
  onSelectTemplate: (templateId: string | null) => void
  onGenerateLink: (templateId: string) => void
}) => {
  const { templates, loading, error } = useTemplates()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All Categories" || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Get unique categories
  const categories = ["All Categories", ...Array.from(new Set(templates.map(t => t.category)))]

  const handleStartInterview = (templateId: string | null) => {
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
                onClick={() => handleStartInterview(null)}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Play className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">General Interview</h3>
                  <p className="text-sm text-muted-foreground">Start an open-ended interview without a specific template</p>
                </div>
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
            )}            {filteredTemplates.map((template) => (
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
                    <div className="flex flex-col gap-2">                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => onSelectTemplate(template.id)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        Start Now
                      </Button>
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
  const [position, setPosition] = useState("")
  const [duration, setDuration] = useState("")
  const [description, setDescription] = useState("")
  const [generatedLink, setGeneratedLink] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Fetch template data when templateId changes
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) return
      
      setLoading(true)
      try {
        const template = await getTemplate(templateId)
        if (template) {
          setTemplateData(template)
          setDuration(template.duration?.toString() || '30')
        }
      } catch (error) {
        console.error('Error fetching template:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchTemplate()
  }, [templateId, getTemplate])

  const handleGenerateLink = async () => {
    if (!templateId || !position.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/interviews/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId,
          position: position.trim(),
          duration: parseInt(duration) || 30,
          description: description.trim() || `Interview for ${position} position`
        })
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedLink(data.session.link)
      } else {
        const error = await response.json()
        console.error('Failed to generate link:', error)
        // TODO: Show error toast
      }
    } catch (error) {
      console.error('Error generating link:', error)
      // TODO: Show error toast
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      // TODO: Show success toast
    }
  }

  const handleClose = () => {
    setPosition("")
    setDuration("")
    setDescription("")
    setGeneratedLink("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Interview Link</DialogTitle>
          <DialogDescription>
            Create a shareable link for candidates to join the interview
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading template...</span>
            </div>
          )}

          {templateData && !loading && (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                Template: {templateData.name}
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                {templateData.description}
              </p>
              <div className="flex gap-2 text-xs">
                <Badge variant="secondary">{templateData.category}</Badge>
                <Badge variant="outline">{templateData.difficulty}</Badge>
                <Badge variant="outline">{templateData.questions} questions</Badge>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Position Title</label>
              <Input
                placeholder="e.g., Frontend Developer, Product Manager"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Estimated Duration (minutes)</label>
              <Input
                type="number"
                placeholder="30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Description (Optional)</label>
              <Input
                placeholder="Additional information for the candidate"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {!generatedLink ? (
            <Button
              onClick={handleGenerateLink}
              disabled={!position.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Generating Link...
                </>
              ) : (
                <>
                  <Share className="w-4 h-4 mr-2" />
                  Generate Interview Link
                </>
              )}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  Interview Link Generated!
                </h4>
                <div className="flex items-center gap-2">
                  <Input
                    value={generatedLink}
                    readOnly
                    className="flex-1 font-mono text-sm"
                  />
                  <Button
                    onClick={handleCopyLink}
                    variant="outline"
                    size="sm"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                  Send this link to the candidate. They'll fill out their information before starting the interview.
                </p>
              </div>
              
              <Button
                onClick={handleClose}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
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
  const itemsPerPage = 6

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

  const handleGenerateLink = (templateId: string) => {
    // Open link generation dialog
    setSelectedTemplateForLink(templateId)
    setIsLinkGenerationDialogOpen(true)
    setIsTemplateDialogOpen(false)
  }

  // Filter interviews
  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         interview.candidateEmail.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "All Status" || interview.status === statusFilter
    const matchesPosition = positionFilter === "All Positions" || interview.position === positionFilter
    const matchesInterviewer = interviewerFilter === "All Interviewers" || interview.interviewer === interviewerFilter
    
    return matchesSearch && matchesStatus && matchesPosition && matchesInterviewer
  })

  // Pagination
  const totalPages = Math.ceil(filteredInterviews.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedInterviews = filteredInterviews.slice(startIndex, startIndex + itemsPerPage)
  const handleSelectInterview = (interviewId: string) => {
    setSelectedInterviews(prev =>      prev.includes(interviewId) 
        ? prev.filter(id => id !== interviewId)
        : [...prev, interviewId]
    )
  }

  const handleBulkAction = (action: string) => {
    console.log(`Bulk ${action} for interviews:`, selectedInterviews)
    // Here you would implement the actual bulk actions
    setSelectedInterviews([])
  }

  return (
    <DashboardRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Interviews</h1>
              <p className="text-muted-foreground">
                Manage and monitor all candidate interviews
              </p>
            </div>            <div className="flex gap-2">
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
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search candidates, positions, or emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={positionFilter} onValueChange={setPositionFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Position" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(position => (
                    <SelectItem key={position} value={position}>{position}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={interviewerFilter} onValueChange={setInterviewerFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Interviewer" />
                </SelectTrigger>
                <SelectContent>
                  {interviewers.map(interviewer => (
                    <SelectItem key={interviewer} value={interviewer}>{interviewer}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedInterviews.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedInterviews.length} interview{selectedInterviews.length > 1 ? 's' : ''} selected
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
                  onClick={() => handleBulkAction('reschedule')}
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reschedule
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Interview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedInterviews.map((interview) => {
          const { date, time } = formatDateTime(interview.scheduledTime)
          const isSelected = selectedInterviews.includes(interview.id)
          
          return (
            <Card key={interview.id} className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleSelectInterview(interview.id)}
                    />
                    <div>
                      <CardTitle className="text-lg">{interview.candidateName}</CardTitle>
                      <CardDescription className="text-sm">{interview.candidateEmail}</CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Interview Details - {interview.candidateName}</DialogTitle>
                            <DialogDescription>
                              {interview.position} • {interview.interviewer}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-semibold mb-1">Scheduled Time</h4>
                                <p className="text-sm text-muted-foreground">{date} at {time}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">Duration</h4>
                                <p className="text-sm text-muted-foreground">{interview.duration} minutes</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">Status</h4>
                                {getStatusBadge(interview.status)}
                              </div>
                              <div>
                                <h4 className="font-semibold mb-1">Progress</h4>
                                <div className="flex items-center gap-2">
                                  <Progress value={interview.progress} className="flex-1" />
                                  <span className="text-sm text-muted-foreground">{interview.progress}%</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Notes</h4>
                              <p className="text-sm text-muted-foreground">{interview.notes}</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2">Transcript Preview</h4>
                              <div className="bg-muted p-3 rounded-md max-h-32 overflow-y-auto">
                                <p className="text-sm whitespace-pre-wrap">{interview.transcript}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <DropdownMenuItem>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="mr-2 h-4 w-4" />
                        Download Report
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{interview.position}</span>
                  {getStatusBadge(interview.status)}
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>{date}</span>
                  <Clock className="w-4 h-4 ml-2" />
                  <span>{time}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{interview.interviewer}</span>
                  <span className="ml-auto">{interview.duration}min</span>
                </div>
                
                {interview.status === 'in_progress' && interview.progress > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{interview.progress}%</span>
                    </div>
                    <Progress value={interview.progress} className="h-1" />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage > 1) setCurrentPage(currentPage - 1)
                  }}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      setCurrentPage(page)
                    }}
                    isActive={currentPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                  }}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Empty State */}
      {filteredInterviews.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No interviews found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>            <Button variant="outline" onClick={() => {
              setSearchTerm("")
              setStatusFilter("All Status")
              setPositionFilter("All Positions")
              setInterviewerFilter("All Interviewers")
            }}>
              Clear Filters
            </Button>          </CardContent>
        </Card>
      )}
        </div>        {/* Template Selection Dialog */}
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
      </DashboardLayout>
    </DashboardRoute>
  )
}
