// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "../store/authStore";
// import { signup } from "./action";
// import { motion } from "framer-motion";
// import { createClient } from "@/utils/supabase/client";
// import Link from "next/link";
// import LegalModal from "@/components/ui/LegalModal";

// export default function RegisterPage() {
//   const router = useRouter();
//   const supabase = createClient();
//   const { user, isAuthenticated, checkAuth } = useAuthStore();
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [agreedToTerms, setAgreedToTerms] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordsMatch, setPasswordsMatch] = useState(true);

//   const openModal = (type: "terms" | "privacy") => {
//     setModalType(type);
//     setIsOpen(true);
//   };

//   const closeModal = () => {
//     setIsOpen(false);
//     setModalType(null);
//   };

//   // Check if passwords match whenever they change
//   useEffect(() => {
//     if (confirmPassword) {
//       setPasswordsMatch(password === confirmPassword);
//     } else {
//       setPasswordsMatch(true); // Don't show error when confirm field is empty
//     }
//   }, [password, confirmPassword]);

//   // Redirect if already authenticated
//   useEffect(() => {
//     // Trigger auth check once (guarded in the store)
//     checkAuth();
//   }, [checkAuth]);

//   useEffect(() => {
//     if (isAuthenticated && user) router.replace("/chat");
//   }, [isAuthenticated, user, router]);

//   // Show loading while checking authentication
//   if (isLoading) {
//     return (
//       <main className="min-h-screen flex items-center justify-center bg-gray-900">
//         <div className="text-center text-white">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
//           <p className="text-gray-300">Checking authentication...</p>      
//         </div>
//       </main>
//     );
//   }

//     const handleGoogleLogin = async () => {
//       const { error } = await supabase.auth.signInWithOAuth({
//         provider: "google",
//         options: {
//           redirectTo: `${window.location.origin}/chat`,
//         },
//       });
//       if (error) {
//         console.error("❌ Google login error:", error.message);
//         setError(error.message);
//       }
//     };

//   const handleSubmit = async (formData: FormData) => {
//     if (!agreedToTerms) {
//       setError("You must agree to the terms and conditions to continue.");
//       return;
//     }

//     if (!passwordsMatch) {
//       setError("Passwords do not match. Please check and try again.");
//       return;
//     }

//     if (password.length < 6) {
//       setError("Password must be at least 6 characters long.");
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     const result = await signup(formData);

//     if (result?.error) {
//       setError(result.error);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div
//   style={{
//     background:
//       "linear-gradient(220deg, rgb(15, 15, 16) 20%, rgb(7, 20, 52) 40%, rgb(22, 21, 21) 100%)",
//   }}
//   className="min-h-screen bg-gray-900 text-white relative overflow-hidden"
// >
//   {/* Radiant Background Elements */}
//   <div className="absolute inset-0 overflow-hidden">
//     {/* Geometric shapes */}
//     <motion.div
//       initial={{ opacity: 0, scale: 0.8 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 1.5, delay: 0.5 }}
//       className="absolute -right-32 md:-right-64 top-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 border border-gray-700 rounded-full"
//     />

//     <motion.div
//       initial={{ opacity: 0, x: -100 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 1.2, delay: 0.3 }}
//       className="absolute -left-16 md:-left-32 top-1/6 w-48 h-48 md:w-64 md:h-64 border border-gray-700 rounded-full"
//     />

//     <motion.div
//       initial={{ opacity: 0, x: -150 }}
//       animate={{ opacity: 1, x: 0 }}
//       transition={{ duration: 1.4, delay: 0.7 }}
//       className="absolute -left-24 md:-left-48 bottom-1/6 w-56 h-56 md:w-80 md:h-80 border border-gray-700 rounded-full"
//     />

//     {/* Square outlines */}
//     <motion.div
//       initial={{ opacity: 0, rotate: -45 }}
//       animate={{ opacity: 1, rotate: 0 }}
//       transition={{ duration: 1, delay: 1 }}
//       className="hidden md:block absolute right-8 top-16 w-24 h-24 border border-gray-700"
//     />
//     <motion.div
//       initial={{ opacity: 0, rotate: 45 }}
//       animate={{ opacity: 1, rotate: 0 }}
//       transition={{ duration: 1.2, delay: 1.2 }}
//       className="hidden md:block absolute right-32 bottom-32 w-32 h-32 border border-gray-700"
//     />
//   </div>

//   {/* Header */}
//   <motion.header
//     initial={{ y: -100, opacity: 0 }}
//     animate={{ y: 0, opacity: 1 }}
//     transition={{ duration: 0.8, ease: "easeOut" }}
//     className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6"
//   >
//     <div className="flex items-center space-x-3">
//       <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
//         <div className="w-4 h-4 bg-white rounded-full opacity-80"></div>
//       </div>
//       <span className="text-lg sm:text-xl font-semibold">021 AI</span>
//     </div>

//     <div className="flex items-center space-x-4">
//       <Link
//         href="/"
//         className="text-gray-300 hover:text-white transition-colors"
//       >
//         Home
//       </Link>
//     </div>
//   </motion.header>

//   {/* Main Content */}
//   <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-8">
//     <motion.div
//       initial={{ scale: 0.8, opacity: 0 }}
//       animate={{ scale: 1, opacity: 1 }}
//       transition={{ duration: 0.8, delay: 0.3 }}
//       className="w-full max-w-md space-y-6 p-8 bg-slate-800/40 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl"
//     >
//       <div className="text-center">
//         <h1
//           className="text-3xl font-bold mb-2"
//           style={{
//             background:
//               "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 30%, #64748b 60%, #e2e8f0 100%)",
//             backgroundSize: "200% 200%",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//             backgroundClip: "text",
//           }}
//         >
//           Create your account
//         </h1>
//         <p className="text-gray-300">Join our AI revolution — it&apos;s free.</p>
//       </div>

//       {error && (
//         <motion.div
//           initial={{ opacity: 0, y: -10 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm"
//         >
//           {error}
//         </motion.div>
//       )}

//       <form action={handleSubmit} className="space-y-4">
//         <div>
//           <input
//             type="email"
//             name="email"
//             required
//             placeholder="Email"
//             className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-all duration-300"
//           />
//         </div>
//         <div>
//           <input
//             type="password"
//             name="password"
//             required
//             placeholder="Password (min 6 characters)"
//             minLength={6}
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-all duration-300"
//           />
//         </div>
//         <div>
//           <input
//             type="password"
//             name="confirmPassword"
//             required
//             placeholder="Confirm Password"
//             minLength={6}
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             className={`w-full bg-gray-700/50 border rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-300 ${
//               !passwordsMatch && confirmPassword
//                 ? "border-red-500 focus:ring-red-400 focus:border-red-500"
//                 : "border-gray-600 focus:ring-cyan-400 focus:border-cyan-500"
//             }`}
//           />
//           {!passwordsMatch && confirmPassword && (
//             <motion.p
//               initial={{ opacity: 0, y: -5 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="text-red-400 text-xs mt-2 ml-1"
//             >
//               Passwords do not match
//             </motion.p>
//           )}
//         </div>

//         {/* Terms and Conditions Checkbox */}
//         <div className="flex items-start space-x-3 py-2">
//           <div className="flex items-center h-5">
//             <input
//               id="terms"
//               type="checkbox"
//               checked={agreedToTerms}
//               onChange={(e) => setAgreedToTerms(e.target.checked)}
//               className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-400 focus:ring-2 accent-cyan-500"
//             />
//           </div>
//           <span className="text-cyan-400 group hover:text-cyan-200"> 
//           <label htmlFor="terms" className="text-sm text-gray-300 leading-5">
//              I agree to the {" "} 
//             <button
//                 onClick={() => openModal("terms")}
//                 className="text-xs text-cyan-400 group-hover:text-cyan-200 sm:text-sm"
//               >
//                 Terms
//               </button>
//                <span className="text-cyan-400 group-hover:text-cyan-200"> & </span>
//               <button
//                 onClick={() => openModal("privacy")}
//                 className="text-xs text-cyan-400 group-hover:text-cyan-200 sm:text-sm"
//               >
//                 Privacy
//               </button>

            
  
//             {/* <Link
//               href="/terms"
//               className="text-cyan-400 hover:text-cyan-300 transition-colors underline"
//             >
              
//             </Link>
//             <Link
//               href="/privacy"
//               className="text-cyan-400 hover:text-cyan-300 transition-colors underline"
//             >
              
//             </Link> */}
//           </label>
//           </span>  
//           <LegalModal
//             isOpen={isOpen}
//             onClose={closeModal}
//             title={modalType === "terms" ? "Terms" : modalType === "privacy" ? "Privacy Policy" : ""}
//           >
//             {modalType === "terms" && (
//               <p className="text-sm text-gray-700 whitespace-pre-line">
// Welcome to 021 AI Co-Founder, your AI-powered partner in turning ideas into ventures. By accessing or using our website, app, or services (collectively &quot;Platform&quot;), you agree to these Terms.
// <ul className="list-[square] pl-6">
//   <li>Eligibility: <br></br>
// You must be at least 18 years old to use the Platform.
// You agree to provide accurate information when registering.</li>
//   <li>Nature of Service: <br></br>
// 021 AI Co-Founder is an AI-based guidance platform. It provides insights, recommendations, and strategic support but does not replace professional legal, financial, or business advice.
// Any decisions you make using the Platform remain your sole responsibility.</li>
//   <li>User Conduct: <br></br>
// You agree not to:
// Use the Platform for unlawful, harmful, or fraudulent purposes.
// Upload malicious content or attempt to disrupt system integrity.
// Infringe on intellectual property rights of others.</li>
//   <li> Intellectual Property: <br></br>
// All technology, models, algorithms, branding, and content within the Platform are the property of EVOA Technology Pvt Ltd.
// You retain ownership of the content, ideas, and business information you submit. By using the Platform, you grant us a limited, non-exclusive license to process, analyze, and use your data solely for service delivery and improvement.
// </li>
//   <li> Privacy & Data Use: <br></br>
// Your personal and business data is protected under our Privacy Policy.
// We do not sell your personal information to third parties.
// Data may be used to enhance features, personalize insights, and ensure compliance with applicable law.</li>
//   <li>No Guarantee of Outcomes: <br></br>
// We provide AI-driven guidance. However:
// We do not guarantee funding, success, profitability, or specific results.
// The Platform is a tool, not a replacement for human expertise or execution.</li>
//   <li>Limitation of Liability: <br></br>
// To the maximum extent permitted by law, EVOA Technology Pvt Ltd is not liable for:
// Business losses, missed opportunities, or damages resulting from reliance on AI guidance.
// Indirect, incidental, or consequential damages.</li>
//   <li>Termination: <br></br>
// We may suspend or terminate your account if you breach these Terms or misuse the Platform.</li>
//   <li>Changes to Terms: <br></br>
// We may update these Terms periodically. Continued use of the Platform means you accept the updated Terms.</li>
//   <li>Governing Law & Jurisdiction: <br></br>
// These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms or the use of the Platform shall be subject to the exclusive jurisdiction of the courts in Bareilly, Uttar Pradesh.
// By using 021 AI Co-Founder, you agree to these Terms.</li>
// </ul>
//               </p>
//             )}
//             {modalType === "privacy" && (
//               <p className="text-sm text-gray-700 whitespace-pre-line">
// Your privacy matters. This Privacy Policy explains how we collect, use, store, and protect your information when you use 021 AI Co-Founder.
// <ul className="list-[square] pl-6">
//   <li>Information We Collect
// Personal Information: Name, email, phone, company details (when provided during signup).
// Usage Data: Log files, browser type, device information, and interactions with the Platform.
// Business Data: Ideas, documents, and inputs you provide for AI analysis.</li>  
//   <li>How We Use Your Data
// We use your data to:
// Deliver AI-powered insights and recommendations.
// Personalize your user experience.
// Improve and train our AI models (anonymized where possible).
// Ensure platform security and compliance with laws.</li>  
//   <li> Data Protection
// Your data is stored securely with encryption and strict access controls.
// We do not sell or rent your personal information.
// We may share anonymized or aggregated insights for research, reporting, or product improvement.</li>  
//   <li> Third-Party Services
// We may use third-party providers (e.g., hosting, analytics, payment processors). They are bound by confidentiality and data protection agreements.
// We are not responsible for third-party websites linked through the Platform.</li>  
//   <li>User Rights
// Depending on your jurisdiction, you may have the right to:
// Access, update, or delete your data.
// Opt out of certain data uses (like marketing).
// Request a copy of your stored information.
// To exercise these rights, contact us at: connectevoa@gmail.com</li>  
//   <li> Cookies & Tracking
// We use cookies and similar technologies to enhance performance, analytics, and personalization. You can disable cookies in your browser settings.</li>  
//   <li> Data Retention
// We retain your information as long as your account is active or as required by law.</li>  
//   <li> Children&apos;s Privacy
// Our services are not directed at individuals under 18. We do not knowingly collect data from children.</li>  
//   <li>Policy Updates
// We may update this Privacy Policy from time to time. Any changes will be posted here, with the effective date updated.
// </li>   
// </ul>
// Contact Us:
// If you have questions about this Privacy Policy, email us at: connectevoa@gmail.com
//               </p>
//             )}
//           </LegalModal>
//         </div>

//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           type="submit"
//           disabled={isLoading || !agreedToTerms || !passwordsMatch}
//           className={`w-full font-medium py-3 rounded-lg transition-all duration-300 shadow-lg ${
//             agreedToTerms && !isLoading && passwordsMatch
//               ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white hover:shadow-cyan-500/25"
//               : "bg-gray-600 text-gray-400 cursor-not-allowed"
//           }`}
//         >
//           {isLoading ? "Creating account..." : "Sign Up"}
//         </motion.button>
//       </form>
//         <motion.button
//         whileHover={{ scale: 1.02 }}
//         whileTap={{ scale: 0.98 }}
//         onClick={handleGoogleLogin}
//         disabled={isLoading || !agreedToTerms}
//         className={`w-full font-medium py-3 rounded-lg transition-all duration-300 shadow-lg ${
//             agreedToTerms && !isLoading
//               ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white hover:shadow-cyan-500/25"
//               : "bg-gray-600 text-gray-400 cursor-not-allowed"
//           }`}
//       >
//         Continue with Google
//       </motion.button>

//       <p className="text-center text-gray-300">
//         Already have an account?{" "}
//         <a
//           href="/login"
//           className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
//         >
//           Log in
//         </a>
//       </p>
//     </motion.div>
//   </main>
// </div>
//   );
// }




// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "../store/authStore";
// import { signup } from "./action";
// import { motion } from "framer-motion";
// import { createClient } from "@/utils/supabase/client";
// import Link from "next/link";
// import LegalModal from "@/components/ui/LegalModal";

// export default function RegisterPage() {
//   const router = useRouter();
//   const supabase = createClient();
//   const { user, isAuthenticated, checkAuth } = useAuthStore();
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [agreedToTerms, setAgreedToTerms] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [modalType, setModalType] = useState<"terms" | "privacy" | null>(null);
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordsMatch, setPasswordsMatch] = useState(true);

//   // Typing animation (copied from LoginPage)
//   const lines = [
//     "Helps to validate your idea",
//     "How to find the target audience for my product",
//     "Create Marketing Strategies for my startup",
//     "write a code for my website",
//     "I want to build a burger Franchise business",
//     "Create a website for my e-commerce business",
//     "Create pitchdeck for seed funding round",
//     "Help me to market my product",
//   ];
//   const [displayed, setDisplayed] = useState("");
//   const [cursorVisible, setCursorVisible] = useState(true);

//   const displayedRef = useRef("");
//   const lineIndexRef = useRef(0);
//   const isDeletingRef = useRef(false);
//   const timersRef = useRef<number[]>([]);
//   const typingSpeed = 50;
//   const deletingSpeed = 30;
//   const pauseAfterTyping = 1400;
//   const pauseAfterDeleting = 300;

//   // Typing cursor blink
//   useEffect(() => {
//     const id = window.setInterval(() => {
//       setCursorVisible((v) => !v);
//     }, 500);
//     timersRef.current.push(id);
//     return () => {
//       timersRef.current.forEach((t) => clearInterval(t));
//       timersRef.current = [];
//     };
//   }, []);

//   useEffect(() => {
//     displayedRef.current = displayed;
//   }, [displayed]);

//   useEffect(() => {
//     let mounted = true;

//     const clearAll = () => {
//       timersRef.current.forEach((t) => clearTimeout(t));
//       timersRef.current = [];
//     };

//     const schedule = (fn: () => void, ms: number) => {
//       const id = window.setTimeout(() => {
//         if (!mounted) return;
//         fn();
//       }, ms);
//       timersRef.current.push(id);
//     };

//     const tick = () => {
//       const idx = lineIndexRef.current;
//       const full = lines[idx];
//       const current = displayedRef.current;

//       if (!isDeletingRef.current) {
//         const next = full.slice(0, current.length + 1);
//         setDisplayed(next);
//         displayedRef.current = next;

//         if (next === full) {
//           schedule(() => {
//             isDeletingRef.current = true;
//             tick();
//           }, pauseAfterTyping);
//         } else {
//           schedule(tick, typingSpeed);
//         }
//       } else {
//         const next = full.slice(0, Math.max(0, current.length - 1));
//         setDisplayed(next);
//         displayedRef.current = next;

//         if (next === "") {
//           schedule(() => {
//             isDeletingRef.current = false;
//             lineIndexRef.current = (lineIndexRef.current + 1) % lines.length;
//             tick();
//           }, pauseAfterDeleting);
//         } else {
//           schedule(tick, deletingSpeed);
//         }
//       }
//     };

//     schedule(tick, 400);

//     return () => {
//       mounted = false;
//       clearAll();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const openModal = (type: "terms" | "privacy") => {
//     setModalType(type);
//     setIsOpen(true);
//   };

//   const closeModal = () => {
//     setIsOpen(false);
//     setModalType(null);
//   };

//   // Password match check
//   useEffect(() => {
//     if (confirmPassword) {
//       setPasswordsMatch(password === confirmPassword);
//     } else {
//       setPasswordsMatch(true);
//     }
//   }, [password, confirmPassword]);

//   // Auth checks
//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   useEffect(() => {
//     if (isAuthenticated && user) router.replace("/chat");
//   }, [isAuthenticated, user, router]);

//   if (isLoading) {
//     return (
//       <main className="min-h-screen flex items-center justify-center bg-black">
//         <div className="text-center text-white">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/60 mx-auto mb-4"></div>
//           <p className="text-gray-400">Checking authentication...</p>
//         </div>
//       </main>
//     );
//   }

//   const handleGoogleLogin = async () => {
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: {
//         redirectTo: `${window.location.origin}/chat`,
//       },
//     });
//     if (error) {
//       console.error("❌ Google login error:", error.message);
//       setError(error.message);
//     }
//   };

//   const handleSubmit = async (formData: FormData) => {
//     if (!agreedToTerms) {
//       setError("You must agree to the terms and conditions to continue.");
//       return;
//     }

//     if (!passwordsMatch) {
//       setError("Passwords do not match. Please check and try again.");
//       return;
//     }

//     if (password.length < 6) {
//       setError("Password must be at least 6 characters long.");
//       return;
//     }

//     setIsLoading(true);
//     setError(null);

//     const result = await signup(formData);

//     if (result?.error) {
//       setError(result.error);
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Header (same as login) */}
//       <header className="w-full px-6 py-6">
//         <div className="max-w-6xl mx-auto flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
//               <div className="w-4 h-4 bg-black rounded-full" />
//             </div>
//             <span className="font-semibold text-lg">021 AI</span>
//           </div>
//           <nav className="hidden sm:flex gap-6">
//             <Link href="/" className="text-gray-300 hover:text-white">
//               Home
//             </Link>
//           </nav>
//         </div>
//       </header>

//       {/* 60:40 layout (hero left, register card right) */}
//       <main className="w-full min-h-[calc(100vh-120px)]">
//         <div className="max-w-6xl mx-auto flex flex-col md:flex-row h-[calc(100vh-120px)]">
//           {/* Left: hero content (60%) with typing animation */}
//           <section className="w-full md:w-3/5 flex items-center">
//             <div className="px-6 md:px-12 py-12 md:py-24">
//               <h2 className="text-[44px] md:text-[60px] leading-tight font-extrabold tracking-tight mb-6 text-white">
//                 Create your account
//               </h2>

//               <div className="flex items-start gap-4">
//                 <div className="mt-2">
//                   <div />
//                 </div>

//                 <div>
//                   <p className="text-gray-200 mb-4">
//                     Your AI assistant helps with:
//                   </p>

//                   <div className="h-8">
//                     <span className="text-lg md:text-xl font-medium text-white">
//                       {displayed}
//                     </span>
//                     <span
//                       className={`inline-block ml-1 align-middle ${
//                         cursorVisible ? "opacity-100" : "opacity-0"
//                       }`}
//                       style={{ transition: "opacity 150ms" }}
//                     >
//                       <span className="bg-white inline-block w-[2px] h-6 align-middle" />
//                     </span>
//                   </div>

//                   <p className="mt-6 text-sm text-gray-400 max-w-md">
//                     Fast, private, and tailored to your needs — create an account to access your workspace.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Right: register card (40%) */}
//           <aside className="w-full md:w-2/5 flex items-center justify-center border-l border-white/6 md:translate-x-8">
//             <div className="w-full max-w-md p-8">
//               <div className="space-y-6 bg-white/3 backdrop-blur-sm border border-white/6 rounded-xl p-6">
//                 <div className="text-center">
//                   <h1 className="text-2xl font-bold mb-1 text-white">Create your account</h1>
//                   <p className="text-gray-300">Join our AI revolution — it&apos;s free.</p>
//                 </div>

//                 {error && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -8 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className="bg-red-900/60 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm"
//                   >
//                     {error}
//                   </motion.div>
//                 )}

//                 <form
//                   onSubmit={(e) => {
//                     e.preventDefault();
//                     const fd = new FormData(e.currentTarget as HTMLFormElement);
//                     // append password fields (since we track them in state)
//                     fd.set("password", password);
//                     fd.set("confirmPassword", confirmPassword);
//                     void handleSubmit(fd);
//                   }}
//                   className="space-y-4"
//                 >
//                   <div>
//                     <input
//                       type="email"
//                       name="email"
//                       required
//                       placeholder="Email"
//                       className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
//                     />
//                   </div>

//                   <div>
//                     <input
//                       type="password"
//                       name="passwordInput"
//                       required
//                       placeholder="Password (min 6 characters)"
//                       minLength={6}
//                       value={password}
//                       onChange={(e) => setPassword(e.target.value)}
//                       className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
//                     />
//                   </div>

//                   <div>
//                     <input
//                       type="password"
//                       name="confirmPasswordInput"
//                       required
//                       placeholder="Confirm Password"
//                       minLength={6}
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       className={`w-full bg-transparent rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
//                         !passwordsMatch && confirmPassword
//                           ? "border border-red-500 focus:ring-red-400"
//                           : "border border-white/10 focus:ring-white/20"
//                       }`}
//                     />
//                     {!passwordsMatch && confirmPassword && (
//                       <motion.p
//                         initial={{ opacity: 0, y: -5 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         className="text-red-400 text-xs mt-2 ml-1"
//                       >
//                         Passwords do not match
//                       </motion.p>
//                     )}
//                   </div>

//                   {/* Terms */}
//                   <div className="flex items-start space-x-3 py-2">
//                     <div className="flex items-center h-5">
//                       <input
//                         id="terms"
//                         type="checkbox"
//                         checked={agreedToTerms}
//                         onChange={(e) => setAgreedToTerms(e.target.checked)}
//                         className="w-4 h-4 text-cyan-500 bg-black border-gray-600 rounded focus:ring-cyan-400 focus:ring-2 accent-cyan-500"
//                       />
//                     </div>
//                     <label htmlFor="terms" className="text-sm text-gray-300 leading-5">
//                       I agree to the{" "}
//                       <button
//                         onClick={() => openModal("terms")}
//                         type="button"
//                         className="text-cyan-400 hover:text-cyan-300 underline text-sm"
//                       >
//                         Terms
//                       </button>{" "}
//                       &{" "}
//                       <button
//                         onClick={() => openModal("privacy")}
//                         type="button"
//                         className="text-cyan-400 hover:text-cyan-300 underline text-sm"
//                       >
//                         Privacy
//                       </button>
//                     </label>

//                     <LegalModal
//                       isOpen={isOpen}
//                       onClose={closeModal}
//                       title={modalType === "terms" ? "Terms" : modalType === "privacy" ? "Privacy Policy" : ""}
//                     >
//                       {modalType === "terms" && (
//                         <div className="text-sm text-gray-700 whitespace-pre-line">
//                           <p>
//                             Welcome to 021 AI Co-Founder, your AI-powered partner in turning ideas into ventures. By accessing or using our website, app, or services (collectively "Platform"), you agree to these Terms.
//                           </p>
//                           <ul className="list-[square] pl-6 mt-3 space-y-2 text-sm text-gray-700">
//                             <li>
//                               <strong>Eligibility:</strong><br />
//                               You must be at least 18 years old to use the Platform. You agree to provide accurate information when registering.
//                             </li>
//                             <li>
//                               <strong>Nature of Service:</strong><br />
//                               021 AI Co-Founder is an AI-based guidance platform. It provides insights, recommendations, and strategic support but does not replace professional legal, financial, or business advice. Any decisions you make using the Platform remain your sole responsibility.
//                             </li>
//                             <li>
//                               <strong>User Conduct:</strong><br />
//                               You agree not to: Use the Platform for unlawful, harmful, or fraudulent purposes. Upload malicious content or attempt to disrupt system integrity. Infringe on intellectual property rights of others.
//                             </li>
//                             <li>
//                               <strong>Intellectual Property:</strong><br />
//                               All technology, models, algorithms, branding, and content within the Platform are the property of EVOA Technology Pvt Ltd. You retain ownership of the content, ideas, and business information you submit. By using the Platform, you grant us a limited, non-exclusive license to process, analyze, and use your data solely for service delivery and improvement.
//                             </li>
//                             <li>
//                               <strong>Privacy & Data Use:</strong><br />
//                               Your personal and business data is protected under our Privacy Policy. We do not sell your personal information to third parties. Data may be used to enhance features, personalize insights, and ensure compliance with applicable law.
//                             </li>
//                             <li>
//                               <strong>No Guarantee of Outcomes:</strong><br />
//                               We provide AI-driven guidance. However: We do not guarantee funding, success, profitability, or specific results. The Platform is a tool, not a replacement for human expertise or execution.
//                             </li>
//                             <li>
//                               <strong>Limitation of Liability:</strong><br />
//                               To the maximum extent permitted by law, EVOA Technology Pvt Ltd is not liable for: Business losses, missed opportunities, or damages resulting from reliance on AI guidance. Indirect, incidental, or consequential damages.
//                             </li>
//                             <li>
//                               <strong>Termination:</strong><br />
//                               We may suspend or terminate your account if you breach these Terms or misuse the Platform.
//                             </li>
//                             <li>
//                               <strong>Changes to Terms:</strong><br />
//                               We may update these Terms periodically. Continued use of the Platform means you accept the updated Terms.
//                             </li>
//                             <li>
//                               <strong>Governing Law & Jurisdiction:</strong><br />
//                               These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms or the use of the Platform shall be subject to the exclusive jurisdiction of the courts in Bareilly, Uttar Pradesh.
//                             </li>
//                           </ul>
//                           <p className="mt-3 text-sm text-gray-700">By using 021 AI Co-Founder, you agree to these Terms.</p>
//                         </div>
//                       )}
//                       {modalType === "privacy" && (
//                         <div className="text-sm text-gray-700 whitespace-pre-line">
//                           <p>Your privacy matters. This Privacy Policy explains how we collect, use, store, and protect your information when you use 021 AI Co-Founder.</p>
//                           <ul className="list-[square] pl-6 mt-3 space-y-2 text-sm text-gray-700">
//                             <li>
//                               <strong>Information We Collect</strong><br />
//                               Personal Information: Name, email, phone, company details (when provided during signup). Usage Data: Log files, browser type, device information, and interactions with the Platform. Business Data: Ideas, documents, and inputs you provide for AI analysis.
//                             </li>
//                             <li>
//                               <strong>How We Use Your Data</strong><br />
//                               We use your data to: Deliver AI-powered insights and recommendations. Personalize your user experience. Improve and train our AI models (anonymized where possible). Ensure platform security and compliance with laws.
//                             </li>
//                             <li>
//                               <strong>Data Protection</strong><br />
//                               Your data is stored securely with encryption and strict access controls. We do not sell or rent your personal information. We may share anonymized or aggregated insights for research, reporting, or product improvement.
//                             </li>
//                             <li>
//                               <strong>Third-Party Services</strong><br />
//                               We may use third-party providers (e.g., hosting, analytics, payment processors). They are bound by confidentiality and data protection agreements. We are not responsible for third-party websites linked through the Platform.
//                             </li>
//                             <li>
//                               <strong>User Rights</strong><br />
//                               Depending on your jurisdiction, you may have the right to: Access, update, or delete your data. Opt out of certain data uses (like marketing). Request a copy of your stored information. To exercise these rights, contact us at: connectevoa@gmail.com
//                             </li>
//                             <li>
//                               <strong>Cookies & Tracking</strong><br />
//                               We use cookies and similar technologies to enhance performance, analytics, and personalization. You can disable cookies in your browser settings.
//                             </li>
//                             <li>
//                               <strong>Data Retention</strong><br />
//                               We retain your information as long as your account is active or as required by law.
//                             </li>
//                             <li>
//                               <strong>Children's Privacy</strong><br />
//                               Our services are not directed at individuals under 18. We do not knowingly collect data from children.
//                             </li>
//                             <li>
//                               <strong>Policy Updates</strong><br />
//                               We may update this Privacy Policy from time to time. Any changes will be posted here, with the effective date updated.
//                             </li>
//                           </ul>
//                           <p className="mt-3">Contact Us: connectevoa@gmail.com</p>
//                         </div>
//                       )}
//                     </LegalModal>
//                   </div>

//                   <motion.button
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     type="submit"
//                     disabled={isLoading || !agreedToTerms || !passwordsMatch}
//                     className={`w-full font-medium py-3 rounded-lg transition-all duration-200 shadow-sm ${
//                       agreedToTerms && !isLoading && passwordsMatch
//                         ? "bg-white text-black"
//                         : "bg-white/10 text-gray-300 cursor-not-allowed"
//                     }`}
//                   >
//                     {isLoading ? "Creating account..." : "Sign Up"}
//                   </motion.button>
//                 </form>

//                 <motion.button
//                 type="button"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleGoogleLogin}
//                   disabled={isLoading || !agreedToTerms}
//                   className={`w-full border border-white/10 text-white font-medium py-3 rounded-lg transition-all duration-200 ${agreedToTerms ? "" : "opacity-60 cursor-not-allowed"}`}
//                 >
//                   Continue with Google
//                 </motion.button>

//                 <p className="text-center text-gray-300">
//                   Already have an account?{" "}
//                   <Link href="/login" className="text-white underline">
//                     Log in
//                   </Link>
//                 </p>
//               </div>
//             </div>
//           </aside>
//         </div>
//       </main>
//     </div>
//   );
// }






"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { signup } from "./action";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import LegalModal from "@/components/ui/LegalModal";

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

  // Typing animation data and refs (unchanged)
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
      <main className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/60 mx-auto mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
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

  // Wrapper for Google click — shows error if terms not accepted
  const handleGoogleClick = async () => {
    console.log("handleGoogleClick fired — agreedToTerms:", agreedToTerms);
    setError(null);
    if (!agreedToTerms) {
      setError("Please accept the Terms & Privacy before continuing with Google.");
      // optional: auto-open terms modal to help the user:
      // setModalType("terms"); setIsOpen(true);
      return;
    }
    await handleGoogleLogin();
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
    <div className="min-h-screen bg-black text-white">
      {/* Debug helper: uncomment to visually reveal invisible overlays */}
      {/* <style>{`* { outline: 1px dashed rgba(255,0,0,0.08) !important; }`}</style> */}

      {/* Header */}
      <header className="w-full px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-full" />
            </div>
            <span className="font-semibold text-lg">021 AI</span>
          </div>
          <nav className="hidden sm:flex gap-6">
            <Link href="/" className="text-gray-300 hover:text-white">
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="w-full min-h-[calc(100vh-120px)]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row h-[calc(100vh-120px)]">
          <section className="w-full md:w-3/5 flex items-center">
            <div className="px-6 md:px-12 py-12 md:py-24">
              <h2 className="text-[44px] md:text-[60px] leading-tight font-extrabold tracking-tight mb-6 text-white">
                Create your account
              </h2>

              <div className="flex items-start gap-4">
                <div className="mt-2">
                  <div />
                </div>

                <div>
                  <p className="text-gray-200 mb-4">Your AI assistant helps with:</p>

                  <div className="h-8">
                    <span className="text-lg md:text-xl font-medium text-white">{displayed}</span>
                    <span
                      className={`inline-block ml-1 align-middle ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                      style={{ transition: "opacity 150ms" }}
                    >
                      <span className="bg-white inline-block w-[2px] h-6 align-middle" />
                    </span>
                  </div>

                  <p className="mt-6 text-sm text-gray-400 max-w-md">
                    Fast, private, and tailored to your needs — create an account to access your workspace.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Right card */}
          <aside className="w-full md:w-2/5 flex items-center justify-center border-l border-white/6 md:translate-x-8">
            {/* make this relative so child z-index works predictably */}
            <div className="w-full max-w-md p-8 relative z-0">
              <div className="space-y-6 bg-white/3 backdrop-blur-sm border border-white/6 rounded-xl p-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-1 text-white">Create your account</h1>
                  <p className="text-gray-300">Join our AI revolution — it&apos;s free.</p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-900/60 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm"
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
                      className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
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
                      className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
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
                      className={`w-full bg-transparent rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                        !passwordsMatch && confirmPassword
                          ? "border border-red-500 focus:ring-red-400"
                          : "border border-white/10 focus:ring-white/20"
                      }`}
                    />
                    {!passwordsMatch && confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-2 ml-1"
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
                        className="w-4 h-4 text-cyan-500 bg-black border-gray-600 rounded focus:ring-cyan-400 focus:ring-2 accent-cyan-500"
                      />
                    </div>
                    <label htmlFor="terms" className="text-sm text-gray-300 leading-5">
                      I agree to the{" "}
                      <button onClick={() => openModal("terms")} type="button" className="text-cyan-400 hover:text-cyan-300 underline text-sm">
                        Terms
                      </button>{" "}
                      &{" "}
                      <button onClick={() => openModal("privacy")} type="button" className="text-cyan-400 hover:text-cyan-300 underline text-sm">
                        Privacy
                      </button>
                    </label>

                    <LegalModal
                      isOpen={isOpen}
                      onClose={closeModal}
                      title={modalType === "terms" ? "Terms" : modalType === "privacy" ? "Privacy Policy" : ""}
                    >
                      {/* truncated for brevity in this snippet — keep your existing modal content */}
                      {modalType === "terms" ? <div>...terms content...</div> : <div>...privacy content...</div>}
                    </LegalModal>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading || !agreedToTerms || !passwordsMatch}
                    className={`w-full font-medium py-3 rounded-lg transition-all duration-200 shadow-sm ${
                      agreedToTerms && !isLoading && passwordsMatch ? "bg-white text-black" : "bg-white/10 text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </motion.button>
                </form>

                {/* Google button: forced pointer events + debug logging */}
                <motion.button
                  type="button"
                  onClick={handleGoogleClick}
                  onPointerDown={() => console.log("pointerDown on Google button")}
                  onMouseDown={() => console.log("mouseDown on Google button")}
                  className="w-full border border-white/10 text-white font-medium py-3 rounded-lg transition-all duration-200 relative z-50 pointer-events-auto"
                  // ARIA note: keep accessibility info up-to-date
                  aria-pressed="false"
                  aria-label="Continue with Google"
                >
                  Continue with Google
                </motion.button>

                <p className="text-center text-gray-300">
                  Already have an account?{" "}
                  <Link href="/login" className="text-white underline">
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
