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
    <section className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:px-8">
      {/* Background Elements */}
      <div className="from-background via-background to-muted/20 absolute inset-0 bg-gradient-to-br" />
      <div className="bg-primary/5 absolute top-1/4 left-1/4 h-72 w-72 rounded-full blur-3xl" />
      <div className="bg-primary/10 absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          {/* Announcement Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 inline-flex items-center"
          >
            <Badge variant="secondary" className="px-4 py-2">
              <Brain className="mr-2 h-4 w-4" />
              🚀 AI-First HRMS Platform
              <ArrowRight className="ml-2 h-4 w-4" />
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-foreground mb-6 text-4xl font-bold sm:text-5xl lg:text-7xl"
          >
            The Future of HR is{" "}
            <span className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-transparent">
              AI-Powered
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto mb-8 max-w-3xl text-xl leading-relaxed"
          >
            Replace traditional HR systems with Humantryx&apos;s intelligent
            automation. Cut administrative workload by 80% while delivering
            exceptional employee experiences through AI-powered decision making.
          </motion.p>

          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-10 flex flex-wrap justify-center gap-4"
          >
            {features.map((feature) => (
              <div
                key={feature}
                className="bg-muted/50 flex items-center space-x-2 rounded-full border px-4 py-2 backdrop-blur-sm"
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
            className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link href="/sign-up">
              <Button size="lg" className="h-auto px-8 py-6 text-lg">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="h-auto px-8 py-6 text-lg"
              onClick={() =>
                window.open(
                  "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
                  "_blank",
                )
              }
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
        <div className="bg-primary/10 h-16 w-16 rounded-2xl" />
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
        <div className="bg-primary/20 h-12 w-12 rounded-xl" />
      </motion.div>
    </section>
  );
}
