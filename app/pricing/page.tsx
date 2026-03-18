"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Check, Sparkles, Lock } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import AnimatedBackground from "@/components/AnimatedBackground";
import BrandLogo from "@/components/BrandLogo";
import Link from "next/link";
import LegalModal from "@/components/ui/LegalModal";
import { useTheme } from "next-themes";

export default function Pricing() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);

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

  const plans = [
    {
      id: "starter",
      name: "Starter",
      description: "Perfect to start and validate your first idea",
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: [
        "Idea validation (1 only)",
        "AI Co-founder roles: CEO, CTO, CFO, CMO",
        "Validation Report",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      description: "Ideal for startups ready to build, scale, and raise",
      monthlyPrice: 499,
      yearlyPrice: 4791,
      features: [
        "Unlimited idea validation",
        "AI Co-founder roles: CEO, CTO, CFO, CMO",
        "Validation Report",
        "Business Model Generator",
        "Financial Projections",
        "Pitch Deck Templates",
        "Downloadable Reports",
      ],
      cta: "Get Started",
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For established startups with complex needs",
      monthlyPrice: 999,
      yearlyPrice: 9591,
      features: [
        "Unlimited AI Co-founders",
        "Custom pitch deck templates",
        "Advanced financial scenarios",
        "Investor network access",
        "Dedicated account manager",
        "API access",
      ],
      cta: "Get Started",
      popular: false,
    },
  ];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  async function loadRazorpayScript(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      if ((window as any).Razorpay) return resolve();
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Razorpay SDK failed to load."));
      document.body.appendChild(script);
    });
  }

  async function createOrder(amount: number, notes?: Record<string, unknown>) {
    const res = await fetch("/api/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, notes }),
    });
    return res.json();
  }

  const handlePaidCheckout = async (plan: { id: string; name: string; monthlyPrice: number; yearlyPrice: number }) => {
    try {
      const amount = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
      if (!amount || amount <= 0) return;

      await loadRazorpayScript();

      const data = await createOrder(amount, {
        planId: plan.id,
        billingCycle,
      });

      const order = data?.order;
      if (!order?.id) {
        alert("Order creation failed.");
        return;
      }

      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!key) {
        alert("Razorpay key is missing.");
        return;
      }

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: "021 AI",
        description: `${plan.name} plan (${billingCycle})`,
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const verifyJson = await verifyRes.json();
            if (verifyJson?.success) {
              router.push("/chat");
            } else {
              alert("Payment verification failed.");
            }
          } catch (e) {
            console.error("verification error", e);
            alert("Verification request failed.");
          }
        },
        theme: { color: "#7c3aed" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment initialization failed.");
    }
  };

  const handleStarterClick = () => {
    if (isAuthenticated) {
      router.push("/chat");
    } else {
      router.push("/login");
    }
  };

  const getDiscountPercentage = (monthly: number, yearly: number) => {
    const monthlyTotal = monthly * 12;
    const savings = monthlyTotal - yearly;
    return Math.round((savings / monthlyTotal) * 100);
  };

  const openModal = (type: "terms" | "privacy") => {
    setModalType(type);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalType(null);
  };

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
              <Link href="/features" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Features
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
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-normal mb-4 text-gray-900 dark:text-gray-100">
              Choose Your Plan
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Select the perfect plan for your startup's needs and get started with <span className="font-semibold">021</span>
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 rounded-full p-1.5 border border-gray-200 dark:border-gray-700 shadow-sm">
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${billingCycle === "monthly"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle("yearly")}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === "yearly"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
              >
                Yearly
                {billingCycle === "yearly" && (
                  <span className="flex items-center gap-1 bg-white/20 rounded-full px-2 py-0.5 text-xs">
                    <Sparkles className="h-3 w-3" />
                    Save 20%
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="relative"
              >
                <div
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`relative h-full bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${selectedPlan === plan.id
                    ? "border-purple-600 dark:border-purple-500 shadow-xl shadow-purple-600/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-lg"
                    } ${plan.popular ? "md:scale-105" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium px-3 py-1 rounded-bl-lg rounded-tr-2xl">
                        Most Popular
                      </div>
                    </div>
                  )}

                  {/* Lock Overlay for Enterprise */}
                  {plan.id === "enterprise" && (
                    <div className="absolute inset-0 bg-gray-100/20 dark:bg-gray-600/20 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10">
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 rounded-full border-2 border-gray-400 dark:border-gray-500 flex items-center justify-center mb-4">
                          <Lock className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <p className="text-gray-400 dark:text-gray-400  text-xl font-bold tracking-wider">COMING SOON</p>
                      </div>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan Header */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      {plan.monthlyPrice === 0 && plan.yearlyPrice === 0 ? (
                        <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">Free</span>
                      ) : (
                        <>
                          <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                            ₹{billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice}
                          </span>
                          <span className="text-gray-600 dark:text-gray-400 ml-2">
                            /{billingCycle === "monthly" ? "month" : "year"}
                          </span>
                          {billingCycle === "yearly" && plan.monthlyPrice > 0 && (
                            <div className="mt-1 text-sm text-purple-600 dark:text-purple-400">
                              Save {getDiscountPercentage(plan.monthlyPrice, plan.yearlyPrice)}% with annual billing
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA Button */}
                    <button
                      onClick={() => {
                        if (plan.id === "starter") return handleStarterClick();
                        handlePlanSelect(plan.id);
                        if (plan.id === "enterprise") return;
                        return handlePaidCheckout(plan);
                      }}
                      className={`w-full py-3 rounded-lg font-medium transition-all ${selectedPlan === plan.id || plan.popular
                        ? "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 mt-16 py-8 border-t border-gray-200 dark:border-gray-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="flex gap-6">
                <button
                  onClick={() => openModal("terms")}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Terms
                </button>
                <button
                  onClick={() => openModal("privacy")}
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Privacy
                </button>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Legal Modal */}
      <LegalModal
        isOpen={isOpen}
        onClose={closeModal}
        title={modalType === "terms" ? "Terms" : modalType === "privacy" ? "Privacy Policy" : ""}
      >
        {modalType === "terms" && (
          <div className="text-sm text-gray-700 whitespace-pre-line">
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
          </div>
        )}
        {modalType === "privacy" && (
          <div className="text-sm text-gray-700 whitespace-pre-line">
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
          </div>
        )}
      </LegalModal>
    </div>
  );
}
