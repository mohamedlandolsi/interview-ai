"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Link2, 
  MessageSquare, 
  BarChart3,
  ArrowRight,
  CheckCircle2
} from "lucide-react"

const steps = [
  {
    step: "01",
    icon: FileText,
    title: "Create Interview Templates",
    description: "Design custom interview templates with AI instructions, questions, and evaluation criteria tailored to your specific roles and requirements.",
    features: ["Multiple question types", "AI assistant configuration", "Custom categories", "Time limits"]
  },
  {
    step: "02", 
    icon: Link2,
    title: "Generate Interview Links",
    description: "Select a template, fill in position details and duration, then generate a secure interview link to share with candidates instantly.",
    features: ["One-click generation", "Secure links", "Custom branding", "Mobile-friendly"]
  },
  {
    step: "03",
    icon: MessageSquare,
    title: "AI Conducts Interviews",
    description: "Candidates join the interview and interact with our advanced AI interviewer that asks intelligent questions and adapts in real-time.",
    features: ["Natural conversation", "Voice interaction", "Adaptive questioning", "Real-time analysis"]
  },
  {
    step: "04",
    icon: BarChart3,
    title: "Review Results & Analytics",
    description: "Access comprehensive interview results with transcripts, scoring, insights, and hiring recommendations to make informed decisions.",
    features: ["Detailed transcripts", "Performance metrics", "AI insights", "Hiring recommendations"]
  }
]

export function HomeHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl mb-6">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Our streamlined process makes it easy to conduct professional AI-powered interviews in just four simple steps.
          </p>
        </div>

        <div className="relative">
          {/* Connection lines */}
          <div className="hidden lg:block absolute top-32 left-1/2 w-px h-32 bg-gradient-to-b from-primary/50 to-transparent transform -translate-x-px" />
          <div className="hidden lg:block absolute top-80 left-1/2 w-px h-32 bg-gradient-to-b from-primary/50 to-transparent transform -translate-x-px" />
          <div className="hidden lg:block absolute top-128 left-1/2 w-px h-32 bg-gradient-to-b from-primary/50 to-transparent transform -translate-x-px" />

          <div className="space-y-8 lg:space-y-16">
            {steps.map((step, index) => (
              <div key={index} className={`flex flex-col lg:flex-row items-center gap-8 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                {/* Step Card */}
                <div className="flex-1 w-full">
                  <Card className="relative overflow-hidden border-0 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div className="shrink-0">
                          <Badge variant="secondary" className="text-lg font-bold px-3 py-1 mb-4">
                            {step.step}
                          </Badge>
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <step.icon className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-3">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {step.description}
                          </p>
                          <ul className="space-y-2">
                            {step.features.map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                                <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Arrow indicator for desktop */}
                <div className="hidden lg:flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
                  <ArrowRight className={`h-6 w-6 text-primary ${index % 2 === 1 ? 'rotate-180' : ''}`} />
                </div>

                {/* Placeholder for layout balance */}
                <div className="flex-1 hidden lg:block" />
              </div>
            ))}
          </div>
        </div>

        {/* Call to action */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-full px-4 py-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            Ready to revolutionize your hiring process?
          </div>
        </div>
      </div>
    </section>
  )
}