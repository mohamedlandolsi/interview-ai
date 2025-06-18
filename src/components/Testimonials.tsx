import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {    name: "Sarah Chen",
    role: "Head of Talent Acquisition",
    company: "TechCorp Inc.",
    image: "/api/placeholder/64/64",
    content: "InterQ has revolutionized our hiring process. We've reduced our time-to-hire by 60% while significantly improving the quality of our candidates. The AI insights are incredibly accurate.",
    rating: 5
  },
  {
    name: "Michael Rodriguez",
    role: "HR Director",
    company: "Global Solutions",
    image: "/api/placeholder/64/64",
    content: "The bias-free assessment feature has been a game-changer for building diverse teams. Our hiring decisions are now more objective and data-driven than ever before.",
    rating: 5
  },
  {    name: "Emily Thompson",
    role: "Recruiting Manager",
    company: "StartupXYZ",
    image: "/api/placeholder/64/64",
    content: "As a fast-growing startup, we needed a scalable solution. InterQ allows us to screen hundreds of candidates efficiently without compromising on quality.",
    rating: 5
  },
  {    name: "David Park",
    role: "VP of Human Resources",
    company: "Enterprise Corp",
    image: "/api/placeholder/64/64",
    content: "The analytics and insights provided by InterQ have helped us understand our hiring patterns better and make more strategic decisions about our talent acquisition.",
    rating: 5
  },
  {
    name: "Lisa Wang",
    role: "Talent Partner",
    company: "Innovation Labs",
    image: "/api/placeholder/64/64",
    content: "Our candidates love the consistent, professional interview experience. It's helped us improve our employer brand while making better hiring decisions.",
    rating: 5
  },
  {
    name: "James Mitchell",
    role: "Head of People",
    company: "Scale Ventures",
    image: "/api/placeholder/64/64",
    content: "The ROI has been incredible. We've saved thousands of hours in screening time and improved our quality of hire by 40%. Highly recommend to any growing company.",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl mb-6">
            Trusted by HR Leaders Worldwide
          </h2>
          <p className="text-lg text-muted-foreground">
            See how leading companies are transforming their hiring process with InterQ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                {/* Quote icon */}
                <Quote className="h-8 w-8 text-primary/20 mb-4" />
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Testimonial content */}                <p className="text-muted-foreground mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>

                {/* Author info */}
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <span className="text-sm font-semibold text-primary">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-20 text-center">
          <p className="text-sm text-muted-foreground mb-8">
            Trusted by companies of all sizes
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60">
            {/* Placeholder company logos */}
            <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
              <span className="text-xs font-semibold">TechCorp</span>
            </div>
            <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
              <span className="text-xs font-semibold">GlobalSol</span>
            </div>
            <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
              <span className="text-xs font-semibold">StartupXYZ</span>
            </div>
            <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
              <span className="text-xs font-semibold">Enterprise</span>
            </div>
            <div className="h-8 w-24 bg-muted rounded flex items-center justify-center">
              <span className="text-xs font-semibold">Innovation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}