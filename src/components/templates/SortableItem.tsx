"use client"

import { useState } from "react"
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  GripVertical, 
  Trash2, 
  Plus, 
  Minus, 
  Star,
  Clock
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

interface SortableItemProps {
  id: string
  question: Question
  index: number
  onUpdate: (id: string, updates: Partial<Question>) => void
  onRemove: (id: string) => void
}

export function SortableItem({ id, question, index, onUpdate, onRemove }: SortableItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "text":
        return <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
          <span className="text-blue-600 text-xs font-bold">T</span>
        </div>
      case "multiple_choice":
        return <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
          <span className="text-green-600 text-xs font-bold">M</span>
        </div>
      case "rating":
        return <div className="w-6 h-6 bg-yellow-100 rounded flex items-center justify-center">
          <Star className="w-3 h-3 text-yellow-600" />
        </div>
      case "boolean":
        return <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center">
          <span className="text-purple-600 text-xs font-bold">Y/N</span>
        </div>
    }
  }

  const addOption = () => {
    if (question.options) {
      onUpdate(id, { options: [...question.options, ""] })
    }
  }

  const updateOption = (optionIndex: number, value: string) => {
    if (question.options) {
      const newOptions = [...question.options]
      newOptions[optionIndex] = value
      onUpdate(id, { options: newOptions })
    }
  }

  const removeOption = (optionIndex: number) => {
    if (question.options && question.options.length > 1) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex)
      onUpdate(id, { options: newOptions })
    }
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div {...attributes} {...listeners} className="cursor-grab">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  #{index + 1}
                </span>
                {getQuestionTypeIcon(question.type)}
                <Badge variant="outline" className="text-xs capitalize">
                  {question.type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Collapse" : "Expand"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {!isExpanded && (
            <div className="ml-7">
              <p className="text-sm font-medium truncate">
                {question.title || "Untitled Question"}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <span>{question.points} points</span>
                {question.timeLimit && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {question.timeLimit}min
                  </span>
                )}
                {question.required && <span>Required</span>}
              </div>
            </div>
          )}
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor={`title-${id}`}>Question Title</Label>
                <Input
                  id={`title-${id}`}
                  placeholder="Enter your question..."
                  value={question.title}
                  onChange={(e) => onUpdate(id, { title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor={`description-${id}`}>Description (Optional)</Label>
                <Textarea
                  id={`description-${id}`}
                  placeholder="Add additional context or instructions..."
                  value={question.description}
                  onChange={(e) => onUpdate(id, { description: e.target.value })}
                  rows={2}
                />
              </div>

              {/* Multiple Choice Options */}
              {question.type === "multiple_choice" && (
                <div>
                  <Label>Answer Options</Label>
                  <div className="space-y-2">
                    {question.options?.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <Input
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => updateOption(optionIndex, e.target.value)}
                        />
                        {question.options && question.options.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOption(optionIndex)}
                            className="text-red-600"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addOption}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Option
                    </Button>
                  </div>
                </div>
              )}

              {/* Rating Scale */}
              {question.type === "rating" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`min-rating-${id}`}>Minimum Rating</Label>
                    <Select
                      value={question.minRating?.toString()}
                      onValueChange={(value) => onUpdate(id, { minRating: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Min" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor={`max-rating-${id}`}>Maximum Rating</Label>
                    <Select
                      value={question.maxRating?.toString()}
                      onValueChange={(value) => onUpdate(id, { maxRating: parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Max" />
                      </SelectTrigger>
                      <SelectContent>
                        {[3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`points-${id}`}>Points</Label>
                  <Input
                    id={`points-${id}`}
                    type="number"
                    min="0"
                    max="100"
                    value={question.points}
                    onChange={(e) => onUpdate(id, { points: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor={`time-limit-${id}`}>Time Limit (min)</Label>
                  <Input
                    id={`time-limit-${id}`}
                    type="number"
                    min="1"
                    max="30"
                    value={question.timeLimit || ""}
                    onChange={(e) => onUpdate(id, { timeLimit: parseInt(e.target.value) || undefined })}
                    placeholder="No limit"
                  />
                </div>
                <div className="flex items-end">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`required-${id}`}
                      checked={question.required}
                      onCheckedChange={(checked) => onUpdate(id, { required: !!checked })}
                    />
                    <Label htmlFor={`required-${id}`} className="text-sm">
                      Required
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
