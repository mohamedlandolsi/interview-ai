"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog"
import { 
  FileText,
  Clock,
  Users,
  Zap,
  Star,
  MoreHorizontal,
  Play,
  Edit3,
  Eye,
  Copy,
  Trash2
} from "lucide-react"
import { type Template } from "@/hooks/useTemplates"

interface TemplateCardProps {
  template: Template
  onPreview: (templateId: string) => void
  onEdit: (templateId: string) => void
  onDuplicate: (templateId: string) => void
  onDelete: (templateId: string) => void
}

const getDifficultyBadge = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Beginner</Badge>
    case "Intermediate":
      return <Badge variant="default" className="bg-blue-100 text-blue-800">Intermediate</Badge>
    case "Advanced":
      return <Badge variant="destructive" className="bg-orange-100 text-orange-800">Advanced</Badge>
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

export function TemplateCard({ 
  template, 
  onPreview, 
  onEdit, 
  onDuplicate, 
  onDelete 
}: TemplateCardProps) {
  const isCustomTemplate = !template.isBuiltIn

  return (
    <Card className="hover:shadow-md transition-shadow">
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
              <DropdownMenuItem onClick={() => onPreview(template.id)}>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </DropdownMenuItem>
              {isCustomTemplate && (
                <DropdownMenuItem onClick={() => onEdit(template.id)}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}              <DropdownMenuItem onClick={() => onDuplicate(template.id)}>
                <Copy className="mr-2 h-4 w-4" />
                {template.isBuiltIn ? "Use Template" : "Duplicate"}
              </DropdownMenuItem>
              {isCustomTemplate && (
                <DeleteConfirmDialog
                  title="Delete Template"
                  description={`Are you sure you want to delete "${template.name}"? This action cannot be undone and will permanently remove the template and all its questions.`}
                  onConfirm={() => onDelete(template.id)}
                >
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DeleteConfirmDialog>
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
            <span>{template.questions || 0} questions</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{template.duration || 0} min</span>
          </div>
        </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Created {new Date(template.created_at).toLocaleDateString()}</span>
          {template.isBuiltIn && (
            <Badge variant="outline" className="text-xs">
              Built-in
            </Badge>
          )}
        </div>
        
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {template.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <Separator />
        
        <div className="flex justify-between pt-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onPreview(template.id)}
          >
            <Play className="w-4 h-4 mr-1" />
            Preview
          </Button>
          {isCustomTemplate ? (
            <Button 
              size="sm"
              onClick={() => onEdit(template.id)}
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Edit
            </Button>
          ) : (
            <Button 
              size="sm"
              onClick={() => onDuplicate(template.id)}
            >
              <Copy className="w-4 h-4 mr-1" />
              Use Template
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
