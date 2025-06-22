"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Check,
  Star,
  Users,
  Brain,
  Calendar,
  Mail,
  Sparkles,
  LinkedinIcon,
} from "lucide-react";
import Link from "next/link";

export function CTASection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "HR Director",
      company: "TechFlow Inc",
      avatar: "SC",
      content:
        "Humantryx reduced our HR workload by 75%. The AI features are game-changing for modern HR operations.",
      rating: 5,
    },
    {
      name: "Michael Rodriguez",
      role: "Operations Manager",
      company: "GrowthLabs",
      avatar: "MR",
      content:
        "The automated payroll and leave management saved us countless hours. Best HR investment we&apos;ve made.",
      rating: 5,
    },
    {
      name: "Emily Watson",
      role: "Founder",
      company: "StartupXYZ",
      avatar: "EW",
      content:
        "Finally, an HRMS that understands modern businesses. The AI resume screening is incredibly accurate.",
      rating: 5,
    },
  ];

  const ctaFeatures = [
    "Complete employee lifecycle management",
    "AI-powered automation and insights",
    "Advanced payroll and attendance tracking",
    "Document management with AI chat",
    "Role-based access and permissions",
    "Real-time analytics and reporting",
  ];

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="from-primary/5 via-background to-muted/20 absolute inset-0 bg-gradient-to-br" />

      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-8 hidden lg:block"
      >
        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-xl backdrop-blur-sm">
          <Sparkles className="text-primary h-6 w-6" />
        </div>
      </motion.div>

      <div className="relative mx-auto max-w-7xl">
        {/* Testimonials Section */}
        <div className="mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              <Users className="mr-2 h-4 w-4" />
              Trusted by Growing Companies
            </Badge>
            <h2 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">
              Join Companies Already Winning with AI
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              See how teams are transforming their HR operations and saving
              valuable time every day.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-background/60 h-full border-0 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="mb-4 flex">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-muted-foreground mb-6">
                      &quot;{testimonial.content}&quot;
                    </p>
                    <div className="flex items-center">
                      <div className="bg-primary/10 text-primary mr-3 flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
                        {testimonial.avatar}
                      </div>
                      <div>
                        <div className="text-foreground font-semibold">
                          {testimonial.name}
                        </div>
                        <div className="text-muted-foreground text-sm">
                          {testimonial.role} • {testimonial.company}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl"
        >
          <Card className="from-background to-muted/30 relative overflow-hidden border-0 bg-gradient-to-br backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-6"
              >
                <Badge variant="secondary" className="px-4 py-2">
                  <Brain className="mr-2 h-4 w-4" />
                  Ready to Get Started?
                </Badge>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-foreground mb-4 text-3xl font-bold sm:text-4xl"
              >
                Transform Your HR Operations{" "}
                <span className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-transparent">
                  Today
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground mb-8 text-lg"
              >
                Join the revolution in HR management. Experience the power of
                AI-driven automation, intelligent decision making, and seamless
                employee experiences.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mb-8 grid gap-4 text-left sm:grid-cols-2"
              >
                {ctaFeatures.map((feature) => (
                  <div key={feature} className="flex items-center">
                    <Check className="text-primary mr-3 h-5 w-5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Link href="/sign-up">
                  <Button size="lg" className="h-auto px-8 py-4 text-lg">
                    Start For Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="lg"
                  className="h-auto px-8 py-4 text-lg"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Schedule Demo
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground mt-6 text-sm"
              >
                No credit card required • Setup in minutes • Cancel anytime
              </motion.p>
            </CardContent>

            {/* Decorative Elements */}
            <div className="bg-primary/10 absolute -top-12 -right-12 h-24 w-24 rounded-full blur-2xl" />
            <div className="bg-primary/5 absolute -bottom-12 -left-12 h-32 w-32 rounded-full blur-3xl" />
          </Card>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4 text-sm">
            For further inquiries or project collaborations, feel free to reach
            out.
          </p>
          <div className="flex items-center justify-center gap-6">
            <div className="text-muted-foreground flex items-center text-sm">
              <Mail className="mr-2 h-4 w-4" />
              <a
                href="mailto:hi@adarsha.dev"
                className="text-muted-foreground hover:text-primary hover:underline"
              >
                hi@adarsha.dev
              </a>
            </div>
            <div className="text-muted-foreground flex items-center text-sm">
              <LinkedinIcon className="mr-2 h-4 w-4" />
              <a
                href="https://www.linkedin.com/in/adarshaacharya/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary hover:underline"
              >
                /adarshaacharya
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <p className="text-muted-foreground absolute bottom-4 left-1/2 -translate-x-1/2 transform text-xs">
        © {new Date().getFullYear()} Built by{" "}
        <a href="https://adarsha.dev" className="text-primary">
          Adarsha Acharya
        </a>
        . All rights reserved.
      </p>
    </section>
  );
}
