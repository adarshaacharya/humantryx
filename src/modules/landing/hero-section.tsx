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

const features = [
  "AI Resume Screening",
  "Document Knowledge Chat",
  "AI-Based Leave Management",
  "Automated Payroll Processing",
];

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden px-6 pt-24 pb-16 sm:px-8 sm:pt-32 sm:pb-20 lg:px-12 lg:pt-40 lg:pb-24"
    >
      {/* Background Elements */}
      <div className="from-background via-background to-muted/10 absolute inset-0 bg-gradient-to-br" />
      <div className="bg-primary/5 absolute top-20 -left-20 h-40 w-40 rounded-full blur-3xl sm:h-60 sm:w-60 lg:h-80 lg:w-80" />
      <div className="bg-primary/8 absolute -right-20 -bottom-20 h-40 w-40 rounded-full blur-3xl sm:h-60 sm:w-60 lg:h-80 lg:w-80" />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          {/* Announcement Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 inline-flex items-center sm:mb-10"
          >
            <Badge
              variant="secondary"
              className="border-primary/20 bg-primary/5 border px-4 py-2 text-sm"
            >
              <Brain className="mr-2 h-4 w-4" />
              AI-First HRMS Platform
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-foreground mb-6 text-4xl leading-[1.1] font-bold tracking-tight sm:mb-8 sm:text-5xl lg:text-6xl xl:text-7xl"
          >
            The Future of HR is{" "}
            <span className="from-primary bg-gradient-to-r via-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-Powered
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto mb-10 max-w-2xl text-lg leading-relaxed sm:mb-12 sm:text-xl"
          >
            Replace traditional HR systems with intelligent automation. Cut
            administrative workload by 80% while delivering exceptional employee
            experiences.
          </motion.p>

          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mx-auto mb-10 hidden max-w-3xl flex-wrap justify-center gap-4 sm:mb-16 sm:flex"
          >
            {features.map((feature) => (
              <div
                key={feature}
                className="border-primary/20 bg-background/50 flex items-center space-x-3 rounded-full border px-5 py-3 shadow-sm backdrop-blur-sm"
              >
                <CheckCircle className="text-primary h-4 w-4" />
                <span className="text-foreground text-sm font-medium">
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
            className="mb-12 flex flex-col items-center justify-center gap-4 sm:mb-20 sm:flex-row sm:gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="group from-primary via-primary to-primary/80 shadow-primary/25 hover:shadow-primary/30 relative h-14 overflow-hidden bg-gradient-to-r px-8 text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl sm:h-16 sm:px-10 sm:text-lg"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <div className="from-primary/10 absolute inset-0 bg-gradient-to-r to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="group border-primary/20 bg-background/80 hover:border-primary/50 hover:bg-primary/5 relative h-14 overflow-hidden border-2 px-8 text-base font-semibold backdrop-blur-sm transition-all duration-300 hover:shadow-lg sm:h-16 sm:px-10 sm:text-lg"
                onClick={() =>
                  window.open("https://youtu.be/xuPdJo9f9Xw", "_blank")
                }
              >
                <span className="relative z-10 flex items-center">
                  <div className="bg-primary/10 group-hover:bg-primary/20 mr-3 flex h-6 w-6 items-center justify-center rounded-full transition-colors duration-300">
                    <div className="border-l-primary h-0 w-0 border-t-[4px] border-r-0 border-b-[4px] border-l-[6px] border-t-transparent border-b-transparent" />
                  </div>
                  Watch Demo
                </span>
                <div className="from-primary/5 absolute inset-0 bg-gradient-to-r to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mx-auto grid max-w-4xl grid-cols-2 gap-8 lg:grid-cols-4"
          >
            {[
              { icon: Users, stat: "3x", label: "Faster Onboarding" },
              { icon: TrendingUp, stat: "80%", label: "Workload Reduction" },
              { icon: Brain, stat: "24/7", label: "AI-Powered Support" },
              { icon: Shield, stat: "99.9%", label: "Uptime Guarantee" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-muted mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl">
                  <item.icon className="text-primary h-6 w-6" />
                </div>
                <div className="text-foreground mb-1 text-2xl font-bold">
                  {item.stat}
                </div>
                <div className="text-muted-foreground text-sm">
                  {item.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Floating Elements - Simplified */}
      <motion.div
        animate={{
          y: [0, -10, 0],
          rotate: [0, 3, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-8 hidden opacity-40 lg:block"
      >
        <div className="bg-primary/20 h-8 w-8 rounded-lg" />
      </motion.div>

      <motion.div
        animate={{
          y: [0, 15, 0],
          rotate: [0, -3, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute right-12 bottom-1/3 hidden opacity-40 lg:block"
      >
        <div className="bg-primary/30 h-6 w-6 rounded-md" />
      </motion.div>
    </section>
  );
}
