import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bot, 
  BarChart3, 
  Shield, 
  Clock, 
  Users, 
  Brain,
  Zap,
  Target,
  CheckCircle2
} from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "AI-Powered Automation",
    description: "Conduct structured interviews automatically with intelligent follow-up questions tailored to each candidate's responses.",
    benefits: ["24/7 availability", "Consistent questioning", "No scheduling conflicts"]
  },
  {
    icon: Shield,
    title: "Bias-Free Assessment",
    description: "Eliminate unconscious bias with standardized evaluation criteria and objective scoring algorithms.",
    benefits: ["Fair evaluation", "Diverse hiring", "Legal compliance"]
  },
  {
    icon: BarChart3,
    title: "Deep Insights & Analytics",
    description: "Get comprehensive reports with skill assessments, personality insights, and predictive hiring recommendations.",
    benefits: ["Data-driven decisions", "Performance prediction", "Team fit analysis"]
  },
  {
    icon: Clock,
    title: "Massive Time Savings",
    description: "Reduce initial screening time by 80% while improving candidate quality and interview consistency.",
    benefits: ["Faster hiring", "Higher quality", "Cost reduction"]
  },
  {
    icon: Brain,
    title: "Intelligent Questioning",
    description: "Dynamic interview flows that adapt based on job requirements and candidate responses for deeper evaluation.",
    benefits: ["Role-specific questions", "Adaptive difficulty", "Comprehensive coverage"]
  },
  {
    icon: Target,
    title: "Precision Matching",
    description: "Advanced algorithms analyze skills, experience, and cultural fit to identify your ideal candidates.",
    benefits: ["Better matches", "Reduced turnover", "Improved retention"]
  }
];

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl mb-6">
            Why HR Teams Choose InterQ
          </h2>
          <p className="text-lg text-muted-foreground">
            Transform your hiring process with cutting-edge AI technology designed specifically for modern recruitment challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative overflow-hidden border-0 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-lg">
              <CardHeader className="pb-4">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-base mb-4">
                  {feature.description}
                </CardDescription>
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-muted-foreground">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-primary" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional stats section */}
        <div className="mt-20 text-center">
          <div className="mx-auto max-w-4xl">
            <h3 className="text-2xl font-bold text-foreground mb-8">
              Proven Results Across Industries
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">10K+</div>
                <div className="text-sm text-muted-foreground">Interviews Conducted</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">Companies Trust Us</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">75%</div>
                <div className="text-sm text-muted-foreground">Faster Hiring</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">4.9★</div>
                <div className="text-sm text-muted-foreground">Customer Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}