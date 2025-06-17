import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, CheckCircle } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Main CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-primary to-accent p-8 sm:p-12 text-white shadow-2xl">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
              Ready to Transform Your Hiring?
            </h2>            <p className="text-lg sm:text-xl mb-8 opacity-90">
              Join 500+ companies already using InterQ to hire better, faster, and fairer. 
              Start your free trial today and see the difference AI can make.
            </p>

            {/* Benefits list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-sm">
              <div className="flex items-center justify-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                14-day free trial
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                No credit card required
              </div>
              <div className="flex items-center justify-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Setup in 5 minutes
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button 
                size="lg" 
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 px-8 py-3 text-lg font-semibold hover:scale-105 transition-all duration-200"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="secondary" // Changed from outline
                className="px-8 py-3 text-lg hover:scale-105 transition-all duration-200" // Removed custom border/text, using secondary variant's default colors
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book a Demo
              </Button>
            </div>
          </div>

          {/* Secondary CTA */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Need Help Getting Started?
            </h3>            <p className="text-muted-foreground mb-6">
              Our team of hiring experts is here to help you implement InterQ successfully.
            </p>
            <Button variant="outline" size="lg">
              Contact Our Experts
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}