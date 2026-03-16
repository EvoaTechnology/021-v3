"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "./store/authStore";
import {
  User,
  LogOut,
  ChevronDown,
  ArrowUp,
  Sun,
  Moon,
  Linkedin,
  Instagram,
  Mail,
  Menu,
  X,
} from "lucide-react";
import AnimatedBackground from "@/components/AnimatedBackground";
import BrandLogo from "@/components/BrandLogo";
import { useTheme } from "next-themes";

const LandingPage: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const { isAuthenticated, checkAuth, user } = useAuthStore();
  const { signOut } = useAuthStore();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [selectedRole, setSelectedRole] = useState("IDEA VALIDATOR");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const roles = ["IDEA VALIDATOR", "CEO", "CTO", "CFO", "CMO"];

  // Send idea handler
  const handleSendIdea = () => {
    if (!inputValue.trim()) return;
    sessionStorage.setItem("newChatMessage", inputValue);
    sessionStorage.setItem("createNewChat", "true");
    sessionStorage.setItem("selectedRole", selectedRole); // Store selected role
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      router.push("/chat");
    }
  };

  const handleQuickAction = (action: string) => {
    setInputValue(action);
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Redirect authenticated users to chat
  useEffect(() => {
    if (isAuthenticated && user) {
      router.push("/chat");
    }
  }, [isAuthenticated, user, router]);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest(".role-dropdown")) {
        setIsDropdownOpen(false);
      }
      if (openMobileMenu && !target.closest(".mobile-nav")) {
        setOpenMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, openMobileMenu]);



  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-100 via-purple-50 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100 flex flex-col relative transition-colors duration-300">
      {/* Animated Background */}
      <AnimatedBackground />

      {/* ================= Header ================= */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/10 dark:bg-gray-900/10 backdrop-blur-lg shadow-lg border-b border-gray-200/50 dark:border-gray-800/50'
        : 'bg-transparent'
        }`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-5 relative">
            {/* Logo */}
            <BrandLogo />

            {/* Desktop nav - Centered */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium absolute left-1/2 -translate-x-1/2">
              <Link href="/pricing" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Pricing
              </Link>
              <Link href="/about" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                About
              </Link>
              <Link href="/features" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Features
              </Link>
              <a href="https://chat.whatsapp.com/HJ5lwuCnAdGDdkQq4pbsnf" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Community
              </a>
              {/* <Link href="/contact" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                Contact
              </Link> */}

            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Desktop auth */}
              <div className="hidden md:flex items-center gap-3">
                {/* Theme Toggle Button */}
                {mounted && (
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="h-9 w-9 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </button>
                )}
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setOpenUserMenu((s) => !s)}
                      className="h-9 w-9 rounded-full border border-gray-300 bg-white text-gray-700 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <User className="h-4 w-4" />
                    </button>
                    {openUserMenu && (
                      <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-30">
                        <button
                          onClick={() => {
                            setOpenUserMenu(false);
                            if (typeof signOut === "function") signOut();
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="h-4 w-4 text-red-500" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Discord icon placeholder */}
                    {/* <button className="h-9 w-9 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-gray-700 transition-colors">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                      </svg>
                    </button> */}
                    <Link href="/register">
                      <button className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors font-medium">
                        Sign up for free
                      </button>
                    </Link>
                    <Link href="/login">
                      <button className="px-5 py-2 rounded-lg bg-white text-gray-700 text-sm hover:bg-gray-50 transition-colors font-medium border border-gray-300">
                        Sign in
                      </button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile - simplified */}
              <div className="md:hidden flex items-center gap-2 mobile-nav relative">
                <button
                  type="button"
                  onClick={() => setOpenMobileMenu((s) => !s)}
                  className="h-9 w-9 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center"
                  aria-label="Open navigation menu"
                >
                  {openMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>

                {/* Theme Toggle Button - Mobile */}
                {mounted && (
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="h-9 w-9 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                  </button>
                )}
                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      if (typeof signOut === "function") signOut();
                    }}
                    className="px-4 py-2 rounded-lg bg-white text-gray-700 text-sm border border-gray-300"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link href="/login">
                      <button className="px-4 py-2 rounded-lg bg-white text-gray-700 text-sm border border-gray-300">
                        Sign in
                      </button>
                    </Link>
                    <Link href="/register">
                      <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">
                        Sign up
                      </button>
                    </Link>
                  </>
                )}

                {openMobileMenu && (
                  <div className="absolute top-12 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-gray-200/70 dark:border-gray-800/70 rounded-2xl shadow-xl p-3 z-50">
                    <div className="flex flex-col text-sm font-medium">
                      <Link
                        href="/pricing"
                        onClick={() => setOpenMobileMenu(false)}
                        className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Pricing
                      </Link>
                      <Link
                        href="/about"
                        onClick={() => setOpenMobileMenu(false)}
                        className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        About
                      </Link>
                      <Link
                        href="/features"
                        onClick={() => setOpenMobileMenu(false)}
                        className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Features
                      </Link>
                      <a
                        href="https://chat.whatsapp.com/HJ5lwuCnAdGDdkQq4pbsnf"
                        onClick={() => setOpenMobileMenu(false)}
                        className="px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        Community
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= Main Section ================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-12 pt-28">
        {/* Announcement Banner */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">Recognized by the Government of India under Startup India 🇮🇳 </span>
          </div>
        </div>

        {/* Hero Heading */}
        <div className="text-center mb-6">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-normal mb-4 leading-tight text-gray-900 dark:text-gray-100">
            What do you want
            <br />
            to build?
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            {/* Plans and ships code using all the best AI models. Works with every
            <br className="hidden sm:block" />
            developer tool you already use. No credit card or API key required. */}
            Pitch your startup idea and get instant AI-powered validation
          </p>
        </div>

        {/* Input Box */}
        <div className="w-full max-w-3xl mb-6">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendIdea();
                }
              }}
              placeholder="Describe your startup idea"
              className="w-full h-20 bg-transparent border-none text-base text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none"
            />

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {/* Role Selector Dropdown */}
              <div className="relative role-dropdown">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                  <span className="font-medium">{selectedRole}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {roles.map((role) => (
                      <button
                        key={role}
                        onClick={() => {
                          setSelectedRole(role);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${selectedRole === role ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                          }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSendIdea}
                className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm"
              >
                Submit
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl">
          {["E-commerce App", "SaaS Platform", "AI Tool", "Mobile Game"].map((action) => (
            <button
              key={action}
              onClick={() => handleQuickAction(action)}
              className="px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all shadow-sm"
            >
              {action}
            </button>
          ))}
        </div>
      </main>

      {/* ================= Footer ================= */}
      <footer className="relative z-10 py-8 px-4 sm:px-8 border-t border-gray-200 dark:border-gray-800">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-4">
            {/* Social Media Icons */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/company/evo-a/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/evoaofficial?igsh=MTJkN2F3OTJudjc2aw%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 hover:text-white transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="mailto:connectevoa@gmail.com"
                className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 flex items-center justify-center hover:bg-red-600 hover:text-white dark:hover:bg-red-600 transition-all duration-300"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>

            {/* Copyright Text */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              © 2026 Evoa Technology Pvt. Ltd.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
