"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, Cpu, Zap, FileText, BarChart3 } from "lucide-react";

export function BenefitsSection() {
  const comparisons = [
    {
      category: "Resume Screening",
      traditional: {
        icon: X,
        title: "Manual Review",
        description: "Hours spent reading each resume manually",
        problems: ["Time consuming", "Human bias", "Inconsistent evaluation"],
      },
      modern: {
        icon: Cpu,
        title: "Intelligent Screening",
        description: "Advanced evaluation in seconds",
        benefits: ["90% faster", "Bias-free analysis", "Consistent scoring"],
      },
    },
    {
      category: "Leave Management",
      traditional: {
        icon: X,
        title: "Paper Forms & Email",
        description: "Manual approval process with spreadsheets",
        problems: ["Lost requests", "Manual tracking", "Delayed approvals"],
      },
      modern: {
        icon: CheckCircle,
        title: "Capacity Planning",
        description: "Smart approvals based on team capacity",
        benefits: [
          "Instant decisions",
          "Team optimization",
          "Automated tracking",
        ],
      },
    },
    {
      category: "Document Access",
      traditional: {
        icon: X,
        title: "File Searching",
        description: "Digging through folders and documents",
        problems: ["Time wasted", "Information silos", "Outdated policies"],
      },
      modern: {
        icon: FileText,
        title: "Knowledge Assistant",
        description: "Interact with your documents instantly",
        benefits: ["Instant answers", "Always up-to-date", "24/7 availability"],
      },
    },
    {
      category: "Payroll Processing",
      traditional: {
        icon: X,
        title: "Manual Calculations",
        description: "Spreadsheets prone to human error",
        problems: ["Calculation errors", "Compliance risks", "Time intensive"],
      },
      modern: {
        icon: Zap,
        title: "Automated Payroll",
        description: "Intelligent accuracy and compliance",
        benefits: [
          "Error-free processing",
          "Tax compliance",
          "Instant payslips",
        ],
      },
    },
  ];

  return (
    <section
      id="benefits"
      className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
    >
      {/* Background */}
      <div className="from-background to-muted/30 absolute inset-0 bg-gradient-to-br" />

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
              <BarChart3 className="mr-2 h-4 w-4" />
              Traditional vs Modern
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground mb-6 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Why Companies Are{" "}
            <span className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-transparent">
              Making the Switch
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto max-w-3xl text-lg font-medium leading-relaxed sm:text-xl"
          >
            See the dramatic difference between traditional HR methods and our
            AI-powered approach. The choice is clear when you compare side by
            side.
          </motion.p>
        </div>

        {/* Comparisons Grid */}
        <div className="space-y-16">
          {comparisons.map((comparison, index) => (
            <motion.div
              key={comparison.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="grid items-stretch gap-10 lg:grid-cols-2"
            >
              {/* Traditional Way */}
              <Card className="relative overflow-hidden border-0 bg-red-50/40 shadow-sm transition-all duration-500 hover:shadow-md dark:bg-red-950/10">
                <CardContent className="p-10">
                  <div className="mb-6 flex items-center justify-between">
                    <Badge variant="destructive" className="px-3 py-1 text-xs font-bold uppercase tracking-wider">
                      Traditional Way
                    </Badge>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                      <comparison.traditional.icon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                  </div>

                  <h3 className="text-foreground mb-4 font-display text-2xl font-bold">
                    {comparison.traditional.title}
                  </h3>

                  <p className="text-muted-foreground mb-8 text-base font-medium leading-relaxed">
                    {comparison.traditional.description}
                  </p>

                  <div className="space-y-4">
                    {comparison.traditional.problems.map((problem) => (
                      <div
                        key={problem}
                        className="flex items-center text-sm font-bold text-red-600 dark:text-red-400"
                      >
                        <X className="mr-3 h-4 w-4" />
                        {problem}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Modern Way */}
              <Card className="relative overflow-hidden border-0 bg-green-50/40 shadow-sm transition-all duration-500 hover:shadow-md dark:bg-green-950/10">
                <CardContent className="p-10">
                  <div className="mb-6 flex items-center justify-between">
                    <Badge
                      variant="default"
                      className="bg-green-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white hover:bg-green-700"
                    >
                      Humantryx Way
                    </Badge>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <comparison.modern.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  <h3 className="text-foreground mb-4 font-display text-2xl font-bold">
                    {comparison.modern.title}
                  </h3>

                  <p className="text-muted-foreground mb-8 text-base font-medium leading-relaxed">
                    {comparison.modern.description}
                  </p>

                  <div className="space-y-4">
                    {comparison.modern.benefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-center text-sm font-bold text-green-600 dark:text-green-400"
                      >
                        <CheckCircle className="mr-3 h-4 w-4" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="bg-muted/30 mt-24 grid gap-12 rounded-3xl p-12 text-center backdrop-blur-md sm:grid-cols-3"
        >
          <div>
            <div className="text-primary mb-2 font-display text-5xl font-bold">80%</div>
            <div className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
              Time Saved
            </div>
          </div>
          <div>
            <div className="text-primary mb-2 font-display text-5xl font-bold">90%</div>
            <div className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
              Faster Decisions
            </div>
          </div>
          <div>
            <div className="text-primary mb-2 font-display text-5xl font-bold">99%</div>
            <div className="text-muted-foreground text-sm font-bold uppercase tracking-widest">
              Accuracy
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
