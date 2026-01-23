"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { signup } from "./action";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import LegalModal from "@/components/ui/LegalModal";
import AnimatedBackground from "@/components/AnimatedBackground";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  // Typing animation
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

  // Typing cursor blink
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
    displayedRef.current = displayed;
  }, [displayed]);

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

  const openModal = (type: "terms" | "privacy") => {
    setModalType(type);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalType(null);
  };

  // Password match check
  useEffect(() => {
    if (confirmPassword) {
      setPasswordsMatch(password === confirmPassword);
    } else {
      setPasswordsMatch(true);
    }
  }, [password, confirmPassword]);

  // Auth checks
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && user) router.replace("/chat");
  }, [isAuthenticated, user, router]);

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

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/chat`,
      },
    });
    if (error) {
      console.error("❌ Google login error:", error.message);
      setError(error.message);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    if (!agreedToTerms) {
      setError("You must agree to the terms and conditions to continue.");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match. Please check and try again.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
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
                Create your account
              </h2>

              <div className="flex items-start gap-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Your AI assistant helps with:
                  </p>

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
                    Fast, private, and tailored to your needs — create an account to access your workspace.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Right: Register Card (40%) */}
          <aside className="w-full md:w-2/5 flex items-center justify-center border-l border-gray-200 dark:border-gray-800 md:translate-x-8">
            <div className="w-full max-w-md p-6 md:p-8">
              <div className="space-y-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-xl p-5 md:p-6 shadow-xl">
                <div className="text-center">
                  <h1 className="text-xl md:text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">Create your account</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Join our AI revolution — it&apos;s free.</p>
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
                    fd.set("password", password);
                    fd.set("confirmPassword", confirmPassword);
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
                      name="passwordInput"
                      required
                      placeholder="Password (min 6 characters)"
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <input
                      type="password"
                      name="confirmPasswordInput"
                      required
                      placeholder="Confirm Password"
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full bg-white dark:bg-gray-900 rounded-lg p-3 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${!passwordsMatch && confirmPassword
                          ? "border-2 border-red-500 focus:ring-red-400"
                          : "border border-gray-300 dark:border-gray-600 focus:ring-purple-500 dark:focus:ring-purple-400"
                        }`}
                    />
                    {!passwordsMatch && confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-600 dark:text-red-400 text-xs mt-2 ml-1"
                      >
                        Passwords do not match
                      </motion.p>
                    )}
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-3 py-2">
                    <div className="flex items-center h-5">
                      <input
                        id="terms"
                        type="checkbox"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 focus:ring-2 accent-purple-600"
                      />
                    </div>
                    <label htmlFor="terms" className="text-sm text-gray-700 dark:text-gray-300 leading-5">
                      I agree to the{" "}
                      <button
                        onClick={() => openModal("terms")}
                        type="button"
                        className="text-purple-600 dark:text-purple-400 hover:underline text-sm"
                      >
                        Terms
                      </button>{" "}
                      &{" "}
                      <button
                        onClick={() => openModal("privacy")}
                        type="button"
                        className="text-purple-600 dark:text-purple-400 hover:underline text-sm"
                      >
                        Privacy
                      </button>
                    </label>

                    <LegalModal
                      isOpen={isOpen}
                      onClose={closeModal}
                      title={modalType === "terms" ? "Terms" : modalType === "privacy" ? "Privacy Policy" : ""}
                    >
                      {modalType === "terms" && (
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          Welcome to 021 AI Co-Founder, your AI-powered partner in turning ideas into ventures. By accessing or using our website, app, or services (collectively &quot;Platform&quot;), you agree to these Terms.
                          <ul className="list-[square] pl-6">
                            <li>Eligibility: <br></br>
                              You must be at least 18 years old to use the Platform.
                              You agree to provide accurate information when registering.</li>
                            <li>Nature of Service: <br></br>
                              021 AI Co-Founder is an AI-based guidance platform. It provides insights, recommendations, and strategic support but does not replace professional legal, financial, or business advice.
                              Any decisions you make using the Platform remain your sole responsibility.</li>
                            <li>User Conduct: <br></br>
                              You agree not to:
                              Use the Platform for unlawful, harmful, or fraudulent purposes.
                              Upload malicious content or attempt to disrupt system integrity.
                              Infringe on intellectual property rights of others.</li>
                            <li> Intellectual Property: <br></br>
                              All technology, models, algorithms, branding, and content within the Platform are the property of EVOA Technology Pvt Ltd.
                              You retain ownership of the content, ideas, and business information you submit. By using the Platform, you grant us a limited, non-exclusive license to process, analyze, and use your data solely for service delivery and improvement.
                            </li>
                            <li> Privacy & Data Use: <br></br>
                              Your personal and business data is protected under our Privacy Policy.
                              We do not sell your personal information to third parties.
                              Data may be used to enhance features, personalize insights, and ensure compliance with applicable law.</li>
                            <li>No Guarantee of Outcomes: <br></br>
                              We provide AI-driven guidance. However:
                              We do not guarantee funding, success, profitability, or specific results.
                              The Platform is a tool, not a replacement for human expertise or execution.</li>
                            <li>Limitation of Liability: <br></br>
                              To the maximum extent permitted by law, EVOA Technology Pvt Ltd is not liable for:
                              Business losses, missed opportunities, or damages resulting from reliance on AI guidance.
                              Indirect, incidental, or consequential damages.</li>
                            <li>Termination: <br></br>
                              We may suspend or terminate your account if you breach these Terms or misuse the Platform.</li>
                            <li>Changes to Terms: <br></br>
                              We may update these Terms periodically. Continued use of the Platform means you accept the updated Terms.</li>
                            <li>Governing Law & Jurisdiction: <br></br>
                              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms or the use of the Platform shall be subject to the exclusive jurisdiction of the courts in Bareilly, Uttar Pradesh.
                              By using 021 AI Co-Founder, you agree to these Terms.</li>
                          </ul>
                        </p>
                      )}
                      {modalType === "privacy" && (
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          Your privacy matters. This Privacy Policy explains how we collect, use, store, and protect your information when you use 021 AI Co-Founder.
                          <ul className="list-[square] pl-6">
                            <li>Information We Collect
                              Personal Information: Name, email, phone, company details (when provided during signup).
                              Usage Data: Log files, browser type, device information, and interactions with the Platform.
                              Business Data: Ideas, documents, and inputs you provide for AI analysis.</li>
                            <li>How We Use Your Data
                              We use your data to:
                              Deliver AI-powered insights and recommendations.
                              Personalize your user experience.
                              Improve and train our AI models (anonymized where possible).
                              Ensure platform security and compliance with laws.</li>
                            <li> Data Protection
                              Your data is stored securely with encryption and strict access controls.
                              We do not sell or rent your personal information.
                              We may share anonymized or aggregated insights for research, reporting, or product improvement.</li>
                            <li> Third-Party Services
                              We may use third-party providers (e.g., hosting, analytics, payment processors). They are bound by confidentiality and data protection agreements.
                              We are not responsible for third-party websites linked through the Platform.</li>
                            <li>User Rights
                              Depending on your jurisdiction, you may have the right to:
                              Access, update, or delete your data.
                              Opt out of certain data uses (like marketing).
                              Request a copy of your stored information.
                              To exercise these rights, contact us at: connectevoa@gmail.com</li>
                            <li> Cookies & Tracking
                              We use cookies and similar technologies to enhance performance, analytics, and personalization. You can disable cookies in your browser settings.</li>
                            <li> Data Retention
                              We retain your information as long as your account is active or as required by law.</li>
                            <li> Children&apos;s Privacy
                              Our services are not directed at individuals under 18. We do not knowingly collect data from children.</li>
                            <li>Policy Updates
                              We may update this Privacy Policy from time to time. Any changes will be posted here, with the effective date updated.
                            </li>
                          </ul>
                          Contact Us:
                          If you have questions about this Privacy Policy, email us at: connectevoa@gmail.com
                        </p>
                      )}
                    </LegalModal>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || !agreedToTerms || !passwordsMatch}
                    className={`w-full font-medium py-3 rounded-lg transition-all duration-200 shadow-sm ${agreedToTerms && !isLoading && passwordsMatch
                        ? "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white"
                        : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </motion.button>
                </form>

                <motion.button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading || !agreedToTerms}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full font-medium py-3 rounded-lg transition-all duration-200 ${agreedToTerms && !isLoading
                      ? "border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                      : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed border border-gray-400 dark:border-gray-600"
                    }`}
                >
                  Continue with Google
                </motion.button>

                <p className="text-center text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                    Log in
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
