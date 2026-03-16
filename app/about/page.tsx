"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import AnimatedBackground from "@/components/AnimatedBackground";
import BrandLogo from "@/components/BrandLogo";

// Import static assets from the Images folder so Next can bundle them
import AdityaImg from "../../Images/Aditya_Image.jpg";
import AbhishekImg from "../../Images/Abhishek_Image.jpeg";
import DivyanshuImg from "../../Images/Divyanshu_Image.jpeg";
import EnubImg from "../../Images/Enub_Image.jpeg";
import HarshilImg from "../../Images/Harshil_Image.jpeg";

const TEAM = [
  {
    title: "Co-Founder & CEO",
    name: "Aditya Singh",
    imageSrc: AdityaImg,
  },
  {
    title: "Co-Founder & CTO",
    name: "Abhishek Kumar",
    imageSrc: AbhishekImg,
  },
  {
    title: "Full Stack Developer",
    name: "Divyanshu Singh",
    imageSrc: DivyanshuImg,
  },
  {
    title: "Data Analyst",
    name: "Enub Uzair",
    imageSrc: EnubImg,
  },
  {
    title: "RAG Developer",
    name: "Harshil Awasthi",
    imageSrc: HarshilImg,
  },
] as const;

export default function AboutPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-50 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <AnimatedBackground />

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/10 dark:bg-gray-900/10 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-800/50"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-5 relative">
            <BrandLogo />
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
              <Link
                href="/"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/pricing"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/about"
                className="text-gray-900 dark:text-gray-100"
                aria-current="page"
              >
                About
              </Link>
              <a
                href="https://chat.whatsapp.com/HJ5lwuCnAdGDdkQq4pbsnf"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                Community
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-28 pb-16 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal mb-4 text-gray-900 dark:text-gray-100">
              About 021
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              021 AI is your AI-powered co-founder—built to help founders think
              clearly, validate ideas faster, and move from concept to execution
              with confidence.
            </p>
          </motion.div>

          <section className="grid gap-8 lg:grid-cols-2 mb-14">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                About 021
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                Our vision is simple: make world-class startup thinking
                accessible to everyone. 021 AI exists to support founders with
                structured clarity—strategy, positioning, financial direction,
                and product decisions—without losing speed.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100">
                Our Journey
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                021 AI started from a familiar pain: founders spend weeks
                searching for direction—fragmented advice, generic templates,
                and slow iteration cycles. We’re building a focused co-founder
                experience that helps you validate faster, decide smarter, and
                keep momentum as your mission evolves.
              </p>
            </motion.div>
          </section>

          <section className="mb-4">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Our Team
              </h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                A small team obsessed with making founders unstoppable.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              {TEAM.map((member, idx) => (
                <motion.div
                  key={member.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: idx * 0.05 }}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="h-24 w-24 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                      <Image
                        src={member.imageSrc}
                        alt={member.name}
                        width={96}
                        height={96}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {member.name}
                    </div>
                    <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {member.title}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

