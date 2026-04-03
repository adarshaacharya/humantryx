"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Cpu,
  MessageSquare,
  Calendar,
  UserCheck,
  DollarSign,
  ArrowRight,
  Zap,
  Bot,
  Clock,
} from "lucide-react";

export function AISection() {
  const aiFeatures = [
    {
      icon: UserCheck,
      title: "Intelligent Screening",
      description:
        "Advanced candidate evaluation that analyzes resumes against job requirements, saving hours of manual screening.",
      benefits: [
        "90% faster screening",
        "Bias-free evaluation",
        "Smart matching",
      ],
      color: "from-primary/10 to-accent/10",
    },
    {
      icon: MessageSquare,
      title: "Knowledge Assistant",
      description:
        "Interact with your HR documents. Get instant answers from policies, handbooks, and company documents.",
      benefits: ["Instant answers", "Policy clarity", "24/7 availability"],
      color: "from-chart-3/10 to-chart-4/10",
    },
    {
      icon: Calendar,
      title: "Capacity Planning",
      description:
        "Smart leave approvals based on team capacity, project deadlines, and historical patterns for optimal workforce planning.",
      benefits: ["Smart approvals", "Team optimization", "Conflict prevention"],
      color: "from-accent/10 to-chart-1/10",
    },
    {
      icon: DollarSign,
      title: "Automated Payroll",
      description:
        "Intelligent payroll processing with automatic calculations, tax compliance, and error detection for accuracy.",
      benefits: ["Error-free processing", "Tax compliance", "Time savings"],
      color: "from-chart-4/10 to-chart-5/10",
    },
  ];

  return (
    <section
      id="ai"
      className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8"
    >
      {/* Background */}
      <div className="from-background to-muted/20 absolute inset-0 bg-gradient-to-br" />

      {/* Floating AI Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-10 hidden lg:block"
      >
        <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-2xl backdrop-blur-sm">
          <Cpu className="text-primary h-8 w-8" />
        </div>
      </motion.div>

      <motion.div
        animate={{
          y: [0, 15, 0],
          rotate: [0, -8, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-32 right-16 hidden lg:block"
      >
        <div className="bg-primary/20 flex h-12 w-12 items-center justify-center rounded-xl backdrop-blur-sm">
          <Zap className="text-primary h-6 w-6" />
        </div>
      </motion.div>

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <Badge
              variant="secondary"
              className="border-primary/10 bg-primary/5 px-4 py-2 text-sm font-medium tracking-wide"
            >
              <Cpu className="mr-2 h-4 w-4" />
              Intelligent Automation
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground mb-6 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Let Automation Handle the{" "}
            <span className="from-primary via-accent to-primary bg-gradient-to-r bg-clip-text text-transparent">
              Heavy Lifting
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto max-w-3xl text-lg font-medium leading-relaxed sm:text-xl"
          >
            Our platform doesn&apos;t just automate tasks—it makes intelligent
            decisions, learns from patterns, and continuously improves your HR
            processes. Experience the future of workforce management.
          </motion.p>
        </div>

        {/* AI Features Grid */}
        <div className="grid gap-10 md:grid-cols-2">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              <Card className="group bg-background/40 hover:bg-background/80 relative h-full overflow-hidden border-0 shadow-sm backdrop-blur-md transition-all duration-500 hover:shadow-xl">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                />

                <CardContent className="relative p-10">
                  <div className="bg-primary/5 group-hover:bg-primary/10 mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110">
                    <feature.icon className="text-primary h-8 w-8" />
                  </div>

                  <h3 className="text-foreground mb-4 font-display text-2xl font-bold">
                    {feature.title}
                  </h3>

                  <p className="text-muted-foreground mb-8 text-base font-medium leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="space-y-4">
                    {feature.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center text-sm font-bold">
                        <div className="bg-primary/10 mr-3 flex h-6 w-6 items-center justify-center rounded-full">
                          <Clock className="text-primary h-3 w-3" />
                        </div>
                        <span className="text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="bg-muted/30 mx-auto max-w-2xl rounded-2xl border p-8 backdrop-blur-sm">
            <h3 className="text-foreground mb-4 text-2xl font-semibold">
              Ready to Experience AI-Powered HR?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join hundreds of companies already saving time and improving
              efficiency with our AI tools.
            </p>
            <Button size="lg" className="h-auto px-8 py-4">
              Start Your AI Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
