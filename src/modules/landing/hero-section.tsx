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
import { toast } from "sonner";

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
      className="relative overflow-hidden px-4 pt-32 pb-20 sm:px-6 lg:px-8"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
      <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

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
            className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-7xl"
          >
            The Future of HR is{" "}
            <motion.span 
              className="relative bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                backgroundSize: "200% 200%"
              }}
            >
              AI-Powered
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-600/20 to-purple-600/20 blur-lg"
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [1, 1.05, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </motion.span>
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
            className="mb-12 flex flex-wrap justify-center gap-4"
          >
            {features.map((feature) => (
              <div
                key={feature}
                className="flex items-center space-x-2 rounded-full border border-primary/20 bg-muted/50 px-4 py-2 backdrop-blur-sm"
              >
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
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
            className="mb-16 flex flex-col items-center justify-center gap-6 sm:flex-row"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link href="/sign-up">
                <Button 
                  size="lg" 
                  className="group relative h-auto overflow-hidden bg-gradient-to-r from-primary via-primary to-primary/80 px-8 py-6 text-lg font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                >
                  <span className="relative z-10 flex items-center">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
                className="group relative h-auto overflow-hidden border-2 border-primary/20 bg-background/80 px-8 py-6 text-lg font-semibold backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg"
                onClick={() =>
                  toast("Demo video coming soon!", {
                    description: "Stay tuned for our demo video!",
                    duration: 3000,
                  })
                }
              >
                <span className="relative z-10 flex items-center">
                  <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary/20">
                    <div className="h-0 w-0 border-l-[6px] border-r-0 border-t-[4px] border-b-[4px] border-l-primary border-t-transparent border-b-transparent" />
                  </div>
                  Watch Demo
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="mb-1 text-2xl font-bold text-foreground">
                  {item.stat}
                </div>
                <div className="text-sm text-muted-foreground">
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
        <div className="h-16 w-16 rounded-2xl bg-primary/10" />
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
        <div className="h-12 w-12 rounded-xl bg-primary/20" />
      </motion.div>

      <motion.div
        animate={{
          y: [0, -15, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-32 left-16 hidden lg:block"
      >
        <div className="h-10 w-10 rounded-lg bg-primary/15" />
      </motion.div>

      <motion.div
        animate={{
          y: [0, 25, 0],
          rotate: [0, -8, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute bottom-48 right-20 hidden lg:block"
      >
        <div className="h-14 w-14 rounded-xl bg-primary/12" />
      </motion.div>
    </section>
  );
}
