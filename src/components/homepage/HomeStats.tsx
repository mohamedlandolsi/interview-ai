"use client"

import { Card, CardContent } from "@/components/ui/card"

const stats = [
  {
    value: "50K+",
    label: "Interviews Conducted",
    description: "Successful AI-powered interviews completed"
  },
  {
    value: "500+",
    label: "Companies Trust Us",
    description: "Organizations using our platform"
  },
  {
    value: "95%",
    label: "Customer Satisfaction",
    description: "Highly rated by HR professionals"
  },
  {
    value: "80%",
    label: "Time Reduction",
    description: "Average time saved in the hiring process"
  },
  {
    value: "99%",
    label: "Bias Reduction",
    description: "Improvement in fair hiring practices"
  },
  {
    value: "24/7",
    label: "Availability",
    description: "Round-the-clock interview capabilities"
  }
]

export function HomeStats() {
  return (
    <section className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl mb-6">
            Trusted by Industry Leaders
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of companies that have transformed their hiring process with our AI-powered interview platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden border-0 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 hover:scale-105 hover:shadow-lg text-center group">
              <CardContent className="p-8">
                <div className="text-4xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">
                  {stat.value}
                </div>
                <div className="text-xl font-semibold text-foreground mb-2">
                  {stat.label}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional company logos or testimonials could go here */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-8">
            Trusted by companies of all sizes, from startups to Fortune 500
          </p>
          
          {/* Placeholder for company logos - you can replace with actual logos */}
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="h-8 w-24 bg-muted rounded-md flex items-center justify-center text-xs font-medium">
              Company A
            </div>
            <div className="h-8 w-24 bg-muted rounded-md flex items-center justify-center text-xs font-medium">
              Company B
            </div>
            <div className="h-8 w-24 bg-muted rounded-md flex items-center justify-center text-xs font-medium">
              Company C
            </div>
            <div className="h-8 w-24 bg-muted rounded-md flex items-center justify-center text-xs font-medium">
              Company D
            </div>
            <div className="h-8 w-24 bg-muted rounded-md flex items-center justify-center text-xs font-medium">
              Company E
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}