import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20 py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mx-auto mb-8 inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary animate-fade-in-up">
            <CheckCircle className="mr-2 h-4 w-4" />
            Trusted by 500+ HR Teams
          </div>

          {/* Main Headline */}
          <h1 className="mx-auto mb-6 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-in-up animate-delay-100">
            Transform Your Hiring with{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AI-Powered Interviews
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl animate-fade-in-up animate-delay-200">
            Streamline your recruitment process with intelligent interviews that assess candidates fairly, consistently, and efficiently. Get deeper insights in half the time.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up animate-delay-300">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg hover:scale-105 transition-all duration-200">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-8 py-3 text-lg hover:scale-105 transition-all duration-200">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center animate-fade-in-up animate-delay-400">
              <div className="text-3xl font-bold text-foreground">95%</div>
              <div className="text-sm text-muted-foreground">Faster Screening</div>
            </div>
            <div className="text-center animate-fade-in-up animate-delay-500">
              <div className="text-3xl font-bold text-foreground">80%</div>
              <div className="text-sm text-muted-foreground">Time Saved</div>
            </div>
            <div className="text-center animate-fade-in-up animate-delay-600">
              <div className="text-3xl font-bold text-foreground">99%</div>
              <div className="text-sm text-muted-foreground">Bias Reduction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
        <div className="aspect-[1404/767] w-[87.75rem] bg-gradient-to-r from-primary/20 to-accent/20 opacity-25 animate-pulse" />
      </div>
      
      {/* Additional background decoration */}
      <div className="absolute -bottom-24 left-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
        <div className="aspect-[1404/767] w-[70rem] bg-gradient-to-r from-accent/20 to-primary/20 opacity-20 animate-pulse animation-delay-1000" />
      </div>
    </section>
  );
}