"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Clock,
  Brain,
  CheckCircle,
  Building,
  Zap,
  Shield,
  Sparkles,
} from "lucide-react";

export function StatsSection() {
  const mainStats = [
    {
      icon: Users,
      number: "500+",
      label: "Companies Trust Us",
      description: "From startups to enterprises",
    },
    {
      icon: Clock,
      number: "80%",
      label: "Time Reduction",
      description: "In HR administrative tasks",
    },
    {
      icon: Brain,
      number: "24/7",
      label: "AI Automation",
      description: "Intelligent decisions never sleep",
    },
    {
      icon: TrendingUp,
      number: "99.9%",
      label: "Uptime",
      description: "Reliable service you can count on",
    },
  ];

  const modernBenefits = [
    {
      icon: CheckCircle,
      title: "AI-First Approach",
      description:
        "Built from the ground up with AI at its core, not as an afterthought",
    },
    {
      icon: Zap,
      title: "Instant Setup",
      description: "Get your entire HR system running in minutes, not months",
    },
    {
      icon: Building,
      title: "Scale Effortlessly",
      description: "Grows with your team from 5 to 5000 employees seamlessly",
    },
    {
      icon: Sparkles,
      title: "Smart Automation",
      description:
        "AI handles routine tasks so your team can focus on strategic work",
    },
  ];

  return (
    <section id="stats" className="bg-muted/30 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4"
          >
            <Badge variant="secondary" className="px-4 py-2">
              <Shield className="mr-2 h-4 w-4" />
              Why Choose Human Loop
            </Badge>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            Built for{" "}
            <span className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-transparent">
              Modern HR Teams
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto max-w-3xl text-lg"
          >
            Join the companies that have already transformed their HR operations
            with our AI-powered platform. Experience the difference intelligent
            automation makes.
          </motion.p>
        </div>

        {/* Main Stats */}
        <div className="mb-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {mainStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group bg-background/60 hover:shadow-primary/5 border-0 text-center backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl transition-all duration-300">
                    <stat.icon className="text-primary h-7 w-7" />
                  </div>
                  <div className="text-foreground mb-2 text-3xl font-bold">
                    {stat.number}
                  </div>
                  <div className="text-foreground mb-2 font-semibold">
                    {stat.label}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {stat.description}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Modern vs Traditional Section */}
        <div className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h3 className="text-foreground mb-4 text-2xl font-bold sm:text-3xl">
              Modern HRMS vs Traditional Systems
            </h3>
            <p className="text-muted-foreground mx-auto max-w-2xl">
              See why forward-thinking companies are making the switch to
              AI-powered HR management.
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {modernBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <Card className="group bg-background/60 h-full border-0 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="bg-primary/10 group-hover:bg-primary/20 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-all duration-300">
                      <benefit.icon className="text-primary h-6 w-6" />
                    </div>
                    <h4 className="text-foreground mb-3 font-semibold">
                      {benefit.title}
                    </h4>
                    <p className="text-muted-foreground text-sm">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-background/60 mx-auto max-w-2xl rounded-2xl border p-8 backdrop-blur-sm">
            <Brain className="text-primary mx-auto mb-4 h-12 w-12" />
            <h3 className="text-foreground mb-4 text-xl font-semibold">
              Ready to Experience the Difference?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join hundreds of companies already saving time and improving
              efficiency with Human Loop.
            </p>
            <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Free trial available
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                No setup fees
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Cancel anytime
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
