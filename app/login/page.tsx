// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "../store/authStore";
// import { login } from "./action";
// import { motion } from "framer-motion";
// import { createClient } from "@/utils/supabase/client";
// import Link from "next/link";

// export default function LoginPage() {
//   const router = useRouter();
//   const supabase = createClient();
//   const { user, isAuthenticated, checkAuth } = useAuthStore();
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   // Redirect if already authenticated
//   useEffect(() => {
//     // Trigger auth check once (guarded in the store)
//     checkAuth();
//   }, [checkAuth]);

//   useEffect(() => {
//     if (isAuthenticated && user) {
//       router.replace("/"); // redirect to home instead of /chat
//     }
//   }, [isAuthenticated, user, router]);

//   const handleGoogleLogin = async () => {
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: {
//         redirectTo: `${window.location.origin}/chat`,
//       },
//     });
//     if (error) {
//       setError(error.message);
//     }
//   };

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

//   const handleSubmit = async (formData: FormData) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       await login(formData);
//       router.replace("/chat"); // ✅ redirect only here
//     } catch (error) {
//       const message =
//         error instanceof Error
//           ? error.message
//           : "Login failed. Please check your credentials.";
//       setError(message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         background:
//           "linear-gradient(220deg, rgb(0, 0, 0) 20%, rgb(0, 0, 0) 40%, rgb(22, 21, 21) 100%",
//       }}
//       className="min-h-screen bg-gray-900 text-white relative overflow-hidden"
//     >
//       {/* Radiant Background Elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         {/* Geometric shapes */}
//         <motion.div
//           initial={{ opacity: 0, scale: 0.8 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ duration: 1.5, delay: 0.5 }}
//           className="absolute -right-32 md:-right-64 top-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 border border-gray-700 rounded-full"
//         />

//         <motion.div
//           initial={{ opacity: 0, x: -100 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 1.2, delay: 0.3 }}
//           className="absolute -left-16 md:-left-32 top-1/6 w-48 h-48 md:w-64 md:h-64 border border-gray-700 rounded-full"
//         />

//         <motion.div
//           initial={{ opacity: 0, x: -150 }}
//           animate={{ opacity: 1, x: 0 }}
//           transition={{ duration: 1.4, delay: 0.7 }}
//           className="absolute -left-24 md:-left-48 bottom-1/6 w-56 h-56 md:w-80 md:h-80 border border-gray-700 rounded-full"
//         />

//         {/* Square outlines */}
//         <motion.div
//           initial={{ opacity: 0, rotate: -45 }}
//           animate={{ opacity: 1, rotate: 0 }}
//           transition={{ duration: 1, delay: 1 }}
//           className="hidden md:block absolute right-8 top-16 w-24 h-24 border border-gray-700"
//         />
//         <motion.div
//           initial={{ opacity: 0, rotate: 45 }}
//           animate={{ opacity: 1, rotate: 0 }}
//           transition={{ duration: 1.2, delay: 1.2 }}
//           className="hidden md:block absolute right-32 bottom-32 w-32 h-32 border border-gray-700"
//         />
//       </div>

//       {/* Header */}
//       <motion.header
//         initial={{ y: -100, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         transition={{ duration: 0.8, ease: "easeOut" }}
//         className="relative z-10 flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6"
//       >
//         <div className="flex items-center space-x-3">
//           <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center">
//             <div className="w-4 h-4 bg-white rounded-full opacity-80"></div>
//           </div>
//           <span className="text-lg sm:text-xl font-semibold">021 AI</span>
//         </div>

//         <div className="flex items-center space-x-4">
//           <Link
//             href="/"
//             className="text-gray-300 hover:text-white transition-colors"
//           >
//             Home
//           </Link>
//         </div>
//       </motion.header>

//       {/* Main Content */}
//       <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-8">
//         <motion.div
//           initial={{ scale: 0.8, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ duration: 0.8, delay: 0.3 }}
//           className="w-full max-w-md space-y-6 p-8 bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl"
//         >
//           <div className="text-center">
//             <h1
//               className="text-3xl font-bold mb-2"
//               style={{
//                 background:
//                   "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 30%, #64748b 60%, #e2e8f0 100%)",
//                 backgroundSize: "200% 200%",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//                 backgroundClip: "text",
//               }}
//             >
//               Welcome back
//             </h1>
//             <p className="text-gray-300">Log in to access your AI workspace.</p>
//           </div>

//           {error && (
//             <motion.div
//               initial={{ opacity: 0, y: -10 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm"
//             >
//               {error}
//             </motion.div>
//           )}

//           <form action={handleSubmit} className="space-y-4">
//             <div>
//               <input
//                 type="email"
//                 name="email"
//                 required
//                 placeholder="Email"
//                 className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-all duration-300"
//               />
//             </div>
//             <div>
//               <input
//                 type="password"
//                 name="password"
//                 required
//                 placeholder="Password"
//                 className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-all duration-300"
//               />
//             </div>
//             <div className="flex justify-end">
//               <Link
//                 href="/forgot-password"
//                 className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
//               >
//                 Forgot password?
//               </Link>
//             </div>
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
//             >
//               {isLoading ? "Signing in..." : "Log In"}
//             </motion.button>
//           </form>

//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             onClick={handleGoogleLogin}
//             disabled={isLoading}
//             className={`w-full font-medium py-3 rounded-lg transition-all duration-300 shadow-lg ${
//               !isLoading
//                 ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white hover:shadow-cyan-500/25"
//                 : "bg-gray-600 text-gray-400 cursor-not-allowed"
//             }`}
//           >
//             Continue with Google
//           </motion.button>
//           <p className="text-center text-gray-300">
//             New here?{" "}
//             <a
//               href="/register"
//               className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
//             >
//               Create an account
//             </a>
//           </p>
//         </motion.div>
//       </main>
//     </div>
//   );
// }




// Added new Gpt UI for Login Page





// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "../store/authStore";
// import { login } from "./action";
// import { motion } from "framer-motion";
// import { createClient } from "@/utils/supabase/client";
// import Link from "next/link";


// export default function LoginPage() {
//   const router = useRouter();
//   const supabase = createClient();
//   const { user, isAuthenticated, checkAuth } = useAuthStore();
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   // -------- Typing animation (fixed version using refs) --------
//   const lines = [
//     "Helps to validate your idea",
//     "write a code for my website",
//     "I want to build a burger Franchise business",
//     "Create a website for my e-commerce business",
//     "Create pitchdeck fo seed funding round",
//     "Help me to market my product",
//   ];

//   const [displayed, setDisplayed] = useState("");
//   const [cursorVisible, setCursorVisible] = useState(true);

//   // refs to hold latest values for the timeouts so we don't close over stale state
//   const displayedRef = useRef("");
//   const lineIndexRef = useRef(0);
//   const isDeletingRef = useRef(false);
//   const timersRef = useRef<number[]>([]);

//   const typingSpeed = 50; // ms per char while typing
//   const deletingSpeed = 30; // ms per char while deleting
//   const pauseAfterTyping = 1400; // ms pause after a full line typed
//   const pauseAfterDeleting = 300; // ms pause after deletion before next

//   // update refs whenever state changes
//   useEffect(() => {
//     displayedRef.current = displayed;
//   }, [displayed]);

//   // cursor blink
//   useEffect(() => {
//     const id = window.setInterval(() => {
//       setCursorVisible((v) => !v);
//     }, 500);
//     timersRef.current.push(id);
//     return () => {
//       timersRef.current.forEach((t) => clearInterval(t));
//       timersRef.current = timersRef.current.filter((t) => t !== id);
//       clearInterval(id);
//     };
//   }, []);

//   // main typing loop using refs (reliable)
//   useEffect(() => {
//     let mounted = true;

//     const clearAllTimers = () => {
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
//         // typing
//         const next = full.slice(0, current.length + 1);
//         setDisplayed(next);
//         displayedRef.current = next;

//         if (next === full) {
//           // pause then start deleting
//           schedule(() => {
//             isDeletingRef.current = true;
//             // kick next tick quickly to start deleting
//             tick();
//           }, pauseAfterTyping);
//         } else {
//           schedule(tick, typingSpeed);
//         }
//       } else {
//         // deleting
//         const next = full.slice(0, Math.max(0, current.length - 1));
//         setDisplayed(next);
//         displayedRef.current = next;

//         if (next === "") {
//           // move to next line after pause
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

//     // small initial delay to make it feel natural
//     schedule(tick, 400);

//     return () => {
//       mounted = false;
//       clearAllTimers();
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // run once on mount

//   // -------- end typing animation --------

//   // Trigger auth check once (guarded in the store)
//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   useEffect(() => {
//     if (isAuthenticated && user) {
//       router.replace("/"); // redirect to home instead of /chat
//     }
//   }, [isAuthenticated, user, router]);

//   const handleGoogleLogin = async () => {
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: {
//         redirectTo: `${window.location.origin}/chat`,
//       },
//     });
//     if (error) {
//       setError(error.message);
//     }
//   };

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

//   const handleSubmit = async (formData: FormData) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       await login(formData);
//       router.replace("/chat"); // ✅ redirect only here
//     } catch (error) {
//       const message =
//         error instanceof Error
//           ? error.message
//           : "Login failed. Please check your credentials.";
//       setError(message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div
//       style={{
//         background:
//           "linear-gradient(220deg, rgb(0, 0, 0) 20%, rgb(0, 0, 0) 40%, rgb(22, 21, 21) 100%)",
//       }}
//       className="min-h-screen text-white relative overflow-hidden"
//     >
//       {/* decorative shapes */}
//       <div className="absolute inset-0 pointer-events-none">
//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 0.06, scale: 1 }}
//           transition={{ duration: 1.6 }}
//           className="absolute right-[-6rem] top-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-violet-600 to-cyan-400/40 blur-3xl"
//         />
//         <motion.div
//           initial={{ opacity: 0, x: -80 }}
//           animate={{ opacity: 0.04, x: 0 }}
//           transition={{ duration: 1.8, delay: 0.2 }}
//           className="absolute left-[-5rem] bottom-1/5 w-80 h-80 rounded-full bg-indigo-700/40 blur-3xl"
//         />
//       </div>

//       {/* Header */}
//       <header className="relative z-10 flex items-center justify-between px-6 py-6">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
//             <div className="w-4 h-4 bg-white rounded-full opacity-90" />
//           </div>
//           <span className="font-semibold text-lg">021 AI</span>
//         </div>

//         <nav className="hidden sm:flex items-center gap-6">
//           <Link href="/" className="text-gray-300 hover:text-white transition">
//             Home
//           </Link>
//         </nav>
//       </header>

//       {/* Main two-column area */}
//       <main className="relative z-10 flex flex-col-reverse md:flex-row items-center md:items-stretch justify-center min-h-[calc(100vh-110px)] px-6 md:px-12">
//         {/* Left hero */}
//         <motion.section
//           initial={{ x: -30, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ duration: 0.8 }}
//           className="w-full md:w-1/2 flex items-center"
//         >
//           <div className="max-w-3xl mx-auto md:mx-0 py-12 md:py-24">
//             <h2
//               className="text-[48px] md:text-[72px] leading-tight font-extrabold tracking-tight mb-6"
//               style={{
//                 background:
//                   "linear-gradient(90deg, rgba(147, 51, 234, 1) 0%, rgba(99,102,241,1) 50%, rgba(56,189,248,1) 100%)",
//                 WebkitBackgroundClip: "text",
//                 WebkitTextFillColor: "transparent",
//                 backgroundClip: "text",
//               }}
//             >
//               Your AI Co-founder
//             </h2>

//             <div className="flex items-start gap-4">
//               {/* <motion.div
//                 animate={{ scale: [1, 1.35, 1], opacity: [0.9, 1, 0.9] }}
//                 transition={{ repeat: Infinity, duration: 2 }}
//                 className="mt-2"
//               >
//                 <div className="w-8 h-8 rounded-full bg-violet-600/90 shadow-lg" />
//               </motion.div> */}

//               <div>
//                 <p className="text-gray-300 mb-4">Build Faster. Decide Smarter. Win Bigger.</p>

//                 {/* Animated typing line */}
//                 <div className="h-8">
//                   <span className="text-lg md:text-xl font-medium text-gray-100">
//                     {displayed}
//                   </span>
//                   <span
//                     className={`inline-block ml-1 align-middle ${
//                       cursorVisible ? "opacity-100" : "opacity-0"
//                     }`}
//                     style={{ transition: "opacity 150ms" }}
//                   >
//                     <span className="bg-gray-200 inline-block w-[2px] h-6 align-middle" />
//                   </span>
//                 </div>

//                 <p className="mt-6 text-sm text-gray-400 max-w-sm">
//                   Fast, private, and tailored to your needs — try logging in to
//                   access your workspace.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </motion.section>

//         {/* Right login card (keeps your existing form logic) */}
//         <motion.aside
//           initial={{ scale: 0.98, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ duration: 0.6, delay: 0.2 }}
//           className="w-full md:w-1/2 flex items-center justify-center"
//         >
//           <div className="w-full max-w-md space-y-6 p-8 bg-gray-800/40 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl">
//             <div className="text-center">
//               <h1
//                 className="text-3xl font-bold mb-2"
//                 style={{
//                   background:
//                     "linear-gradient(135deg, #e2e8f0 0%, #94a3b8 30%, #64748b 60%, #e2e8f0 100%)",
//                   backgroundSize: "200% 200%",
//                   WebkitBackgroundClip: "text",
//                   WebkitTextFillColor: "transparent",
//                   backgroundClip: "text",
//                 }}
//               >
//                 Welcome back
//               </h1>
//               <p className="text-gray-300">Log in to access your AI workspace.</p>
//             </div>

//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md text-sm"
//               >
//                 {error}
//               </motion.div>
//             )}

//             <form action={handleSubmit} className="space-y-4">
//               <div>
//                 <input
//                   type="email"
//                   name="email"
//                   required
//                   placeholder="Email"
//                   className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-all duration-300"
//                 />
//               </div>
//               <div>
//                 <input
//                   type="password"
//                   name="password"
//                   required
//                   placeholder="Password"
//                   className="w-full bg-gray-700/50 border border-gray-600 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-500 transition-all duration-300"
//                 />
//               </div>
//               <div className="flex justify-end">
//                 <Link
//                   href="/forgot-password"
//                   className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
//                 >
//                   Forgot password?
//                 </Link>
//               </div>
//               <motion.button
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
//               >
//                 {isLoading ? "Signing in..." : "Log In"}
//               </motion.button>
//             </form>

//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={handleGoogleLogin}
//               disabled={isLoading}
//               className={`w-full font-medium py-3 rounded-lg transition-all duration-300 shadow-lg ${
//                 !isLoading
//                   ? "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white hover:shadow-cyan-500/25"
//                   : "bg-gray-600 text-gray-400 cursor-not-allowed"
//               }`}
//             >
//               Continue with Google
//             </motion.button>

//             <p className="text-center text-gray-300">
//               New here?{" "}
//               <a
//                 href="/register"
//                 className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
//               >
//                 Create an account
//               </a>
//             </p>
//           </div>
//         </motion.aside>
//       </main>
//     </div>
//   );
// }















// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "../store/authStore";
// import { login } from "./action";
// import { motion } from "framer-motion";
// import { createClient } from "@/utils/supabase/client";
// import Link from "next/link";

// export default function LoginPage() {
//   const router = useRouter();
//   const supabase = createClient();
//   const { user, isAuthenticated, checkAuth } = useAuthStore();
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   // Typing animation (ref-driven, reliable)
//   const lines = [
//     "Personalized activity ideas",
//     "Plan small events and games",
//     "Generate lists, prompts & suggestions",
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

//   useEffect(() => {
//     displayedRef.current = displayed;
//   }, [displayed]);

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

//   // Auth checks (unchanged)
//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   useEffect(() => {
//     if (isAuthenticated && user) {
//       router.replace("/");
//     }
//   }, [isAuthenticated, user, router]);

//   const handleGoogleLogin = async () => {
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: { redirectTo: `${window.location.origin}/chat` },
//     });
//     if (error) setError(error.message);
//   };

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

//   const handleSubmit = async (formData: FormData) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       await login(formData);
//       router.replace("/chat");
//     } catch (err) {
//       const message = err instanceof Error ? err.message : "Login failed.";
//       setError(message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Header */}
//       <header className="w-full relative">
//         <div className="max-w-6xl mx-auto px-6 py-6 flex items-center">
//           {/* left logo */}
//           <div className="flex items-center gap-3">
//             <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
//               <div className="w-4 h-4 bg-black rounded-full" />
//             </div>
//             <span className="font-semibold text-lg">021 AI</span>
//           </div>
//         </div>

//         {/* Home: positioned at the top right of the viewport on all sizes */}
//         <div className="absolute top-4 right-4 z-50">
//           <Link
//             href="/"
//             className="text-sm md:text-base text-white/90 hover:text-white px-3 py-1 rounded-md"
//           >
//             Home
//           </Link>
//         </div>
//       </header>

//       {/* Main area */}
//       <main className="w-full">
//         <div className="max-w-6xl mx-auto flex flex-col md:flex-row h-[calc(100vh-120px)]">
//           {/* LEFT - 60% */}
//           <section className="w-full md:w-3/5 flex items-start">
//             <div className="px-6 md:px-12 py-8 md:py-24 md:translate-y-12">
//               <h2 className="text-[28px] md:text-[64px] leading-tight font-extrabold tracking-tight mb-6 text-white">
//                 Your AI Co-founder
//               </h2>

//               <div className="flex items-start gap-5">
//                 <div className="mt-1">
//                   <div className=""/>
//                 </div>

//                 <div>
//                   <p className="text-gray-200 mb-4">Your AI assistant helps with:</p>

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
//                     Fast, private, and tailored to your needs — try logging in to
//                     access your workspace.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* RIGHT - 40% */}
//           <aside className="w-full md:w-2/5 flex items-center justify-center border-l border-white/6 h-full md:pr-12">
//             <motion.div
//               initial={{ opacity: 0, y: 10, scale: 0.995 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               transition={{ duration: 0.45, ease: "easeOut" }}
//               className="w-full max-w-md p-6 md:p-8"
//             >
//               <div className="space-y-6 bg-white/4 backdrop-blur-sm border border-white/8 rounded-2xl p-4 md:p-6">
//                 <div className="text-center">
//                   <h1 className="text-xl md:text-2xl font-bold mb-1 text-white">Welcome back</h1>
//                   <p className="text-gray-300 text-sm md:text-base">
//                     Log in to access your AI workspace.
//                   </p>
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

//                 <form action={handleSubmit} className="space-y-3">
//                   <div>
//                     <label className="sr-only" htmlFor="email">
//                       Email
//                     </label>
//                     <input
//                       id="email"
//                       type="email"
//                       name="email"
//                       autoComplete="email"
//                       required
//                       placeholder="Email"
//                       className="w-full bg-transparent border border-white/12 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
//                     />
//                   </div>

//                   <div>
//                     <label className="sr-only" htmlFor="password">
//                       Password
//                     </label>
//                     <input
//                       id="password"
//                       type="password"
//                       name="password"
//                       autoComplete="current-password"
//                       required
//                       placeholder="Password"
//                       className="w-full bg-transparent border border-white/12 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
//                     />
//                   </div>

//                   <div className="flex justify-end">
//                     <Link href="/forgot-password" className="text-sm text-gray-300 hover:underline">
//                       Forgot password?
//                     </Link>
//                   </div>

//                   <motion.button
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full bg-white text-black font-medium py-3 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-60"
//                   >
//                     {isLoading ? "Signing in..." : "Log In"}
//                   </motion.button>
//                 </form>

//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleGoogleLogin}
//                   disabled={isLoading}
//                   className="w-full border border-white/12 text-white font-medium py-3 rounded-lg transition-all duration-200"
//                 >
//                   Continue with Google
//                 </motion.button>

//                 <p className="text-center text-gray-300 text-sm">
//                   New here?{" "}
//                   <Link href="/register" className="text-white underline">
//                     Create an account
//                   </Link>
//                 </p>
//               </div>
//             </motion.div>
//           </aside>
//         </div>
//       </main>
//     </div>
//   );
// }



// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "../store/authStore";
// import { login } from "./action";
// import { motion } from "framer-motion";
// import { createClient } from "@/utils/supabase/client";
// import Link from "next/link";

// export default function Page() {
//   const router = useRouter();
//   const supabase = createClient();
//   const { user, isAuthenticated, checkAuth } = useAuthStore();
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   // Typing animation lines
//   const lines = [
//     "Personalized activity ideas",
//     "Plan small events and games",
//     "Generate lists, prompts & suggestions",
//   ];
//   const [displayed, setDisplayed] = useState("");
//   const [cursorVisible, setCursorVisible] = useState(true);

//   // Refs for typing loop (avoid stale closures)
//   const displayedRef = useRef("");
//   const lineIndexRef = useRef(0);
//   const isDeletingRef = useRef(false);
//   const timersRef = useRef<number[]>([]);

//   const typingSpeed = 50;
//   const deletingSpeed = 30;
//   const pauseAfterTyping = 1400;
//   const pauseAfterDeleting = 300;

//   useEffect(() => {
//     displayedRef.current = displayed;
//   }, [displayed]);

//   // Cursor blink
//   useEffect(() => {
//     const id = window.setInterval(() => setCursorVisible((v) => !v), 500);
//     timersRef.current.push(id);
//     return () => {
//       timersRef.current.forEach((t) => clearInterval(t));
//       timersRef.current = [];
//     };
//   }, []);

//   // Typing loop (ref-driven)
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

//   // Auth checks — unchanged behavior
//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   useEffect(() => {
//     if (isAuthenticated && user) {
//       router.replace("/");
//     }
//   }, [isAuthenticated, user, router]);

//   const handleGoogleLogin = async () => {
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: { redirectTo: `${window.location.origin}/chat` },
//     });
//     if (error) setError(error.message);
//   };

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

//   const handleSubmit = async (formData: FormData) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       await login(formData);
//       router.replace("/chat");
//     } catch (err) {
//       const message = err instanceof Error ? err.message : "Login failed.";
//       setError(message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Fixed header elements: 021 AI top-left and Home top-right */}
//       <header className="w-full relative">
//         {/* Transparent spacer to keep page flow */}
//         <div className="max-w-6xl mx-auto px-6 py-6" />

//         {/* 021 AI fixed top-left */}
//         <div className="absolute top-4 left-4 z-50">
//           <Link
//             href="/"
//             className="flex items-center gap-3 text-white/90 hover:text-white"
//           >
//             <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
//               <div className="w-4 h-4 bg-black rounded-full" />
//             </div>
//             <span className="font-semibold text-sm md:text-lg">021 AI</span>
//           </Link>
//         </div>

//         {/* Home fixed top-right */}
//         <div className="absolute top-4 right-4 z-50">
//           <Link
//             href="/"
//             className="text-sm md:text-base text-white/90 hover:text-white px-3 py-1 rounded-md"
//           >
//             Home
//           </Link>
//         </div>
//       </header>

//       {/* Main content: 60:40 split. Row fills viewport so centering works */}
//       <main className="w-full">
//         <div className="max-w-6xl mx-auto flex flex-col md:flex-row h-[calc(100vh-120px)]">
//           {/* LEFT - 60% */}
//           <section className="w-full md:w-3/5 flex items-start">
//             <div className="px-6 md:px-12 py-8 md:py-24 md:translate-y-12">
//               <h2 className="text-[28px] md:text-[64px] leading-tight font-extrabold tracking-tight mb-6 text-white">
//                 Your AI Co-founder
//               </h2>

//               <div className="flex items-start gap-5">
//                 <div className="mt-1">
//                   <div className="w-9 h-9 rounded-full bg-white inline-block" />
//                 </div>

//                 <div>
//                   <p className="text-gray-200 mb-4">Your AI assistant helps with:</p>

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
//                     Fast, private, and tailored to your needs — try logging in to
//                     access your workspace.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* RIGHT - 40% */}
//           <aside className="w-full md:w-2/5 flex items-center justify-center border-l border-white/6 h-full md:pr-12">
//             <motion.div
//               initial={{ opacity: 0, y: 10, scale: 0.995 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               transition={{ duration: 0.45, ease: "easeOut" }}
//               className="w-full max-w-md p-6 md:p-8"
//             >
//               <div className="space-y-6 bg-white/4 backdrop-blur-sm border border-white/8 rounded-2xl p-4 md:p-6">
//                 <div className="text-center">
//                   <h1 className="text-xl md:text-2xl font-bold mb-1 text-white">
//                     Welcome back
//                   </h1>
//                   <p className="text-gray-300 text-sm md:text-base">
//                     Log in to access your AI workspace.
//                   </p>
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

//                 <form action={handleSubmit} className="space-y-3">
//                   <div>
//                     <label className="sr-only" htmlFor="email">
//                       Email
//                     </label>
//                     <input
//                       id="email"
//                       name="email"
//                       type="email"
//                       autoComplete="email"
//                       required
//                       placeholder="Email"
//                       className="w-full bg-transparent border border-white/12 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
//                     />
//                   </div>

//                   <div>
//                     <label className="sr-only" htmlFor="password">
//                       Password
//                     </label>
//                     <input
//                       id="password"
//                       name="password"
//                       type="password"
//                       autoComplete="current-password"
//                       required
//                       placeholder="Password"
//                       className="w-full bg-transparent border border-white/12 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
//                     />
//                   </div>

//                   <div className="flex justify-end">
//                     <Link
//                       href="/forgot-password"
//                       className="text-sm text-gray-300 hover:underline"
//                     >
//                       Forgot password?
//                     </Link>
//                   </div>

//                   <motion.button
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full bg-white text-black font-medium py-3 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-60"
//                   >
//                     {isLoading ? "Signing in..." : "Log In"}
//                   </motion.button>
//                 </form>

//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleGoogleLogin}
//                   disabled={isLoading}
//                   className="w-full border border-white/12 text-white font-medium py-3 rounded-lg transition-all duration-200"
//                 >
//                   Continue with Google
//                 </motion.button>

//                 <p className="text-center text-gray-300 text-sm">
//                   New here?{" "}
//                   <Link href="/register" className="text-white underline">
//                     Create an account
//                   </Link>
//                 </p>
//               </div>
//             </motion.div>
//           </aside>
//         </div>
//       </main>
//     </div>
//   );
// }








// Added Partition



// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "../store/authStore";
// import { login } from "./action";
// import { motion } from "framer-motion";
// import { createClient } from "@/utils/supabase/client";
// import Link from "next/link";

// export default function LoginPage() {
//   const router = useRouter();
//   const supabase = createClient();
//   const { user, isAuthenticated, checkAuth } = useAuthStore();
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   // Typing animation (ref-driven, reliable)
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

//   useEffect(() => {
//     displayedRef.current = displayed;
//   }, [displayed]);

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

//   // Auth checks (unchanged)
//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   useEffect(() => {
//     if (isAuthenticated && user) {
//       router.replace("/");
//     }
//   }, [isAuthenticated, user, router]);

//   const handleGoogleLogin = async () => {
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: { redirectTo: `${window.location.origin}/chat` },
//     });
//     if (error) setError(error.message);
//   };

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

//   const handleSubmit = async (formData: FormData) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       await login(formData);
//       router.replace("/chat");
//     } catch (err) {
//       const message = err instanceof Error ? err.message : "Login failed.";
//       setError(message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Header */}
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

//       {/* 60:40 layout on md+, stacked on mobile (hero first, card second) */}
//       <main className="w-full min-h-[calc(100vh-120px)]">
//         {/* <div className="max-w-6xl mx-auto flex flex-col md:flex-row h-full"> */}
//         <div className="max-w-6xl mx-auto flex flex-col md:flex-row h-[calc(100vh-120px)]">

//           {/* Left: 60% */}
//           <section className="w-full md:w-3/5 flex items-center">
//             <div className="px-6 md:px-12 py-12 md:py-24">
//               <h2 className="text-[44px] md:text-[60px] leading-tight font-extrabold tracking-tight mb-6 text-white">
//                 Your AI Co-founder
//               </h2>

//               <div className="flex items-start gap-4">
//                 <div className="mt-2">
//                   <div className="" />
//                 </div>

//                 <div>
//                   <p className="text-gray-200 mb-4">Your AI assistant helps with:</p>

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
//                     Fast, private, and tailored to your needs — try logging in to
//                     access your workspace.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Right: 40% */}

//           {/* <aside className="w-full md:w-2/5 flex items-center justify-center border-l border-white/6 md:h-[calc(100vh-120px)]"> */}
//           <aside className="w-full md:w-2/5 flex items-center justify-center border-l border-white/6 md:translate-x-8">



//             <div className="w-full max-w-md p-8">
//               <div className="space-y-6 bg-white/3 backdrop-blur-sm border border-white/6 rounded-xl p-6">
//                 <div className="text-center">
//                   <h1 className="text-2xl font-bold mb-1 text-white">Welcome back</h1>
//                   <p className="text-gray-300">Log in to access your AI workspace.</p>
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

//                 <form action={handleSubmit} className="space-y-4">
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
//                       name="password"
//                       required
//                       placeholder="Password"
//                       className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
//                     />
//                   </div>

//                   <div className="flex justify-end">
//                     <Link href="/forgot-password" className="text-sm text-gray-300 hover:underline">
//                       Forgot password?
//                     </Link>
//                   </div>

//                   <motion.button
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full bg-white text-black font-medium py-3 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-60"
//                   >
//                     {isLoading ? "Signing in..." : "Log In"}
//                   </motion.button>
//                 </form>

//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleGoogleLogin}
//                   disabled={isLoading}
//                   className="w-full border border-white/10 text-white font-medium py-3 rounded-lg transition-all duration-200"
//                 >
//                   Continue with Google
//                 </motion.button>

//                 <p className="text-center text-gray-300">
//                   New here?{" "}
//                   <Link href="/register" className="text-white underline">
//                     Create an account
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






// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "../store/authStore";
// import { login } from "./action";
// import { motion } from "framer-motion";
// import { createClient } from "@/utils/supabase/client";
// import Link from "next/link";

// export default function LoginPage() {
//   const router = useRouter();
//   const supabase = createClient();
//   const { user, isAuthenticated, checkAuth } = useAuthStore();
//   const [error, setError] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);

//   // Typing animation (ref-driven, reliable)
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

//   // --vh fix for mobile browser chrome showing/hiding
//   useEffect(() => {
//     const setVh = () => {
//       const vh = window.innerHeight * 0.01;
//       document.documentElement.style.setProperty("--vh", `${vh}px`);
//       // optional: keep document background consistent
//       // document.documentElement.style.backgroundColor = "black";
//     };
//     setVh();
//     window.addEventListener("resize", setVh);
//     return () => window.removeEventListener("resize", setVh);
//   }, []);

//   useEffect(() => {
//     displayedRef.current = displayed;
//   }, [displayed]);

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

//   // Auth checks (unchanged)
//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   useEffect(() => {
//     if (isAuthenticated && user) {
//       router.replace("/");
//     }
//   }, [isAuthenticated, user, router]);

//   const handleGoogleLogin = async () => {
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//       options: { redirectTo: `${window.location.origin}/chat` },
//     });
//     if (error) setError(error.message);
//   };

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

//   const handleSubmit = async (formData: FormData) => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       await login(formData);
//       router.replace("/chat");
//     } catch (err) {
//       const message = err instanceof Error ? err.message : "Login failed.";
//       setError(message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black text-white">
//       {/* Header */}
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

//       {/* Use runtime --vh variable to avoid 100vh issues on mobile */}
//       <main className="w-full" style={{ minHeight: "calc(var(--vh, 1vh) * 100 - 120px)" }}>
//         <div className="max-w-6xl mx-auto flex flex-col md:flex-row" style={{ minHeight: "calc(var(--vh, 1vh) * 100 - 120px)" }}>

//           {/* Left: 60% */}
//           <section className="w-full md:w-3/5 flex items-center">
//             <div className="px-6 md:px-12 py-12 md:py-24">
//               <h2 className="text-[44px] md:text-[60px] leading-tight font-extrabold tracking-tight mb-6 text-white">
//                 Your AI Co-founder
//               </h2>

//               <div className="flex items-start gap-4">
//                 <div className="mt-2">
//                   <div className="" />
//                 </div>

//                 <div>
//                   <p className="text-gray-200 mb-4">Your AI assistant helps with:</p>

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
//                     Fast, private, and tailored to your needs — try logging in to
//                     access your workspace.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Right: 40% */}
//           <aside className="w-full md:w-2/5 flex items-center justify-center border-l border-white/6 md:translate-x-8">
//             <div className="w-full max-w-md p-8">
//               <div className="space-y-6 bg-white/3 backdrop-blur-sm border border-white/6 rounded-xl p-6">
//                 <div className="text-center">
//                   <h1 className="text-2xl font-bold mb-1 text-white">Welcome back</h1>
//                   <p className="text-gray-300">Log in to access your AI workspace.</p>
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

//                 {/* Use onSubmit to build FormData and call handleSubmit */}
//                 <form
//                   onSubmit={(e) => {
//                     e.preventDefault();
//                     const fd = new FormData(e.currentTarget as HTMLFormElement);
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
//                       name="password"
//                       required
//                       placeholder="Password"
//                       className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
//                     />
//                   </div>

//                   <div className="flex justify-end">
//                     <Link href="/forgot-password" className="text-sm text-gray-300 hover:underline">
//                       Forgot password?
//                     </Link>
//                   </div>

//                   <motion.button
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full bg-white text-black font-medium py-3 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-60"
//                   >
//                     {isLoading ? "Signing in..." : "Log In"}
//                   </motion.button>
//                 </form>

//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={handleGoogleLogin}
//                   disabled={isLoading}
//                   className="w-full border border-white/10 text-white font-medium py-3 rounded-lg transition-all duration-200"
//                 >
//                   Continue with Google
//                 </motion.button>

//                 <p className="text-center text-gray-300">
//                   New here?{" "}
//                   <Link href="/register" className="text-white underline">
//                     Create an account
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





//Fixed mobile Alignments






"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { login } from "./action";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { getURL } from "@/utils/utils";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Typing animation lines (these will display on both mobile & desktop;
  // on mobile we show only the animated line, not the label or extra paragraph)
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

  // --vh fix for mobile browser chrome showing/hiding
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

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
    const redirectUrl = `${getURL()}auth/callback`;
    console.log("🔗 Google Login Redirect URL:", redirectUrl);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl },
    });
    if (error) setError(error.message);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/60 mx-auto mb-4" />
          <p className="text-gray-400">Checking authentication...</p>
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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="w-full px-6 py-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-full" />
            </div> */}
            <img
              src="/021logo.jpeg"
              alt="021 AI Logo"
              className="w-9 h-9 object-contain"
            />
            <span className="font-semibold text-lg">021 AI</span>
          </div>

          {/* Home nav: now visible on mobile (compact) and desktop */}
          <nav className="flex gap-4">
            <Link href="/" className="text-sm md:text-base text-gray-300 hover:text-white">
              Home
            </Link>
          </nav>
        </div>
      </header>

      {/* Main: uses runtime --vh to avoid 100vh issues on mobile */}
      <main className="w-full" style={{ minHeight: "calc(var(--vh, 1vh) * 100 - 120px)" }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between" style={{ minHeight: "calc(var(--vh, 1vh) * 100 - 120px)" }}>
          {/* Left hero */}
          <section
            className="
    w-full md:w-3/5
    flex 
    items-center md:items-center       /* vertical centering */
    justify-center md:justify-start    /* center on mobile, left on desktop */
    text-center md:text-left           /* center text on mobile, left on desktop */
  "
          >
            <div className="w-full max-w-sm md:max-w-none px-4 md:px-12 py-4 md:py-24">

              {/* Heading: single-line on mobile, reduced size on mobile; desktop unchanged */}
              <h2
                className="text-2xl md:text-[60px] font-extrabold tracking-tight mb-3 md:mb-6 text-white whitespace-nowrap overflow-hidden"
                style={{ lineHeight: 1 }}
                title="Your AI Co-founder"
              >
                Your AI Co-founder
              </h2>

              {/* On desktop: show label + example rotating line + paragraph */}
              <div className="hidden md:block">
                <p className="text-sm md:text-base text-gray-200 mb-4">Your AI assistant helps with:</p>

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
                  Fast, private, and tailored to your needs — try logging in to access your workspace.
                </p>
              </div>

              {/* On mobile: hide the label and paragraph, but show the rotating example line */}
              <div className="block md:hidden mt-2">
                <div className="h-6">
                  <span className="text-base font-medium text-white break-words">{displayed}</span>
                  <span
                    className={`inline-block ml-1 align-middle ${cursorVisible ? "opacity-100" : "opacity-0"}`}
                    style={{ transition: "opacity 150ms" }}
                  >
                    <span className="bg-white inline-block w-[2px] h-5 align-middle" />
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Right: the welcome card. Should be fully visible on mobile */}
          <aside className="w-full md:w-2/5 flex items-center justify-center border-l border-white/6 md:translate-x-8">
            <div className="w-full max-w-md p-6 md:p-8">
              <div className="space-y-6 bg-white/3 backdrop-blur-sm border border-white/6 rounded-xl p-5 md:p-6">
                <div className="text-center">
                  <h1 className="text-xl md:text-2xl font-bold mb-1 md:mb-1 text-white">Welcome back</h1>
                  <p className="text-sm md:text-gray-300 text-gray-300">Log in to access your AI workspace.</p>
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
                      name="password"
                      required
                      placeholder="Password"
                      className="w-full bg-transparent border border-white/10 rounded-lg p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Link href="/forgot-password" className="text-sm text-gray-300 hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-black font-medium py-3 rounded-lg transition-all duration-200 shadow-sm disabled:opacity-60"
                  >
                    {isLoading ? "Signing in..." : "Log In"}
                  </motion.button>
                </form>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full border border-white/10 text-white font-medium py-3 rounded-lg transition-all duration-200"
                >
                  Continue with Google
                </motion.button>

                <p className="text-center text-gray-300 text-sm">
                  New here?{" "}
                  <Link href="/register" className="text-white underline">
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
