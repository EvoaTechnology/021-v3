"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

/**
 * Forgot password screen for requesting a magic-link reset email.
 * Uses POST /api/auth/forgot-password which sends a reset link via Supabase.
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to send reset email");
      setSuccess("We sent a password reset link to your email.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        background:
          "linear-gradient(220deg, rgb(15, 15, 16) 20%, rgb(7, 20, 52) 40%, rgb(22, 21, 21) 100%",
      }}
      className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="absolute -right-32 md:-right-64 top-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 border border-gray-700 rounded-full"
        />
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="absolute -left-16 md:-left-32 top-1/6 w-48 h-48 md:w-64 md:h-64 border border-gray-700 rounded-full"
        />
        <motion.div
          initial={{ opacity: 0, x: -150 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4, delay: 0.7 }}
          className="absolute -left-24 md:-left-48 bottom-1/6 w-56 h-56 md:w-80 md:h-80 border border-gray-700 rounded-full"
        />
        <motion.div
          initial={{ opacity: 0, rotate: -45 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className="hidden md:block absolute right-8 top-16 w-24 h-24 border border-gray-700"
        />
        <motion.div
          initial={{ opacity: 0, rotate: 45 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 1.2, delay: 1.2 }}
          className="hidden md:block absolute right-32 bottom-32 w-32 h-32 border border-gray-700"
        />
      </div>

      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full opacity-80"></div>
          </div>
          <span className="text-lg sm:text-xl font-semibold">021 AI</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="/login"
            className="text-gray-300 hover:text-white transition-colors">
            Back to login
          </Link>
        </div>
      </motion.header>

      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full max-w-md space-y-6 p-8 bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl">
          <div className="text-center">
            <h1
              className="text-3xl font-bold mb-2"
              style={{
                background:
                  "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 30%, #64748b 60%, #e2e8f0 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
              Forgot password
            </h1>
            <p className="text-gray-300">
              Enter your email to receive a password reset link.
            </p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-emerald-900/40 border border-emerald-700 text-emerald-300 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Your email"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-all duration-300"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/25">
              {isLoading ? "Sending..." : "Send reset link"}
            </motion.button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}

