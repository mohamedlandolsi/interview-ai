"use client"

import { useState, useEffect } from "react"
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
  Copy
} from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from "@/components/templates/SortableItem"

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  description: z.string().min(1, "Description is required"),
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
      category: "",
      difficulty: "",
      timeLimit: 45,
      tags: "",
    },
  })

  useEffect(() => {
    if (templateId) {
      // Load existing template data
      // This would typically fetch from an API
      form.setValue("name", "Frontend Developer Assessment")
      form.setValue("description", "Comprehensive evaluation for frontend developers")
      form.setValue("category", "Technical")
      form.setValue("difficulty", "Intermediate")
      form.setValue("timeLimit", 45)
      form.setValue("tags", "React, JavaScript, CSS, HTML")
      
      setQuestions([
        {
          id: "1",
          type: "text",
          title: "Describe your experience with React",
          description: "Please provide details about your React development experience",
          required: true,
          timeLimit: 5,
          points: 10
        },
        {
          id: "2",
          type: "multiple_choice",
          title: "Which of the following are React hooks?",
          description: "Select all that apply",
          required: true,
          points: 15,
          options: ["useState", "useEffect", "useContext", "useComponent"]
        }
      ])
    }
  }, [templateId, form])

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
  }

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q))
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id))
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      setQuestions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  const onSubmit = (data: TemplateFormData) => {
    console.log("Template data:", { ...data, questions })
    onSave()
  }

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0)
  const estimatedTime = questions.reduce((sum, q) => sum + (q.timeLimit || 3), 0)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
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
          <Button variant="outline">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

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
                      />

                      <FormField
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
