"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "motion/react";
import { Home, ArrowLeft, Building2, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center p-4">
      {/* Background gradient matching theme */}
      <div className="from-background via-background to-accent/5 pointer-events-none absolute inset-0 bg-gradient-to-br" />

      <div className="relative w-full max-w-4xl">
        {/* Floating Background Elements - Ocean & Teal theme */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="bg-primary/10 absolute top-20 left-20 h-16 w-16 rounded-full"
          />
          <motion.div
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              rotate: [0, -180, -360],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="bg-accent/10 absolute top-40 right-32 h-12 w-12 rounded-full"
          />
          <motion.div
            animate={{
              x: [0, 60, 0],
              y: [0, -80, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
            className="bg-accent/10 absolute bottom-32 left-1/4 h-20 w-20 rounded-full"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 text-center"
        >
          {/* Header with Logo Effect */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-primary shadow-primary/20 mb-6 inline-flex h-24 w-24 items-center justify-center rounded-2xl shadow-2xl"
            >
              <Building2 className="h-12 w-12 text-white" />
            </motion.div>

            <div className="space-y-2">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-primary text-6xl font-bold md:text-8xl"
              >
                404
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2"
              >
                <Badge variant="secondary" className="px-3 py-1">
                  <Sparkles className="mr-1 h-3 w-3" />
                  AI-Powered
                </Badge>
                <h2 className="text-foreground text-2xl font-semibold md:text-4xl">
                  Humantryx
                </h2>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <h3 className="text-foreground/80 text-xl font-medium md:text-2xl">
              Oops! This page seems to be on a coffee break ☕
            </h3>
            <p className="text-muted-foreground mx-auto max-w-md">
              Our AI is working hard to find what you&apos;re looking for. In
              the meantime, let&apos;s get you back to managing your workforce
              efficiently!
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button
              onClick={() => router.back()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>

            <Link href="/">
              <Button className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="space-y-2 pt-8"
          >
            <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              <span>Streamlining HR with AI since 2024</span>
            </div>
            <p className="text-muted-foreground/60 text-xs">
              Humantryx - Where Technology Meets Human Resources
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
