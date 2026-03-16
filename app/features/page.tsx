"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Lightbulb,
  Users,
  TrendingUp,
  Shield,
  Brain,
  Globe,
  Presentation,
  MessageCircle,
  BarChart,
  Cog,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import AnimatedBackground from "@/components/AnimatedBackground";
import BrandLogo from "@/components/BrandLogo";
import { useTheme } from "next-themes";

const currentFeatures = [
  {
    icon: Lightbulb,
    title: "Idea Validator",
    description: "Validates startup ideas and checks feasibility",
    points: [
      "Market fit analysis with scoring system",
      "Suggests refinements and improvements",
      "Competitor and trend comparison",
    ],
  },
  {
    icon: Users,
    title: "Advisory Mode",
    description: "AI Co-founders guide your startup journey",
    points: [
      "CEO AI: Vision, mission, and strategy",
      "CFO AI: Revenue models and fundraising",
      "CTO AI: Tech stack and MVP path",
      "CMO AI: Positioning and GTM strategies",
    ],
  },
  {
    icon: TrendingUp,
    title: "0 → 1 Journey",
    description: "From raw idea to structured plan",
    points: [
      "Step-by-step startup development",
      "Milestone tracking and monitoring",
      "Strategic roadmap creation",
    ],
  },
  {
    icon: Shield,
    title: "Guidance",
    description: "Acts like a mentor, giving direction and clarity",
    points: [
      "Strategic advice without direct execution",
      "Expert consultation on decisions",
      "Long-term vision planning",
    ],
  },
];

const futureFeatures = [
  {
    icon: Brain,
    title: "AI Co-Founder Team",
    description: "Hire multiple specialized AI co-founders",
    points: [
      "COO, CPO, Data Scientist roles",
      "Collaborative team decision making",
      "Role-specific expertise",
    ],
  },
  {
    icon: Cog,
    title: "Build Mode",
    description: "AI generates wireframes and prototypes",
    points: [
      "Auto-creates code snippets",
      "Design system generation",
      "Complete roadmap development",
    ],
  },
  {
    icon: Presentation,
    title: "Pitch Room",
    description: "Auto-generate investor pitch decks",
    points: [
      "Pitch analysis and optimization",
      "Simulate investor Q&A sessions",
      "Presentation coaching",
    ],
  },
  {
    icon: MessageCircle,
    title: "AI Chat Partner",
    description: "Real-time collaboration with AI co-founders",
    points: [
      "Always-on strategic consultation",
      "Instant problem-solving",
      "24/7 business guidance",
    ],
  },
  {
    icon: Globe,
    title: "Community Integration",
    description: "Network with other founders globally",
    points: [
      "Connect with AI mentors",
      "Access to investor networks",
      "Collaborative ecosystem",
    ],
  },
  {
    icon: BarChart,
    title: "Analytics Dashboard",
    description: "Track key milestones and KPIs",
    points: [
      "Monitor co-founder performance",
      "Business growth analytics",
      "Real-time progress monitoring",
    ],
  },
  {
    icon: Rocket,
    title: "Execution Layer",
    description: "AI doesn't just guide, it executes",
    points: [
      "Builds and markets alongside you",
      "Automated pitch generation",
      "End-to-end startup assistance",
    ],
  },
];

export default function FeaturesPage() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll detection for header effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-50 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/10 dark:bg-gray-900/10 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-800/50'
          : 'bg-transparent'
        }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-5 relative">
            <BrandLogo />
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Home
              </Link>
              <Link href="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 pt-28 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal mb-4 text-gray-900 dark:text-gray-100">
              Vision Strategy Growth
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Discover the features that make <span className="font-semibold">021 AI</span> your go-to startup partner
            </p>
          </motion.div>

          {/* Current Features */}
          <div className="mb-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100"
            >
              Current Features
            </motion.h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {currentFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 mb-4">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.points.map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                          <span className="text-purple-600 dark:text-purple-400 mr-2">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Future Features */}
          <div className="mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100"
            >
              Future Advancements
            </motion.h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {futureFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 mb-4">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {feature.description}
                    </p>
                    <ul className="space-y-2">
                      {feature.points.map((point, idx) => (
                        <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                          <span className="text-blue-600 dark:text-blue-400 mr-2">•</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 rounded-2xl p-12 shadow-2xl"
          >
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to build with 021 AI?
            </h3>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Start your journey with an AI co-founder today and transform your startup vision into reality.
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-purple-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
