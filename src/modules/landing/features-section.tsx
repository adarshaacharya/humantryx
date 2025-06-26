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
        <div className="mb-12 text-center sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4"
          >
            <Badge variant="secondary" className="px-4 py-2">
              Core Features
            </Badge>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-foreground mb-4 text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            Everything Your HR Team Needs
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto max-w-3xl text-lg"
          >
            Comprehensive HR management tools designed for modern workplaces.
            Streamline processes, reduce manual work, and empower your team.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group bg-background/60 hover:bg-background h-full border-0 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                <CardContent className="p-6">
                  <div className="bg-primary/10 mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg">
                    <feature.icon className="text-primary h-6 w-6" />
                  </div>
                  <h3 className="text-foreground mb-3 text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {feature.description}
                  </p>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit) => (
                      <li
                        key={benefit}
                        className="text-muted-foreground flex items-center text-sm"
                      >
                        <ArrowRight className="text-primary mr-2 h-3 w-3" />
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
