"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuthStore } from "./store/authStore";
import { User, LogOut, Menu, X } from "lucide-react";

const LandingPage: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const { isAuthenticated, checkAuth } = useAuthStore();
  const { signOut } = useAuthStore();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const router = useRouter();

  // Send idea handler
  const handleSendIdea = () => {
    if (!inputValue.trim()) return;
    sessionStorage.setItem("newChatMessage", inputValue);
    sessionStorage.setItem("createNewChat", "true");
    if (!isAuthenticated) {
      router.push("/login");
    } else {
      router.push("/chat");
    }
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-black text-white relative flex flex-col">
      {/* Animated morphing background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
          style={{
            background: "radial-gradient(circle, #404040 0%, transparent 70%)",
            top: "-10%",
            left: "-10%",
          }}
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-15"
          style={{
            background: "radial-gradient(circle, #505050 0%, transparent 70%)",
            bottom: "-15%",
            right: "-15%",
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, -40, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-10"
          style={{
            background: "radial-gradient(circle, #606060 0%, transparent 70%)",
            top: "40%",
            right: "20%",
          }}
          animate={{
            x: [0, -20, 0],
            y: [0, 20, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* ================= Header ================= */}
      <header className="relative z-20 flex-shrink-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <div className="flex items-center gap-3">
              {/* <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-black rounded-full" />
              </div> */}
              <img 
                src="/021logo.jpeg" 
                alt="021 AI Logo"
                className="w-12 h-12 object-contain"
              />
              <span className="text-lg font-semibold">021 AI</span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/features" className="text-gray-400 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <a
                href="https://chat.whatsapp.com/HJ5lwuCnAdGDdkQq4pbsnf"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Community
              </a>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Desktop auth */}
              <div className="hidden md:flex items-center gap-3">
                {isAuthenticated ? (
                  <div className="relative">
                    <button
                      onClick={() => setOpenUserMenu((s) => !s)}
                      className="h-9 w-9 rounded-full border border-gray-700 bg-[#1a1a1a] text-gray-100 flex items-center justify-center hover:bg-[#2a2a2a] transition-colors"
                    >
                      <User className="h-4 w-4" />
                    </button>
                    {openUserMenu && (
                      <div className="absolute right-0 mt-2 w-32 bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-800 overflow-hidden z-30">
                        <button
                          onClick={() => {
                            setOpenUserMenu(false);
                            if (typeof signOut === "function") signOut();
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-[#2a2a2a] transition-colors flex items-center gap-2"
                        >
                          <LogOut className="h-4 w-4 text-red-400" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link href="/login">
                      <button className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition-colors">
                        Sign In
                      </button>
                    </Link>
                    <Link href="/register">
                      <button className="px-4 py-2 rounded-lg bg-white text-black text-sm hover:bg-gray-200 transition-colors font-medium">
                        Sign up
                      </button>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-white"
                onClick={() => setMobileNavOpen((s) => !s)}
              >
                {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileNavOpen && (
          <div className="md:hidden relative z-20">
            <div className="mx-auto max-w-3xl px-4 pb-3">
              <div className="flex flex-col gap-2 bg-[#1a1a1a]/95 backdrop-blur-sm rounded-xl p-3 border border-gray-800">
                <Link href="/features" className="px-3 py-2 rounded hover:bg-[#2a2a2a] transition-colors text-sm">
                  Features
                </Link>
                <Link href="/pricing" className="px-3 py-2 rounded hover:bg-[#2a2a2a] transition-colors text-sm">
                  Pricing
                </Link>
                <a
                  href="https://chat.whatsapp.com/HJ5lwuCnAdGDdkQq4pbsnf"
                  className="px-3 py-2 rounded hover:bg-[#2a2a2a] transition-colors text-sm"
                >
                  Community
                </a>
                <div className="border-t border-gray-800 pt-2 mt-1 flex gap-2">
                  {isAuthenticated ? (
                    <button
                      onClick={() => {
                        if (typeof signOut === "function") signOut();
                        setMobileNavOpen(false);
                      }}
                      className="flex-1 px-3 py-2 rounded bg-[#2a2a2a] hover:bg-[#3a3a3a] text-sm transition-colors"
                    >
                      Logout
                    </button>
                  ) : (
                    <>
                      <Link href="/login" className="flex-1">
                        <button className="w-full px-3 py-2 rounded text-sm bg-transparent hover:bg-[#2a2a2a] transition-colors">
                          Sign In
                        </button>
                      </Link>
                      <Link href="/register" className="flex-1">
                        <button className="w-full px-3 py-2 rounded text-sm bg-white text-black hover:bg-gray-200 transition-colors font-medium">
                          Sign up
                        </button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ================= Main Section ================= */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-8 pb-12">
        {/* Hero text - Highlighted main point */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 leading-tight">
            What do you want
            <br />
            <span className="bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent">
              to build?
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto"
          >
            Pitch your startup idea and get instant AI-powered validation
          </motion.p>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-3xl mb-6"
        >
          <div className="relative group">
            {/* Glow effect on focus */}
            <div className="absolute -inset-1 bg-gradient-to-r from-gray-600 to-gray-400 rounded-3xl blur opacity-0 group-focus-within:opacity-20 transition duration-500"></div>
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendIdea();
                  }
                }}
                placeholder="Describe your startup idea..."
                className="w-full h-24 sm:h-28 bg-[#1a1a1a]/80 backdrop-blur-sm border border-gray-800 rounded-2xl px-5 sm:px-6 py-4 text-base text-white placeholder-gray-500 resize-none focus:outline-none focus:border-gray-600 transition-colors"
              />
              <button
                type="button"
                onClick={handleSendIdea}
                className="absolute bottom-4 right-4 bg-white hover:bg-gray-200 text-black rounded-full w-10 h-10 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5">
                  <path
                    fillRule="evenodd"
                    d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 17.25a.75.75 0 01-1.5 0v-5.19l-1.72 1.72a.75.75 0 11-1.06-1.06l3-3a.75.75 0 011.06 0l3 3a.75.75 0 11-1.06 1.06l-1.72-1.72v5.19z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Category buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap justify-center gap-3 max-w-2xl"
        >
          {["E-commerce App", "SaaS Platform", "AI Tool", "Mobile Game"].map((item) => (
            <motion.button
              key={item}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setInputValue(item)}
              className="bg-[#1a1a1a]/80 backdrop-blur-sm hover:bg-[#2a2a2a] border border-gray-800 hover:border-gray-700 px-5 py-2.5 text-sm rounded-full transition-all"
            >
              {item}
            </motion.button>
          ))}
        </motion.div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-8 flex items-center gap-3 text-sm text-gray-500"
        >
          {/* <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-3 h-3 bg-black rounded-full"></div>
          </div> */}
          
          <img 
                src="/EVOA_Logo1.png" 
                alt="EVOA_logo"
                className="w-9 h-9 object-contain"
              />
          <span>Powered by EVO-A</span>
        </motion.div>
      </main>

      {/* ================= Compact Footer ================= */}
      <footer className="relative z-10 flex-shrink-0 border-t border-gray-900 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact
              </Link>
              <span>© {new Date().getFullYear()} Evoa Technology Pvt. Ltd.</span>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://chat.whatsapp.com/HJ5lwuCnAdGDdkQq4pbsnf"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </a>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=connectevoa@gmail.com"
                aria-label="Gmail"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/evoaofficial"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/evo-a/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-gray-500 hover:text-white transition-colors"
              >
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;