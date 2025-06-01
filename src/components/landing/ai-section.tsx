"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Brain,
  FileSearch,
  MessageSquare,
  TrendingUp,
  Zap,
  ArrowRight,
  Sparkles,
  Target,
  Users,
} from "lucide-react";

export function AISection() {
  const aiFeatures = [
    {
      icon: FileSearch,
      title: "AI Resume Screening",
      description:
        "Automatically screen and rank resumes using advanced NLP algorithms that understand context, skills, and experience relevance.",
      stats: "95% accuracy",
      highlights: [
        "Context-aware analysis",
        "Bias reduction",
        "Skill matching",
        "Experience validation",
      ],
      demo: "screens 1000+ resumes in minutes",
    },
    {
      icon: MessageSquare,
      title: "Sentiment Analysis",
      description:
        "Analyze employee feedback, surveys, and communications to gauge sentiment and identify potential issues before they escalate.",
      stats: "Real-time insights",
      highlights: [
        "Emotion detection",
        "Trend analysis",
        "Early warnings",
        "Team morale tracking",
      ],
      demo: "processes feedback instantly",
    },
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description:
        "Forecast workforce trends, predict employee turnover, and optimize resource allocation using machine learning models.",
      stats: "85% prediction accuracy",
      highlights: [
        "Turnover prediction",
        "Demand forecasting",
        "Resource optimization",
        "Risk assessment",
      ],
      demo: "predicts 6 months ahead",
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "10x Faster",
      description: "Automate repetitive tasks",
    },
    {
      icon: Target,
      title: "Higher Accuracy",
      description: "Reduce human errors",
    },
    {
      icon: Users,
      title: "Better Decisions",
      description: "Data-driven insights",
    },
    {
      icon: Sparkles,
      title: "Smart Automation",
      description: "Adaptive workflows",
    },
  ];

  return (
    <section
      id="ai"
      className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-cyan-950/20" />
      <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute right-1/4 bottom-0 h-96 w-96 rounded-full bg-purple-400/10 blur-3xl" />

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
              className="border-0 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-blue-700 dark:from-blue-950 dark:to-purple-950 dark:text-blue-300"
            >
              <Brain className="mr-2 h-4 w-4" />
              AI-Powered Intelligence
              <Sparkles className="ml-2 h-4 w-4" />
            </Badge>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mb-6 text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl dark:text-white"
          >
            AI That{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Understands
            </span>{" "}
            Your Workforce
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300"
          >
            Harness the power of artificial intelligence to transform your HR
            processes. Our AI doesn't just automate—it learns, adapts, and
            provides insights that drive real business value.
          </motion.p>
        </div>

        {/* AI Features */}
        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {aiFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="relative h-full overflow-hidden border-0 bg-white/90 shadow-xl backdrop-blur-sm transition-all duration-500 hover:shadow-2xl dark:bg-slate-800/90">
                {/* Gradient Border */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-400 to-cyan-400 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="absolute inset-[1px] rounded-lg bg-white dark:bg-slate-800" />

                <CardContent className="relative p-8">
                  {/* Icon & Stats */}
                  <div className="mb-6 flex items-start justify-between">
                    <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-4 shadow-lg">
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    >
                      {feature.stats}
                    </Badge>
                  </div>

                  {/* Content */}
                  <h3 className="mb-3 text-xl font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {feature.title}
                  </h3>

                  <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>

                  {/* Highlights */}
                  <div className="mb-6 grid grid-cols-2 gap-2">
                    {feature.highlights.map((highlight, idx) => (
                      <div
                        key={idx}
                        className="flex items-center text-sm text-slate-600 dark:text-slate-400"
                      >
                        <div className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
                        {highlight}
                      </div>
                    ))}
                  </div>

                  {/* Demo Info */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 italic dark:text-slate-400">
                      {feature.demo}
                    </span>
                    <ArrowRight className="h-4 w-4 text-blue-500 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 grid grid-cols-2 gap-6 lg:grid-cols-4"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="rounded-2xl border border-slate-200/50 bg-white/60 p-6 text-center backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/60"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <benefit.icon className="h-6 w-6 text-white" />
              </div>
              <h4 className="mb-2 font-bold text-slate-900 dark:text-white">
                {benefit.title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center text-white"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-4 h-8 w-8 rounded-full border border-white" />
            <div className="absolute top-8 right-8 h-6 w-6 rounded-full border border-white" />
            <div className="absolute bottom-4 left-8 h-4 w-4 rounded-full border border-white" />
            <div className="absolute right-4 bottom-8 h-10 w-10 rounded-full border border-white" />
          </div>

          <div className="relative">
            <Brain className="mx-auto mb-6 h-16 w-16 opacity-90" />
            <h3 className="mb-4 text-2xl font-bold sm:text-3xl">
              Ready to Experience AI-Powered HR?
            </h3>
            <p className="mx-auto mb-8 max-w-2xl text-xl opacity-90">
              See how our AI can transform your hiring process, boost employee
              satisfaction, and predict workforce trends with unprecedented
              accuracy.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="h-auto bg-white px-8 py-6 text-lg text-blue-600 hover:bg-gray-100"
              >
                Schedule AI Demo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-auto border-white px-8 py-6 text-lg text-white hover:bg-white/10"
              >
                View AI Case Studies
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
