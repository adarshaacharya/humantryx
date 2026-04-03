"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Zap,
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
      <div className="from-background via-background/95 to-muted/5 absolute inset-0 bg-gradient-to-br" />
      <div className="bg-primary/5 absolute top-20 -left-20 h-60 w-60 rounded-full blur-3xl lg:h-96 lg:w-96" />
      <div className="bg-accent/5 absolute -right-20 -bottom-20 h-60 w-60 rounded-full blur-3xl lg:h-96 lg:w-96" />

      <div className="relative mx-auto max-w-7xl">
        <div className="text-center">
          {/* Announcement Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 inline-flex items-center"
          >
            <Badge
              variant="secondary"
              className="border-primary/10 bg-primary/5 px-4 py-2 text-sm font-medium tracking-wide shadow-sm backdrop-blur-sm"
            >
              <Zap className="text-primary mr-2 h-4 w-4" />
              Next-Gen HRMS Platform
            </Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-foreground mb-8 font-display text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl"
          >
            The Future of HR is{" "}
            <span className="from-primary via-accent to-primary bg-gradient-to-r bg-clip-text text-transparent">
              AI-Powered
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg leading-relaxed font-medium sm:text-xl"
          >
            Replace traditional HR systems with intelligent automation. Cut
            administrative workload by 80% while delivering exceptional employee
            experiences.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="group from-primary to-primary/90 shadow-primary/20 relative h-14 overflow-hidden rounded-full bg-gradient-to-r px-10 text-base font-bold shadow-xl transition-all duration-300 hover:shadow-2xl sm:h-16 sm:px-12 sm:text-lg"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="group border-primary/10 bg-background/50 hover:border-primary/30 hover:bg-primary/5 relative h-14 overflow-hidden rounded-full border-2 px-10 text-base font-bold backdrop-blur-sm transition-all duration-300 hover:shadow-lg sm:h-16 sm:px-12 sm:text-lg"
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
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats - More subtle and modern */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mx-auto grid max-w-5xl grid-cols-2 gap-12 lg:grid-cols-4"
          >
            {[
              { icon: Users, stat: "3x", label: "Faster Onboarding" },
              { icon: TrendingUp, stat: "80%", label: "Workload Reduction" },
              { icon: Zap, stat: "24/7", label: "Automated Support" },
              { icon: Shield, stat: "99.9%", label: "Uptime Guarantee" },
            ].map((item, index) => (
              <div key={index} className="group flex flex-col items-center">
                <div className="bg-primary/5 group-hover:bg-primary/10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-colors duration-300">
                  <item.icon className="text-primary h-7 w-7" />
                </div>
                <div className="text-foreground mb-1 font-display text-3xl font-bold">
                  {item.stat}
                </div>
                <div className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
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
