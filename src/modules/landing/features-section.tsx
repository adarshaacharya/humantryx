"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  DollarSign,
  Clock,
  FileCheck,
  Shield,
  BarChart3,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description:
        "Comprehensive employee profiles, onboarding, and lifecycle management with automated workflows.",
      benefits: [
        "Digital employee records",
        "Automated onboarding",
        "Performance tracking",
      ],
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Calendar,
      title: "Attendance Tracking",
      description:
        "Real-time attendance monitoring with biometric integration and detailed reporting.",
      benefits: [
        "Biometric integration",
        "Real-time monitoring",
        "Automated reports",
      ],
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: FileCheck,
      title: "Leave Management",
      description:
        "Streamlined leave requests, approvals, and balance tracking with automated notifications.",
      benefits: [
        "Digital leave requests",
        "Auto approvals",
        "Balance tracking",
      ],
      color: "from-purple-500 to-violet-500",
    },
    {
      icon: DollarSign,
      title: "Payroll Processing",
      description:
        "Automated salary calculations, tax deductions, and payslip generation with compliance.",
      benefits: [
        "Automated calculations",
        "Tax compliance",
        "Digital payslips",
      ],
      color: "from-orange-500 to-red-500",
    },
    {
      icon: BarChart3,
      title: "HR Analytics",
      description:
        "Advanced analytics and insights to make data-driven HR decisions and optimize workforce.",
      benefits: [
        "Real-time dashboards",
        "Predictive insights",
        "Custom reports",
      ],
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Shield,
      title: "Compliance & Security",
      description:
        "Enterprise-grade security with role-based access and compliance with data protection laws.",
      benefits: ["GDPR compliant", "Role-based access", "Data encryption"],
      color: "from-indigo-500 to-blue-500",
    },
  ];

  return (
    <section
      id="features"
      className="bg-slate-50/50 px-4 py-24 sm:px-6 lg:px-8 dark:bg-slate-900/50"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center"
          >
            <Badge variant="secondary" className="px-3 py-1">
              <Users className="mr-2 h-4 w-4" />
              Complete HR Suite
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl dark:text-white"
          >
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Manage Your Workforce
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300"
          >
            From recruitment to retirement, our comprehensive HRMS covers every
            aspect of human resource management with intelligent automation and
            deep insights.
          </motion.p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="h-full border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:bg-slate-800/80">
                <CardContent className="p-8">
                  {/* Icon */}
                  <div className="mb-6">
                    <div
                      className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="mb-3 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {feature.title}
                  </h3>

                  <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>

                  {/* Benefits */}
                  <ul className="mb-6 space-y-2">
                    {feature.benefits.map((benefit, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-sm text-slate-600 dark:text-slate-400"
                      >
                        <div className="mr-3 h-1.5 w-1.5 rounded-full bg-green-500" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  {/* Learn More */}
                  <div className="flex items-center font-medium text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
                    <span className="text-sm">Learn more</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center space-x-4 rounded-2xl border border-slate-200/50 bg-white/60 p-6 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/60">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-purple-500 text-sm font-semibold text-white dark:border-slate-800"
                >
                  {i}
                </div>
              ))}
            </div>
            <div className="text-left">
              <p className="font-semibold text-slate-900 dark:text-white">
                Join 500+ companies already using Human Loop
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Trusted by HR teams worldwide
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
