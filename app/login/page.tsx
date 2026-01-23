"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { login } from "./action";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Typing animation lines
  const lines = [
    "Helps to validate your idea",
    "How to find the target audience for my product",
    "Create Marketing Strategies for my startup",
    "write a code for my website",
    "I want to build a burger Franchise business",
    "Create a website for my e-commerce business",
    "Create pitchdeck for seed funding round",
    "Help me to market my product",
  ];

  const [displayed, setDisplayed] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  const displayedRef = useRef("");
  const lineIndexRef = useRef(0);
  const isDeletingRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const typingSpeed = 50;
  const deletingSpeed = 30;
  const pauseAfterTyping = 1400;
  const pauseAfterDeleting = 300;

  useEffect(() => {
    displayedRef.current = displayed;
  }, [displayed]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);
    timersRef.current.push(id);
    return () => {
      timersRef.current.forEach((t) => clearInterval(t));
      timersRef.current = [];
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const clearAll = () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        if (!mounted) return;
        fn();
      }, ms);
      timersRef.current.push(id);
    };

    const tick = () => {
      const idx = lineIndexRef.current;
      const full = lines[idx];
      const current = displayedRef.current;

      if (!isDeletingRef.current) {
        const next = full.slice(0, current.length + 1);
        setDisplayed(next);
        displayedRef.current = next;

        if (next === full) {
          schedule(() => {
            isDeletingRef.current = true;
            tick();
          }, pauseAfterTyping);
        } else {
          schedule(tick, typingSpeed);
        }
      } else {
        const next = full.slice(0, Math.max(0, current.length - 1));
        setDisplayed(next);
        displayedRef.current = next;

        if (next === "") {
          schedule(() => {
            isDeletingRef.current = false;
            lineIndexRef.current = (lineIndexRef.current + 1) % lines.length;
            tick();
          }, pauseAfterDeleting);
        } else {
          schedule(tick, deletingSpeed);
        }
      }
    };

    schedule(tick, 400);

    return () => {
      mounted = false;
      clearAll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auth checks
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/");
    }
  }, [isAuthenticated, user, router]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/chat` },
    });
    if (error) setError(error.message);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-purple-50 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Checking authentication...</p>
        </div>
      </main>
    );
  }

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(formData);
      router.replace("/chat");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-purple-50 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* Header */}
      <header className="relative z-10 w-full px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">021</span>
            <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-medium">EVOA</span>
          </div>
          <nav className="hidden sm:flex gap-6">
            <Link href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content - Two Column Layout */}
      <main className="relative z-10 w-full min-h-[calc(100vh-120px)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row h-[calc(100vh-120px)]">
          {/* Left: Hero Content (60%) */}
          <section className="w-full md:w-3/5 flex items-center px-6 md:px-12 py-12 md:py-24">
            <div>
              <h2 className="text-5xl sm:text-6xl md:text-7xl font-serif font-normal leading-tight mb-6 text-gray-900 dark:text-gray-100">
                Your AI Co-founder
              </h2>

              <div className="flex items-start gap-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Build Faster. Decide Smarter. Win Bigger.</p>

                  {/* Animated typing line */}
                  <div className="h-8">
                    <span className="text-lg md:text-xl font-medium text-gray-900 dark:text-gray-100">
                      {displayed}
                    </span>
                    <span
                      className={`inline-block ml-1 align-middle ${cursorVisible ? "opacity-100" : "opacity-0"
                        }`}
                      style={{ transition: "opacity 150ms" }}
                    >
                      <span className="bg-gray-900 dark:bg-gray-100 inline-block w-[2px] h-6 align-middle" />
                    </span>
                  </div>

                  <p className="mt-6 text-sm text-gray-600 dark:text-gray-400 max-w-md">
                    Fast, private, and tailored to your needs — try logging in to access your workspace.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Right: Login Card (40%) */}
          <aside className="w-full md:w-2/5 flex items-center justify-center border-l border-gray-200 dark:border-gray-800 md:translate-x-8">
            <div className="w-full max-w-md p-6 md:p-8">
              <div className="space-y-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-5 md:p-6 shadow-xl">
                <div className="text-center">
                  <h1 className="text-xl md:text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">Welcome back</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Log in to access your AI workspace.</p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-100 dark:bg-red-900/60 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-md text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget as HTMLFormElement);
                    void handleSubmit(fd);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="Email"
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="Password"
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all duration-200"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Link href="/forgot-password" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-medium py-3 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-60"
                  >
                    {isLoading ? "Signing in..." : "Log In"}
                  </motion.button>
                </form>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-medium py-3 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Continue with Google
                </motion.button>

                <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                  New here?{" "}
                  <Link href="/register" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
