"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  FileText, 
  Calendar, 
  BarChart3, 
  Settings,
  Bot,
  Users,
  Clock,
  Shield,
  Zap,
  Target
} from "lucide-react"

const features = [
  {
    icon: FileText,
    title: "Smart Template Management",
    description: "Create, customize, and manage interview templates with AI assistant instructions, categories, difficulty levels, and various question types.",
    highlights: ["Custom question types", "AI instructions", "Template categories", "Difficulty settings"]
  },
  {
    icon: Calendar,
    title: "Seamless Interview Orchestration", 
    description: "Start live interviews instantly by selecting templates, generating shareable links, and managing the entire interview lifecycle.",
    highlights: ["One-click interview start", "Shareable links", "Live monitoring", "Real-time management"]
  },
  {
    icon: BarChart3,
    title: "Comprehensive Analytics & Results",
    description: "Access detailed interview analyses, performance insights, candidate comparisons, and comprehensive reporting tools.",
    highlights: ["Detailed analytics", "Performance insights", "Candidate comparison", "Export capabilities"]
  }
]

export function HomeFeatures() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl mb-6">
            Everything You Need for Modern Hiring
          </h2>
          <p className="text-lg text-muted-foreground">
            Our comprehensive platform covers every aspect of the interview process, from template creation to final hiring decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden border-0 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-lg group">
              <CardHeader className="pb-4">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-base mb-4">
                  {feature.description}
                </CardDescription>
                <ul className="space-y-2">
                  {feature.highlights.map((highlight, highlightIndex) => (
                    <li key={highlightIndex} className="flex items-center text-sm text-muted-foreground">
                      <div className="mr-2 h-1.5 w-1.5 bg-primary rounded-full" />
                      {highlight}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional benefits section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Save Time</h3>
            <p className="text-sm text-muted-foreground">Reduce interview time by 80% while improving quality</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Reduce Bias</h3>
            <p className="text-sm text-muted-foreground">Standardized evaluation for fair hiring decisions</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Scale Easily</h3>
            <p className="text-sm text-muted-foreground">Handle unlimited interviews simultaneously</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <Target className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Better Matches</h3>
            <p className="text-sm text-muted-foreground">AI-powered insights for optimal candidate selection</p>
          </div>
        </div>
      </div>
    </section>
  )
}