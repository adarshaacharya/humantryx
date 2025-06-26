"use client";

import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, UserCheck, MessageSquare, Sparkles } from "lucide-react";

const videoFeatures = [
  {
    id: "resume-screening",
    video: "/videos/resume-screening.mov",
    icon: UserCheck,
    title: "AI-Powered Resume Screening",
    subtitle: "Intelligent Hiring Made Simple",
    description:
      "Watch our AI analyze resumes in seconds, ranking candidates based on job requirements and eliminating bias from your hiring process.",
    features: [
      "90% faster screening time",
      "Bias-free candidate evaluation",
      "Smart skill matching",
      "Automated ranking system",
    ],
    color: "from-blue-500/10 to-cyan-500/10",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "leave-request",
    video: "/videos/leave-request.mov",
    icon: Calendar,
    title: "Smart Leave Management",
    subtitle: "Effortless Time-Off Planning",
    description:
      "Experience seamless leave management with intelligent approval workflows that consider team capacity and project deadlines.",
    features: [
      "One-click leave requests",
      "Smart approval routing",
      "Team capacity planning",
      "Conflict prevention",
    ],
    color: "from-green-500/10 to-emerald-500/10",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "chat-bot",
    video: "/videos/chat-bot.mov",
    icon: MessageSquare,
    title: "AI HR Assistant",
    subtitle: "Instant Answers, Always Available",
    description:
      "Meet your 24/7 HR companion that instantly answers questions about policies, benefits, and procedures using your company documents.",
    features: [
      "Instant policy answers",
      "Document-based responses",
      "24/7 availability",
      "Natural conversations",
    ],
    color: "from-purple-500/10 to-pink-500/10",
    gradient: "from-purple-500 to-pink-500",
  },
];

export function VideoShowcaseSection() {
  return (
    <section
      id="showcase"
      className="from-background to-muted/20 bg-gradient-to-b py-12 sm:py-16 lg:py-24"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center sm:mb-16"
        >
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            <Sparkles className="mr-1 h-3 w-3" />
            AI-Powered Features
          </Badge>
          <h2 className="mb-6 text-4xl font-bold md:text-5xl">
            See Our AI in{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Action
            </span>
          </h2>
          <p className="text-muted-foreground mx-auto max-w-3xl text-lg md:text-xl">
            Watch how Humantryx transforms traditional HR processes with
            cutting-edge AI technology. Every feature is designed to save time,
            reduce bias, and enhance decision-making.
          </p>
        </motion.div>

        {/* Video Features */}
        <div className="space-y-24">
          {videoFeatures.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: index * 0.2 }}
              className={`grid items-center gap-12 lg:grid-cols-2 ${
                index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
              }`}
            >
              {/* Video Container */}
              <div
                className={`relative ${
                  index % 2 === 1 ? "lg:col-start-2" : ""
                }`}
              >
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl">
                  {/* Video with seamless loop */}
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    disablePictureInPicture
                    controlsList="nodownload nofullscreen noremoteplayback"
                    className="aspect-video h-auto w-full bg-white object-contain"
                    style={{ pointerEvents: "none" }}
                  >
                    <source src={feature.video} type="video/mp4" />
                    <source src={feature.video} type="video/quicktime" />
                    Your browser does not support the video tag.
                  </video>

                  {/* Feature badge - positioned to not interfere with video */}
                  <div className="absolute top-4 left-4">
                    <Badge
                      className={`bg-gradient-to-r ${feature.gradient} text-white shadow-lg backdrop-blur-sm`}
                    >
                      <feature.icon className="mr-1 h-3 w-3" />
                      Live Demo
                    </Badge>
                  </div>
                </div>

                {/* Decorative glow effect around video */}
                <div
                  className={`absolute -inset-4 bg-gradient-to-r ${feature.gradient} -z-10 rounded-3xl opacity-10 blur-2xl`}
                />
              </div>

              {/* Content */}
              <div className={index % 2 === 1 ? "lg:col-start-1" : ""}>
                <Card
                  className={`bg-gradient-to-br ${feature.color} border-0 shadow-lg`}
                >
                  <CardContent className="p-8">
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={`rounded-xl bg-gradient-to-r p-3 ${feature.gradient} text-white shadow-lg`}
                      >
                        <feature.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{feature.title}</h3>
                        <p className="text-muted-foreground font-medium">
                          {feature.subtitle}
                        </p>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-6 text-lg leading-relaxed">
                      {feature.description}
                    </p>

                    <div className="space-y-3">
                      <h4 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                        Key Benefits
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {feature.features.map((feat, featIndex) => (
                          <motion.div
                            key={featIndex}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.2 + featIndex * 0.1,
                            }}
                            className="flex items-center gap-2"
                          >
                            <div
                              className={`h-2 w-2 rounded-full bg-gradient-to-r ${feature.gradient}`}
                            />
                            <span className="text-sm font-medium">{feat}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
