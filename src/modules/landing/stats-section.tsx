"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  TrendingUp,
  Clock,
  DollarSign,
  Award,
  Building,
  Globe,
  Zap,
} from "lucide-react";

export function StatsSection() {
  const mainStats = [
    {
      icon: Users,
      number: "50,000+",
      label: "Employees Managed",
      description: "Across global organizations",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Building,
      number: "500+",
      label: "Companies Trust Us",
      description: "From startups to enterprises",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Clock,
      number: "85%",
      label: "Time Reduction",
      description: "In HR administrative tasks",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: DollarSign,
      number: "$2.5M+",
      label: "Cost Savings",
      description: "Generated for our clients",
      color: "from-orange-500 to-red-500",
    },
  ];

  const achievements = [
    {
      icon: Award,
      title: "Best HR Tech 2024",
      subtitle: "HR Excellence Awards",
    },
    {
      icon: TrendingUp,
      title: "99.9% Uptime",
      subtitle: "Reliable & Secure",
    },
    {
      icon: Globe,
      title: "Global Presence",
      subtitle: "25+ Countries",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      subtitle: "< 200ms Response",
    },
  ];

  const testimonialStats = [
    { metric: "98%", label: "Customer Satisfaction" },
    { metric: "4.9/5", label: "Average Rating" },
    { metric: "95%", label: "Would Recommend" },
    { metric: "92%", label: "Renewal Rate" },
  ];

  return (
    <section
      id="stats"
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
              <TrendingUp className="mr-2 h-4 w-4" />
              Proven Results
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl dark:text-white"
          >
            Numbers That{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Speak for Themselves
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300"
          >
            See why thousands of HR professionals and organizations worldwide
            choose Human Loop to transform their human resource management.
          </motion.p>
        </div>

        {/* Main Stats Grid */}
        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {mainStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <Card className="border-0 bg-white/80 text-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl dark:bg-slate-800/80">
                <CardContent className="p-8">
                  <div
                    className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} mb-6 shadow-lg`}
                  >
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>

                  <motion.div
                    initial={{ scale: 0.5 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2, type: "spring" }}
                    className="mb-2 text-4xl font-bold text-slate-900 dark:text-white"
                  >
                    {stat.number}
                  </motion.div>

                  <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                    {stat.label}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 grid grid-cols-2 gap-6 lg:grid-cols-4"
        >
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-slate-200/50 bg-white/60 p-6 text-center backdrop-blur-sm transition-colors hover:border-blue-300 dark:border-slate-700/50 dark:bg-slate-800/60 dark:hover:border-blue-600"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                <achievement.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="mb-1 font-bold text-slate-900 dark:text-white">
                {achievement.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {achievement.subtitle}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Customer Satisfaction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-white"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 h-32 w-32 -translate-x-16 -translate-y-16 rounded-full border border-white" />
            <div className="absolute right-0 bottom-0 h-48 w-48 translate-x-24 translate-y-24 rounded-full border border-white" />
          </div>

          <div className="relative">
            <div className="mb-12 text-center">
              <h3 className="mb-4 text-2xl font-bold sm:text-3xl">
                Loved by HR Teams Worldwide
              </h3>
              <p className="mx-auto max-w-2xl text-xl opacity-90">
                Our commitment to excellence is reflected in the satisfaction
                and success of our users.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {testimonialStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="mb-2 text-3xl font-bold sm:text-4xl">
                    {stat.metric}
                  </div>
                  <div className="text-sm opacity-80">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Testimonial Quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mx-auto mt-12 max-w-3xl text-center"
            >
              <blockquote className="mb-6 text-xl italic opacity-90">
                "Human Loop has revolutionized our HR processes. The AI-powered
                features save us hours daily, and the insights help us make
                better decisions for our workforce."
              </blockquote>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Sarah Johnson</div>
                  <div className="text-sm opacity-80">VP of HR, TechCorp</div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
