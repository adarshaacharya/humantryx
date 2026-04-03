"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Check,
  Zap,
  Calendar,
  Mail,
  LinkedinIcon,
} from "lucide-react";
import Link from "next/link";

export function CTASection() {
  const ctaFeatures = [
    "Complete employee lifecycle management",
    "Intelligent automation and insights",
    "Advanced payroll and attendance tracking",
    "Document management with instant search",
    "Role-based access and permissions",
    "Real-time analytics and reporting",
  ];

  return (
    <section className="relative overflow-hidden px-6 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
      {/* Background */}
      <div className="from-primary/3 via-background to-muted/10 absolute inset-0 bg-gradient-to-br" />

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
        className="absolute top-20 left-8 hidden opacity-40 xl:block"
      >
        <div className="bg-primary/15 flex h-8 w-8 items-center justify-center rounded-lg backdrop-blur-sm">
          <Zap className="text-primary h-4 w-4" />
        </div>
      </motion.div>

      <div className="relative mx-auto max-w-7xl">
        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl"
        >
          <Card className="from-background to-muted/10 border-primary/5 relative overflow-hidden border bg-gradient-to-br shadow-2xl backdrop-blur-xl">
            <CardContent className="p-10 text-center sm:p-16 lg:p-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <Badge
                  variant="secondary"
                  className="border-primary/10 bg-primary/5 border px-4 py-2 text-sm font-bold tracking-wide"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Ready to Get Started?
                </Badge>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-foreground mb-6 font-display text-4xl leading-tight font-bold sm:text-5xl lg:text-6xl"
              >
                Transform Your HR Operations{" "}
                <span className="from-primary to-primary/70 bg-gradient-to-r bg-clip-text text-transparent">
                  Today
                </span>
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground mx-auto mb-12 max-w-2xl text-lg font-medium leading-relaxed sm:text-xl"
              >
                Join the revolution in HR management. Experience the power of
                AI-driven automation and seamless employee experiences.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mx-auto mb-12 grid max-w-3xl gap-6 text-left sm:grid-cols-2 lg:gap-8"
              >
                {ctaFeatures.map((feature) => (
                  <div key={feature} className="flex items-start">
                    <div className="bg-primary/10 mt-1 mr-4 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
                      <Check className="text-primary h-4 w-4" />
                    </div>
                    <span className="text-muted-foreground text-base font-bold">
                      {feature}
                    </span>
                  </div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center justify-center gap-6 sm:flex-row"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Link href="/sign-up">
                    <Button
                      size="lg"
                      className="h-14 w-full rounded-full px-10 text-base font-bold shadow-xl shadow-primary/20 sm:h-16 sm:w-auto sm:px-12 sm:text-lg"
                    >
                      Start For Free
                      <ArrowRight className="ml-2 h-5 w-5" />
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
                    className="border-primary/10 hover:border-primary/30 h-14 w-full rounded-full border-2 px-10 text-base font-bold backdrop-blur-sm sm:h-16 sm:w-auto sm:px-12 sm:text-lg"
                    onClick={() => {
                      window.location.href =
                        "https://cal.com/adarshaacharya/schedule";
                    }}
                  >
                    <Calendar className="mr-2 h-5 w-5" />
                    Schedule Demo
                  </Button>
                </motion.div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground mt-10 text-sm font-bold tracking-wide uppercase"
              >
                No credit card required • Setup in minutes • Cancel anytime
              </motion.p>
            </CardContent>

            {/* Decorative Elements - Simplified */}
            <div className="bg-primary/8 absolute -top-8 -right-8 h-16 w-16 rounded-full blur-2xl" />
            <div className="bg-primary/5 absolute -bottom-8 -left-8 h-20 w-20 rounded-full blur-2xl" />
          </Card>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center sm:mt-12"
        >
          <p className="text-muted-foreground mb-3 text-sm sm:mb-4">
            For further inquiries or project collaborations, feel free to reach
            out.
          </p>
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-6">
            <div className="text-muted-foreground flex items-center text-sm">
              <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <a
                href="mailto:hi@adarsha.dev"
                className="text-muted-foreground hover:text-primary transition-colors hover:underline"
              >
                hi@adarsha.dev
              </a>
            </div>
            <div className="text-muted-foreground flex items-center text-sm">
              <LinkedinIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <a
                href="https://www.linkedin.com/in/adarshaacharya/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors hover:underline"
              >
                /adarshaacharya
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <p className="text-muted-foreground absolute bottom-2 left-1/2 w-full -translate-x-1/2 transform text-center text-xs sm:bottom-4 sm:text-sm">
        © {new Date().getFullYear()} Built by{" "}
        <a href="https://adarsha.dev" className="text-primary">
          Adarsha Acharya
        </a>
        . All rights reserved.
      </p>
    </section>
  );
}
