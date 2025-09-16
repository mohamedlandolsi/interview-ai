"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, CheckCircle, Star } from "lucide-react"
import Link from "next/link"

export function HomeCTA() {
  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5">
          <CardContent className="p-12 sm:p-16 text-center">
            {/* Badge */}
            <div className="mx-auto mb-8 inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Star className="mr-2 h-4 w-4 fill-current" />
              Join 500+ Companies Already Using InterQ
            </div>

            {/* Main headline */}
            <h2 className="mx-auto mb-6 max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Ready to Transform Your Hiring Process?
            </h2>

            {/* Subheadline */}
            <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
              Start conducting smarter, fairer, and more efficient interviews today. No setup fees, no long-term commitments, and full support to get you started.
            </p>

            {/* Benefits */}
            <div className="flex flex-wrap items-center justify-center gap-6 mb-10 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                14-day free trial
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                No credit card required
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                Setup in 5 minutes
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                Cancel anytime
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg hover:scale-105 transition-all duration-200">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="px-8 py-3 text-lg hover:scale-105 transition-all duration-200">
                  Sign In to Your Account
                </Button>
              </Link>
            </div>

            {/* Additional reassurance */}
            <div className="mt-8 text-xs text-muted-foreground">
              Questions? Contact our team at{" "}
              <a href="mailto:support@interq.ai" className="text-primary hover:underline">
                support@interq.ai
              </a>{" "}
              or schedule a demo call
            </div>
          </CardContent>

          {/* Background decoration */}
          <div className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl opacity-20" aria-hidden="true">
            <div className="aspect-[1404/767] w-[50rem] bg-gradient-to-r from-primary to-accent" />
          </div>
          <div className="absolute -bottom-24 left-0 -z-10 transform-gpu blur-3xl opacity-20" aria-hidden="true">
            <div className="aspect-[1404/767] w-[50rem] bg-gradient-to-r from-accent to-primary" />
          </div>
        </Card>
      </div>
    </section>
  )
}