"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Brain,
  Users,
  TrendingUp,
  Shield,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const features = [
    "AI-Powered Resume Screening",
    "Employee Sentiment Analysis",
    "Predictive Workforce Analytics",
    "Automated Payroll Processing",
  ];

  return (
    <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-purple-950/20" />
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-purple-400/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          {/* Announcement Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 inline-flex items-center"
          >
            <Badge
              variant="secondary"
              className="border-0 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-blue-700 dark:from-blue-950 dark:to-purple-950 dark:text-blue-300"
            >
              <Brain className="mr-2 h-4 w-4" />
              Powered by Advanced AI Technology
              <ArrowRight className="ml-2 h-4 w-4" />
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-4xl font-bold text-slate-900 sm:text-5xl lg:text-7xl dark:text-white"
          >
            The Future of{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              HR Management
            </span>{" "}
            is Here
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-slate-600 dark:text-slate-300"
          >
            Transform your HR operations with Human Loop's AI-powered HRMS.
            Automate resume screening, analyze employee sentiment, and make
            data-driven decisions with predictive workforce analytics.
          </motion.p>

          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10 flex flex-wrap justify-center gap-4"
          >
            {features.map((feature, index) => (
              <div
                key={feature}
                className="flex items-center space-x-2 rounded-full border border-slate-200/50 bg-white/60 px-4 py-2 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/60"
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {feature}
                </span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/sign-in">
              <Button
                size="lg"
                className="h-auto bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 text-lg text-white hover:from-blue-700 hover:to-purple-700"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="h-auto border-slate-300 px-8 py-6 text-lg dark:border-slate-600"
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mx-auto grid max-w-4xl grid-cols-2 gap-8 lg:grid-cols-4"
          >
            {[
              { icon: Users, stat: "10,000+", label: "Employees Managed" },
              { icon: TrendingUp, stat: "85%", label: "Time Saved" },
              { icon: Brain, stat: "99.9%", label: "AI Accuracy" },
              { icon: Shield, stat: "100%", label: "Secure & Compliant" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                  <item.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
                  {item.stat}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {item.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-32 left-8 hidden lg:block"
      >
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 opacity-20" />
      </motion.div>

      <motion.div
        animate={{
          y: [0, 20, 0],
          rotate: [0, -5, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute top-48 right-12 hidden lg:block"
      >
        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-400 to-blue-500 opacity-20" />
      </motion.div>
    </section>
  );
}
