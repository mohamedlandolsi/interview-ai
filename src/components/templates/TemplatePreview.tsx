"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Clock, 
  Star,
  CheckCircle,
  Circle,
  Edit3,
  Users,
  FileText,
  Timer
} from "lucide-react"

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

interface TemplatePreviewProps {
  templateId: string
  onBack: () => void
  onEdit: () => void
}

export function TemplatePreview({ templateId, onBack, onEdit }: TemplatePreviewProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  
  // Mock template data
  const template = {
    id: templateId,
    name: "Frontend Developer Assessment",
    description: "Comprehensive evaluation for frontend developers covering React, JavaScript, and UI/UX principles",
    category: "Technical",
    difficulty: "Intermediate",
    totalTime: 45,
    totalPoints: 100,
    questions: [
      {
        id: "1",
        type: "text" as const,
        title: "Describe your experience with React and its ecosystem",
        description: "Please provide details about your React development experience, including any libraries or tools you've used",
        required: true,
        timeLimit: 5,
        points: 20
      },
      {
        id: "2",
        type: "multiple_choice" as const,
        title: "Which of the following are React hooks?",
        description: "Select all that apply",
        required: true,
        points: 15,
        options: ["useState", "useEffect", "useContext", "useComponent", "useCallback"]
      },
      {
        id: "3",
        type: "rating" as const,
        title: "How would you rate your JavaScript proficiency?",
        description: "Rate your comfort level with modern JavaScript features",
        required: false,
        points: 10,
        minRating: 1,
        maxRating: 5
      },
      {
        id: "4",
        type: "boolean" as const,
        title: "Have you worked with TypeScript in production?",
        description: "Answer yes if you have professional TypeScript experience",
        required: true,
        points: 5
      },
      {
        id: "5",
        type: "text" as const,
        title: "Explain the difference between server-side and client-side rendering",
        description: "Provide a technical explanation with examples",
        required: true,
        timeLimit: 8,
        points: 25
      },
      {
        id: "6",
        type: "multiple_choice" as const,
        title: "Which CSS methodologies have you used?",
        description: "Select all that apply to your experience",
        required: false,
        points: 10,
        options: ["BEM", "SMACSS", "OOCSS", "Atomic CSS", "CSS Modules"]
      }
    ]
  }

  const currentQ = template.questions[currentQuestion]
  const progress = ((currentQuestion + 1) / template.questions.length) * 100

  useEffect(() => {
    if (isPlaying && currentQ?.timeLimit) {
      setTimeLeft(currentQ.timeLimit * 60) // Convert to seconds
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsPlaying(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isPlaying, currentQuestion, currentQ?.timeLimit])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const nextQuestion = () => {
    if (currentQuestion < template.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setIsPlaying(false)
      setTimeLeft(0)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setIsPlaying(false)
      setTimeLeft(0)
    }
  }

  const renderQuestionPreview = (question: Question) => {
    switch (question.type) {
      case "text":
        return (
          <div className="space-y-4">
            <div className="min-h-[120px] w-full p-4 border rounded-md bg-muted/20">
              <p className="text-sm text-muted-foreground">
                Candidate's text response would appear here...
              </p>
            </div>
          </div>
        )
      
      case "multiple_choice":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Circle className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{option}</span>
              </div>
            ))}
          </div>
        )
      
      case "rating":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {question.minRating}
              </span>
              <div className="flex space-x-2">
                {Array.from({ length: question.maxRating! - question.minRating! + 1 }, (_, i) => (
                  <Star key={i} className="w-6 h-6 text-muted-foreground hover:text-yellow-400 cursor-pointer" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {question.maxRating}
              </span>
            </div>
          </div>
        )
      
      case "boolean":
        return (
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Circle className="w-4 h-4 text-muted-foreground" />
              <span>Yes</span>
            </div>
            <div className="flex items-center space-x-2">
              <Circle className="w-4 h-4 text-muted-foreground" />
              <span>No</span>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

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
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground">Preview Mode</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Template
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Preview */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    Question {currentQuestion + 1} of {template.questions.length}
                  </CardTitle>
                  <CardDescription>
                    {currentQ.points} points • {currentQ.required ? "Required" : "Optional"}
                  </CardDescription>
                </div>
                {currentQ.timeLimit && (
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm font-mono">
                      {isPlaying ? formatTime(timeLeft) : `${currentQ.timeLimit}:00`}
                    </span>
                  </div>
                )}
              </div>
              <Progress value={progress} className="mt-4" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">{currentQ.title}</h3>
                {currentQ.description && (
                  <p className="text-muted-foreground mb-4">{currentQ.description}</p>
                )}
              </div>
              
              {renderQuestionPreview(currentQ)}
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevQuestion}
                    disabled={currentQuestion === 0}
                  >
                    <SkipBack className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  {currentQ.timeLimit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Start Timer
                        </>
                      )}
                    </Button>
                  )}
                </div>
                
                <Button
                  onClick={nextQuestion}
                  disabled={currentQuestion === template.questions.length - 1}
                >
                  Next
                  <SkipForward className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Template Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category:</span>
                <Badge variant="outline">{template.category}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Difficulty:</span>
                <Badge variant="secondary">{template.difficulty}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Time:</span>
                <span className="font-medium">{template.totalTime} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Points:</span>
                <span className="font-medium">{template.totalPoints}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {template.questions.map((q, index) => (
                  <div
                    key={q.id}
                    className={`flex items-center justify-between p-2 rounded text-sm cursor-pointer transition-colors ${
                      index === currentQuestion
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setCurrentQuestion(index)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{index + 1}</span>
                      <span className="truncate">{q.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {q.required && <CheckCircle className="w-3 h-3 text-green-500" />}
                      {q.timeLimit && <Clock className="w-3 h-3 text-blue-500" />}
                      <span className="text-xs text-muted-foreground">{q.points}pt</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Question Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Text Response:</span>
                <span>{template.questions.filter(q => q.type === "text").length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Multiple Choice:</span>
                <span>{template.questions.filter(q => q.type === "multiple_choice").length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Rating:</span>
                <span>{template.questions.filter(q => q.type === "rating").length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Yes/No:</span>
                <span>{template.questions.filter(q => q.type === "boolean").length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
