"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  FileText,
  Briefcase,
  ArrowRight,
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description:
        "Complete employee lifecycle management with digital profiles, onboarding workflows, and role-based access control.",
      benefits: [
        "Digital employee records",
        "Invitation system",
        "Department management",
      ],
    },
    {
      icon: Clock,
      title: "Attendance Tracking",
      description:
        "Monitor employee attendance with real-time tracking, detailed reporting, and automated notifications.",
      benefits: [
        "Real-time tracking",
        "Automated reports",
        "Attendance analytics",
      ],
    },
    {
      icon: Calendar,
      title: "Leave Management",
      description:
        "AI-powered leave management with intelligent approvals, balance tracking, and policy automation.",
      benefits: ["AI-based approvals", "Policy automation", "Balance tracking"],
    },
    {
      icon: DollarSign,
      title: "Payroll Processing",
      description:
        "Automated payroll calculations with tax compliance, payslip generation, and salary management.",
      benefits: [
        "Automated calculations",
        "Digital payslips",
        "Salary management",
      ],
    },
    {
      icon: Briefcase,
      title: "Recruitment",
      description:
        "AI-powered recruitment with resume screening, job posting management, and application tracking.",
      benefits: [
        "AI resume screening",
        "Job posting system",
        "Application tracking",
      ],
    },
    {
      icon: FileText,
      title: "Document Management",
      description:
        "Centralized document storage with AI-powered knowledge chat for instant information retrieval.",
      benefits: ["Document storage", "AI knowledge chat", "Instant search"],
    },
  ];

  return (
    <section
      id="features"
      className="bg-muted/30 px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-7xl">
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
              Core Capabilities
            </Badge>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground mb-6 font-display text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          >
            Everything Your HR Team Needs
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto max-w-3xl text-lg font-medium leading-relaxed sm:text-xl"
          >
            Comprehensive HR management tools designed for modern workplaces.
            Streamline processes, reduce manual work, and empower your team.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group bg-background/40 hover:bg-background/80 h-full border-0 shadow-sm backdrop-blur-md transition-all duration-500 hover:shadow-xl">
                <CardContent className="p-8">
                  <div className="bg-primary/5 group-hover:bg-primary/10 mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110">
                    <feature.icon className="text-primary h-8 w-8" />
                  </div>
                  <h3 className="text-foreground mb-4 font-display text-2xl font-bold">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-8 text-base font-medium leading-relaxed">
                    {feature.description}
                  </p>
                  <ul className="space-y-4">
                    {feature.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="text-muted-foreground flex items-center text-sm font-semibold"
                      >
                        <div className="bg-primary/10 mr-3 flex h-5 w-5 items-center justify-center rounded-full">
                          <ArrowRight className="text-primary h-3 w-3" />
                        </div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
