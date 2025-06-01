"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Check,
  Star,
  Users,
  Brain,
  Shield,
  Zap,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";
import Link from "next/link";

export function CTASection() {
  const plans = [
    {
      name: "Starter",
      price: "$29",
      period: "per employee/month",
      description: "Perfect for small teams getting started with modern HR",
      features: [
        "Employee Management",
        "Basic Attendance Tracking",
        "Leave Management",
        "Basic Reporting",
        "Email Support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Professional",
      price: "$49",
      period: "per employee/month",
      description: "Advanced features for growing organizations",
      features: [
        "Everything in Starter",
        "AI Resume Screening",
        "Payroll Processing",
        "Advanced Analytics",
        "Sentiment Analysis",
        "Priority Support",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "tailored pricing",
      description: "Full-scale solution for large organizations",
      features: [
        "Everything in Professional",
        "Custom AI Models",
        "Advanced Integrations",
        "Dedicated Support",
        "SLA Guarantee",
        "Custom Training",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const trustIndicators = [
    { icon: Shield, text: "SOC 2 Compliant" },
    { icon: Users, text: "GDPR Ready" },
    { icon: Star, text: "99.9% Uptime" },
    { icon: Zap, text: "24/7 Support" },
  ];

  return (
    <section className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center"
          >
            <Badge
              variant="secondary"
              className="border-0 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 text-green-700 dark:from-green-950 dark:to-blue-950 dark:text-green-300"
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
            className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl dark:text-white"
          >
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300"
          >
            Start your journey towards smarter HR management. All plans include
            a 14-day free trial, no credit card required.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 transform">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1 text-white">
                    <Star className="mr-1 h-3 w-3" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <Card
                className={`h-full border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                  plan.popular
                    ? "bg-gradient-to-br from-blue-50 to-purple-50 ring-2 ring-blue-500/20 dark:from-blue-950/50 dark:to-purple-950/50"
                    : "bg-white/80 dark:bg-slate-800/80"
                } backdrop-blur-sm`}
              >
                <CardContent className="p-8">
                  {/* Header */}
                  <div className="mb-8 text-center">
                    <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="mb-4 text-slate-600 dark:text-slate-400">
                      {plan.description}
                    </p>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        {plan.price}
                      </span>
                      <span className="ml-2 text-slate-600 dark:text-slate-400">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center text-slate-700 dark:text-slate-300"
                      >
                        <Check className="mr-3 h-5 w-5 flex-shrink-0 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link href="/sign-in" className="block">
                    <Button
                      className={`h-auto w-full py-6 text-lg ${
                        plan.popular
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          : ""
                      }`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 flex flex-wrap justify-center gap-8"
        >
          {trustIndicators.map((indicator, index) => (
            <motion.div
              key={indicator.text}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-2 rounded-full border border-slate-200/50 bg-white/60 px-4 py-2 backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/60"
            >
              <indicator.icon className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {indicator.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-12 text-center text-white dark:from-slate-800 dark:to-slate-700"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 h-full w-full">
              <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="white"
                      strokeWidth="1"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>

          <div className="relative">
            <Brain className="mx-auto mb-6 h-16 w-16 opacity-90" />
            <h3 className="mb-4 text-2xl font-bold sm:text-3xl">
              Still Have Questions?
            </h3>
            <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
              Our team of HR experts is here to help you choose the right plan
              and get started. Schedule a personalized demo today.
            </p>

            <div className="mb-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="h-auto bg-white px-8 py-6 text-lg text-slate-800 hover:bg-gray-100"
              >
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-auto border-white px-8 py-6 text-lg text-white hover:bg-white/10"
              >
                <Mail className="mr-2 h-5 w-5" />
                Contact Sales
              </Button>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col items-center justify-center gap-6 text-sm opacity-80 sm:flex-row">
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                <span>sales@humanloop.com</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-slate-600 dark:text-slate-400">
            No setup fees • Cancel anytime • 14-day free trial • No credit card
            required
          </p>
        </motion.div>
      </div>
    </section>
  );
}
