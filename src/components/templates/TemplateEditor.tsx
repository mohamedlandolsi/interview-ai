"use client"

import { useState, useEffect, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  GripVertical, 
  Clock, 
  Star,
  Save,
  Eye,
  Copy,
  Loader2,
  Sparkles
} from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from "@/components/templates/SortableItem"
import { useTemplates } from "@/hooks/useTemplates"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().min(1, "Description is required"),
  instruction: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  timeLimit: z.number().min(1).max(180),
  tags: z.string(),
})

type TemplateFormData = z.infer<typeof templateSchema>

type Question = {
  id: string
  type: "text" | "multiple_choice" | "rating" | "boolean"
  title: string
  description: string
  required: boolean
  timeLimit?: number
  points: number
  options?: string[]
  minRating?: number
  maxRating?: number
}

interface TemplateEditorProps {
  templateId?: string | null
  onBack: () => void
  onSave: () => void
}

export function TemplateEditor({ templateId, onBack, onSave }: TemplateEditorProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [activeTab, setActiveTab] = useState("details")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiPopoverOpen, setAiPopoverOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState("")
  const [generatingAI, setGeneratingAI] = useState(false)
  const { createTemplate, updateTemplate, getTemplate } = useTemplates()
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  const form = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      instruction: "",
      category: "",
      difficulty: "",
      timeLimit: 45,
      tags: "",
    },
  })
  useEffect(() => {
    const loadTemplate = async () => {
      if (templateId) {
        setLoading(true)
        setError(null)
        
        try {
          const template = await getTemplate(templateId)
          if (template) {            // Populate form with existing template data
            form.setValue("name", template.name)
            form.setValue("description", template.description || "")
            form.setValue("instruction", template.instruction || "")
            form.setValue("category", template.category || "")
            form.setValue("difficulty", template.difficulty || "")
            form.setValue("timeLimit", template.duration || 45)
            form.setValue("tags", template.tags?.join(", ") || "")
            
            // Set questions if available
            if (template.rawQuestions && Array.isArray(template.rawQuestions)) {
              setQuestions(template.rawQuestions.map((q: any, index: number) => ({
                id: q.id || `question-${index}`,
                type: q.type || "text",
                title: q.title || q.question || "",
                description: q.description || "",
                required: q.required || false,
                timeLimit: q.timeLimit || 3,
                points: q.points || q.weight || 10,
                options: q.options || (q.type === "multiple_choice" ? [""] : undefined),
                minRating: q.minRating || (q.type === "rating" ? 1 : undefined),
                maxRating: q.maxRating || (q.type === "rating" ? 5 : undefined)
              })))
            }
          }
        } catch (err) {
          setError("Failed to load template")
          console.error("Error loading template:", err)
        } finally {
          setLoading(false)
        }
      }
    }

    loadTemplate()
  }, [templateId, form, getTemplate])
  const addQuestion = (type: Question["type"]) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      title: "",
      description: "",
      required: false,
      points: 10,
      ...(type === "multiple_choice" && { options: [""] }),
      ...(type === "rating" && { minRating: 1, maxRating: 5 })
    }
    setQuestions([...questions, newQuestion])
    
    // Auto-save when adding questions if we have a templateId (editing existing template)
    if (templateId) {
      // Use setTimeout to ensure the state is updated before saving
      setTimeout(() => debouncedSaveQuestions(), 100)
    }
  }
  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q))
    
    // Auto-save when updating questions if we have a templateId (editing existing template)
    if (templateId) {
      debouncedSaveQuestions()
    }
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
    
    // Auto-save when removing questions if we have a templateId (editing existing template)
    if (templateId) {
      debouncedSaveQuestions()
    }
  }
  
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
      
      // Auto-save when reordering questions if we have a templateId (editing existing template)
      if (templateId) {
        debouncedSaveQuestions()
      }
    }
  }

  // Debounced function to save questions to prevent too many API calls
  const debouncedSaveQuestions = useCallback(
    debounce(async () => {
      if (!templateId) return

      try {
        const questionsData = questions.map(q => ({
          id: q.id,
          type: q.type,
          question: q.title,
          title: q.title,
          description: q.description,
          required: q.required,
          timeLimit: q.timeLimit,
          points: q.points,
          weight: q.points / 10,
          ...(q.options && { options: q.options.filter(opt => opt.trim() !== "") }),
          ...(q.minRating && { minRating: q.minRating }),
          ...(q.maxRating && { maxRating: q.maxRating }),
          category: form.getValues("category"),
          difficulty: form.getValues("difficulty")
        }))

        await updateTemplate(templateId, { rawQuestions: questionsData })
      } catch (err) {
        console.error("Error auto-saving questions:", err)
      }
    }, 1000),
    [templateId, questions, updateTemplate, form]
  )

  const onSubmit = async (data: TemplateFormData) => {
    setSaving(true)
    setError(null)

    try {
      // Convert questions to the format expected by the API
      const questionsData = questions.map(q => ({
        id: q.id,
        type: q.type,
        question: q.title,
        title: q.title,
        description: q.description,
        required: q.required,
        timeLimit: q.timeLimit,
        points: q.points,
        weight: q.points / 10, // Convert points to weight
        ...(q.options && { options: q.options.filter(opt => opt.trim() !== "") }),
        ...(q.minRating && { minRating: q.minRating }),
        ...(q.maxRating && { maxRating: q.maxRating }),
        // Add category and difficulty from template data
        category: data.category,
        difficulty: data.difficulty      }))

      const templateData = {
        name: data.name,
        description: data.description,
        instruction: data.instruction,
        category: data.category,
        difficulty: data.difficulty as "Beginner" | "Intermediate" | "Advanced",
        duration: data.timeLimit,
        tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
        rawQuestions: questionsData
      }

      let result
      if (templateId) {
        // Update existing template
        result = await updateTemplate(templateId, templateData)
      } else {
        // Create new template
        result = await createTemplate(templateData)
      }

      if (result) {
        // If creating a new template, automatically go to questions tab
        if (!templateId) {
          setActiveTab("questions")
        }
        onSave()
      } else {
        setError(templateId ? "Failed to update template" : "Failed to create template")
      }
    } catch (err) {
      setError("An error occurred while saving the template")
      console.error("Error saving template:", err)    } finally {
      setSaving(false)
    }
  }
  // AI instruction generation function
  const generateAIInstructions = async () => {
    if (!aiPrompt.trim()) return

    setGeneratingAI(true)
    try {
      const formData = form.getValues()
      const response = await fetch('/api/ai/generate-instructions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: aiPrompt,
          templateName: formData.name,
          category: formData.category,
          difficulty: formData.difficulty,
          position: formData.name // Using template name as position context
        })
      })

      if (response.ok) {
        const data = await response.json()
        form.setValue('instruction', data.instructions)
        setAiPopoverOpen(false)
        setAiPrompt("")
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to generate instructions')
      }
    } catch (err) {
      setError('Failed to generate AI instructions')
      console.error('Error generating AI instructions:', err)
    } finally {
      setGeneratingAI(false)
    }
  }

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
  const estimatedTime = questions.reduce((sum, q) => sum + (q.timeLimit || 3), 0)

  // Show loading state while fetching existing template
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading template...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} disabled={saving}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {templateId ? "Edit Template" : "Create New Template"}
            </h1>
            <p className="text-muted-foreground">
              Build your interview template with custom questions
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={saving}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </>
            )}
          </Button>
        </div>
      </div>      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Template Details</TabsTrigger>
              <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Define the core details of your interview template
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Form {...form}>
                    <form className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Template Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Frontend Developer Assessment" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe what this template evaluates..."
                                className="min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />                      <FormField
                        control={form.control}
                        name="instruction"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">                              <FormLabel>AI Assistant Instructions</FormLabel>
                              <Popover open={aiPopoverOpen} onOpenChange={setAiPopoverOpen}>
                                <PopoverTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="ml-2"
                                  >
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    Generate with AI
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-96 p-4" align="start">
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <h4 className="font-medium text-sm">Generate AI Instructions</h4>
                                      <p className="text-sm text-muted-foreground">
                                        Describe what you want the AI interviewer to focus on, and we'll generate specific instructions.
                                      </p>
                                    </div>
                                    <Textarea
                                      placeholder="e.g., 'Focus on problem-solving skills for a senior software engineer role. Ask about system design and coding best practices.'"
                                      value={aiPrompt}
                                      onChange={(e) => setAiPrompt(e.target.value)}
                                      className="min-h-[80px] resize-none"
                                    />
                                    <div className="flex gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setAiPopoverOpen(false)
                                          setAiPrompt("")
                                        }}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        size="sm"
                                        onClick={generateAIInstructions}
                                        disabled={!aiPrompt.trim() || generatingAI}
                                      >
                                        {generatingAI ? (
                                          <>
                                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                            Generating...
                                          </>
                                        ) : (
                                          <>
                                            <Sparkles className="w-3 h-3 mr-1" />
                                            Generate
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                            </div>
                            <FormControl>
                              <Textarea 
                                placeholder="Provide specific instructions for the AI voice assistant (e.g., 'Focus on technical skills and problem-solving abilities. Ask follow-up questions about specific technologies mentioned.')"
                                className="min-h-[120px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              These instructions guide the AI voice assistant on how to conduct the interview, what to focus on, and how to ask follow-up questions.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Technical">Technical</SelectItem>
                                  <SelectItem value="Leadership">Leadership</SelectItem>
                                  <SelectItem value="Creative">Creative</SelectItem>
                                  <SelectItem value="Sales">Sales</SelectItem>
                                  <SelectItem value="Customer Service">Customer Service</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="difficulty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Difficulty Level</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select difficulty" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Beginner">Beginner</SelectItem>
                                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                                  <SelectItem value="Advanced">Advanced</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="timeLimit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Limit (minutes)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="180"
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>
                              Maximum time allowed for the entire interview
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tags"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tags</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="React, JavaScript, Frontend (comma separated)" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Add relevant tags to help categorize this template
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              {/* Question Types */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Questions</CardTitle>
                  <CardDescription>
                    Choose question types to add to your template
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => addQuestion("text")}
                    >
                      <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-blue-600 text-xs font-bold">T</span>
                      </div>
                      Text Response
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => addQuestion("multiple_choice")}
                    >
                      <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                        <span className="text-green-600 text-xs font-bold">M</span>
                      </div>
                      Multiple Choice
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => addQuestion("rating")}
                    >
                      <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
                        <Star className="w-3 h-3 text-yellow-600" />
                      </div>
                      Rating Scale
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => addQuestion("boolean")}
                    >
                      <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
                        <span className="text-purple-600 text-xs font-bold">Y/N</span>
                      </div>
                      Yes/No
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Questions List */}
              {questions.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Questions</CardTitle>
                    <CardDescription>
                      Drag and drop to reorder questions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext 
                        items={questions.map(q => q.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {questions.map((question, index) => (
                            <SortableItem 
                              key={question.id}
                              id={question.id}
                              question={question}
                              index={index}
                              onUpdate={updateQuestion}
                              onRemove={removeQuestion}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </CardContent>
                </Card>
              )}

              {questions.length === 0 && (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add your first question using the buttons above
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Template Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Questions:</span>
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Points:</span>
                <span className="font-medium">{totalPoints}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Est. Time:</span>
                <span className="font-medium">{estimatedTime} min</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Question Types:</div>
                {["text", "multiple_choice", "rating", "boolean"].map(type => {
                  const count = questions.filter(q => q.type === type).length
                  if (count === 0) return null
                  return (
                    <div key={type} className="flex justify-between text-xs">
                      <span className="capitalize">{type.replace('_', ' ')}:</span>
                      <span>{count}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Copy className="w-4 h-4 mr-2" />
                Duplicate Template
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Eye className="w-4 h-4 mr-2" />
                Preview Interview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
