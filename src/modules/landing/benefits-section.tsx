"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, CheckCircle, Brain, Zap, FileText, BarChart3 } from "lucide-react";

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
        icon: Brain,
        title: "AI-Powered Screening",
        description: "Intelligent evaluation in seconds",
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
        title: "AI Leave Management",
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
        title: "AI Knowledge Chat",
        description: "Chat with your documents instantly",
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
        description: "AI ensures accuracy and compliance",
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
        <div className="mb-12 text-center sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4"
          >
            <Badge variant="secondary" className="px-4 py-2">
              <BarChart3 className="mr-2 h-4 w-4" />
              Traditional vs Modern
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl"
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
            className="text-muted-foreground mx-auto max-w-3xl text-lg"
          >
            See the dramatic difference between traditional HR methods and our
            AI-powered approach. The choice is clear when you compare side by
            side.
          </motion.p>
        </div>

        {/* Comparisons Grid */}
        <div className="space-y-12">
          {comparisons.map((comparison, index) => (
            <motion.div
              key={comparison.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="grid items-center gap-8 lg:grid-cols-2"
            >
              {/* Traditional Way */}
              <Card className="relative overflow-hidden border border-red-200/50 bg-red-50/30 dark:border-red-800/50 dark:bg-red-950/20">
                <CardContent className="p-8">
                  <div className="mb-4 flex items-center justify-between">
                    <Badge variant="destructive" className="text-xs">
                      Traditional Way
                    </Badge>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                      <comparison.traditional.icon className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                  </div>

                  <h3 className="text-foreground mb-2 text-xl font-semibold">
                    {comparison.traditional.title}
                  </h3>

                  <p className="text-muted-foreground mb-4">
                    {comparison.traditional.description}
                  </p>

                  <div className="space-y-2">
                    {comparison.traditional.problems.map((problem) => (
                      <div
                        key={problem}
                        className="flex items-center text-sm text-red-600 dark:text-red-400"
                      >
                        <X className="mr-2 h-3 w-3" />
                        {problem}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Modern Way */}
              <Card className="relative overflow-hidden border border-green-200/50 bg-green-50/30 dark:border-green-800/50 dark:bg-green-950/20">
                <CardContent className="p-8">
                  <div className="mb-4 flex items-center justify-between">
                    <Badge
                      variant="default"
                      className="bg-green-600 text-xs text-white hover:bg-green-700"
                    >
                      Humantryx Way
                    </Badge>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                      <comparison.modern.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                  </div>

                  <h3 className="text-foreground mb-2 text-xl font-semibold">
                    {comparison.modern.title}
                  </h3>

                  <p className="text-muted-foreground mb-4">
                    {comparison.modern.description}
                  </p>

                  <div className="space-y-2">
                    {comparison.modern.benefits.map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-center text-sm text-green-600 dark:text-green-400"
                      >
                        <CheckCircle className="mr-2 h-3 w-3" />
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
          className="bg-muted/50 mt-20 grid gap-8 rounded-2xl p-8 text-center sm:grid-cols-3"
        >
          <div>
            <div className="text-primary mb-2 text-3xl font-bold">80%</div>
            <div className="text-muted-foreground text-sm">
              Time Saved on Admin Tasks
            </div>
          </div>
          <div>
            <div className="text-primary mb-2 text-3xl font-bold">90%</div>
            <div className="text-muted-foreground text-sm">
              Faster Decision Making
            </div>
          </div>
          <div>
            <div className="text-primary mb-2 text-3xl font-bold">99%</div>
            <div className="text-muted-foreground text-sm">
              Accuracy Improvement
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
