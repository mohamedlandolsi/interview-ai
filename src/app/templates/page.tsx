"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,   SelectValue 
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  Plus, 
  Search, 
  Copy, 
  Trash2,
  Edit3, 
  Eye,
  FileText,
  Clock,
  Users,
  Zap,
  Star,
  MoreHorizontal,
  Play
} from "lucide-react"
import { TemplateEditor } from "@/components/templates/TemplateEditor"
import { TemplatePreview } from "@/components/templates/TemplatePreview"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for templates
const mockTemplates = [
  {
    id: "1",
    name: "Frontend Developer Assessment",
    description: "Comprehensive evaluation for frontend developers covering React, JavaScript, and UI/UX principles",
    category: "Technical",
    questions: 12,
    duration: 45,
    difficulty: "Intermediate",
    usageCount: 156,
    lastUsed: "2024-06-15",
    isBuiltIn: false,
    tags: ["React", "JavaScript", "CSS", "HTML"]
  },
  {
    id: "2",
    name: "Product Manager Interview",
    description: "Strategic thinking and product management skills assessment",
    category: "Leadership",
    questions: 8,
    duration: 60,
    difficulty: "Advanced",
    usageCount: 89,
    lastUsed: "2024-06-14",
    isBuiltIn: true,
    tags: ["Strategy", "Analytics", "Leadership"]
  },
  {
    id: "3",
    name: "Backend Developer Technical",
    description: "Server-side development skills including databases, APIs, and system design",
    category: "Technical",
    questions: 15,
    duration: 50,
    difficulty: "Advanced",
    usageCount: 203,
    lastUsed: "2024-06-16",
    isBuiltIn: false,
    tags: ["Node.js", "Database", "API Design"]
  },
  {
    id: "4",
    name: "Data Scientist Evaluation",
    description: "Statistical analysis, machine learning, and data visualization skills",
    category: "Technical",
    questions: 10,
    duration: 55,
    difficulty: "Advanced",
    usageCount: 67,
    lastUsed: "2024-06-13",
    isBuiltIn: true,
    tags: ["Python", "Statistics", "ML"]
  },
  {
    id: "5",
    name: "UX Designer Assessment",
    description: "Design thinking, user research, and prototyping skills evaluation",
    category: "Creative",
    questions: 9,
    duration: 40,
    difficulty: "Intermediate",
    usageCount: 124,
    lastUsed: "2024-06-17",
    isBuiltIn: false,
    tags: ["Design", "Research", "Prototyping"]
  },
  {
    id: "6",
    name: "Sales Representative Interview",
    description: "Communication skills, sales methodology, and customer relationship management",
    category: "Sales",
    questions: 7,
    duration: 35,
    difficulty: "Beginner",
    usageCount: 91,
    lastUsed: "2024-06-12",
    isBuiltIn: true,
    tags: ["Communication", "Sales", "CRM"]
  }
]

const categories = ["All Categories", "Technical", "Leadership", "Creative", "Sales", "Customer Service"]
const difficulties = ["All Levels", "Beginner", "Intermediate", "Advanced"]

const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Beginner</Badge>
    case "Intermediate":
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Intermediate</Badge>
    case "Advanced":
      return <Badge variant="warning" className="bg-orange-100 text-orange-800">Advanced</Badge>
    default:
      return <Badge variant="outline">{difficulty}</Badge>
  }
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Technical":
      return <Zap className="w-4 h-4" />
    case "Leadership":
      return <Users className="w-4 h-4" />
    case "Creative":
      return <Star className="w-4 h-4" />
    case "Sales":
      return <FileText className="w-4 h-4" />
    default:
      return <FileText className="w-4 h-4" />
  }
}

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All Categories")
  const [difficultyFilter, setDifficultyFilter] = useState("All Levels")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)

  // Filter templates
  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === "All Categories" || template.category === categoryFilter
    const matchesDifficulty = difficultyFilter === "All Levels" || template.difficulty === difficultyFilter
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })

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

  const handleDuplicateTemplate = (templateId: string) => {
    console.log("Duplicating template:", templateId)
    // Implement duplication logic
  }

  const handleDeleteTemplate = (templateId: string) => {
    console.log("Deleting template:", templateId)
    // Implement deletion logic
  }

  const handleCreateNew = () => {
    setSelectedTemplate(null)
    setIsEditing(true)
    setIsPreviewing(false)
  }

  if (isEditing) {
    return (
      <TemplateEditor
        templateId={selectedTemplate}
        onBack={() => setIsEditing(false)}
        onSave={() => setIsEditing(false)}
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
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interview Templates</h1>
          <p className="text-muted-foreground">
            Create and manage interview question templates for different roles
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
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
                  placeholder="Search templates, descriptions, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
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
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="custom">My Templates</TabsTrigger>
          <TabsTrigger value="library">Template Library</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreviewTemplate(template.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditTemplate(template.id)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        {!template.isBuiltIn && (
                          <DropdownMenuItem 
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{template.category}</span>
                    {getDifficultyBadge(template.difficulty)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{template.questions} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{template.duration} min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Used {template.usageCount} times</span>
                    {template.isBuiltIn && (
                      <Badge variant="outline" className="text-xs">
                        Built-in
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <Separator />
                  
                  <div className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePreviewTemplate(template.id)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleEditTemplate(template.id)}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.filter(t => !t.isBuiltIn).map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreviewTemplate(template.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditTemplate(template.id)}>
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{template.category}</span>
                    {getDifficultyBadge(template.difficulty)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{template.questions} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{template.duration} min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Used {template.usageCount} times</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <Separator />
                  
                  <div className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePreviewTemplate(template.id)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleEditTemplate(template.id)}
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTemplates.filter(t => t.isBuiltIn).map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(template.category)}
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="text-sm mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreviewTemplate(template.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Use Template
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{template.category}</span>
                    {getDifficultyBadge(template.difficulty)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{template.questions} questions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{template.duration} min</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Used {template.usageCount} times</span>
                    <Badge variant="outline" className="text-xs">
                      Built-in
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <Separator />
                  
                  <div className="flex justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePreviewTemplate(template.id)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template.id)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search or filter criteria
            </p>
            <Button variant="outline" onClick={() => {
              setSearchTerm("")
              setCategoryFilter("All Categories")
              setDifficultyFilter("All Levels")
            }}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
