// "use client";

// import { useState, useRef, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "../store/authStore";
// import { useChatStore } from "../store/chatStore";
// // Removed ReportCard and ProgressBar from main chat
// import CSuiteAdvisorCard from "../../components/ui/c-suite-card";
// import CEOImage from "../../public/ceo-1.png";
// import CFOImage from "../../public/cfo-1.png";
// import CMOImage from "../../public/cmo-1.png";
// import CTOImage from "../../public/cto-1.png";
// // import { cRoles } from "../../roles/roles.types";
// // import type { CRole } from "../../roles/chat.types";
// import {
//   Trash,
//   Send,
//   Plus,
//   MessageSquare,
//   Lightbulb,
//   ArrowLeftToLine,
//   ArrowRightToLine,
//   UserRound,
//   LogOut,
// } from "lucide-react";
// import Image from "next/image";
// import profile from "../../public/ceo-1.png";
// import proBg from "../../public/proBg.png";
// import AIResponseRenderer from "../../components/ui/AIResponseRenderer";
// // AIRenderer was removed (not used) to avoid unused-import warning
// import { useToast } from "../../components/ui/Toast";

// type ProviderRole = "user" | "assistant" | "system";
// interface ProviderMessage {
//   role: ProviderRole;
//   content: string;
//   roleContext?: string; // which persona generated/asked the message
// }
// interface AIChatRequest {
//   messages: ProviderMessage[];
//   activeRole: string;
//   sessionId?: string;
//   userId?: string;
// }
// interface AIChatResponse {
//   content: string;
//   provider: string;
//   confidence: number;
//   userMessageId?: string;
// }

// interface Message {
//   _id?: string;
//   role: "user" | "ai" | "assistant" | "system";
//   content: string;
//   timestamp?: Date;
//   activeRole?: string;
// }

// interface AITitleResponse {
//   title: string;
// }

// function normalizeForProvider(
//   msgs: Array<Message | ProviderMessage>
// ): ProviderMessage[] {
//   const ALLOWED: ProviderRole[] = ["user", "assistant", "system"];
//   return msgs
//     .map((m) => {
//       const role: ProviderRole = ALLOWED.includes(m.role as ProviderRole)
//         ? (m.role as ProviderRole)
//         : "user";
//       const content =
//         (m as Message).content ?? (m as ProviderMessage).content ?? "";
//       const roleContext =
//         (m as Message).activeRole ??
//         (m as ProviderMessage).roleContext ??
//         undefined;

//       return {
//         role, // we still send 'system' here; provider will remap to 'user'
//         content: typeof content === "string" ? content : String(content ?? ""),
//         roleContext,
//       } as ProviderMessage;
//     })
//     .filter((m) => m.content.trim().length > 0);
// }

// export default function ChatPage() {
//   const router = useRouter();
//   const { toast } = useToast();
//   const [inputValue, setInputValue] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [sidebarOpenLeft, setSidebarOpenLeft] = useState(true);
//   const [sidebarOpenRight, setSidebarOpenRight] = useState(true);
//   // isMobileView removed because it was unused; resize handler still controls sidebars
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const [proUser] = useState(false);
//   const [activeRole, setActiveRole] = useState("Idea Validator");
//   // progress score removed from main chat state
//   const [localMessages, setLocalMessages] = useState<Message[]>([]); // Add local messages state
//   const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
//     null
//   ); // Track which session is being deleted

//   // C-Suite Advisor States
//   const [activeAdvisor, setActiveAdvisor] = useState<string | null>(null);
//   // replyingAdvisor setter not used; keep a simple readonly value for comparisons
//   const replyingAdvisor: string | null = null;
//   const [thinkingAdvisor, setThinkingAdvisor] = useState<string | null>(null);
//   const [clickedAdvisors, setClickedAdvisors] = useState<Set<string>>(
//     new Set()
//   );
//   const advisorColors: Record<string, string> = {
//     ceo: "blue",
//     cfo: "green",
//     cto: "purple",
//     cmo: "pink",
//   };

//   // Function to get advisor color from role name
//   const getAdvisorColor = (roleName: string): string => {
//     return advisorColors[roleName.toLowerCase()] || "gray";
//   };

//   // Function to get hex color for advisor
//   const getAdvisorHexColor = (roleName: string): string => {
//     const colorMap: Record<string, string> = {
//       blue: "#3b82f6",
//       green: "#22c55e",
//       purple: "#8b5cf6",
//       pink: "#ec4899",
//       gray: "#6b7280",
//     };
//     const colorKey = getAdvisorColor(roleName);
//     return colorMap[colorKey] || colorMap.gray;
//   };

//   // getThemeColors removed because it wasn't referenced; keep advisor color helpers above

//   // Advisor color mapping

//   // Use auth store
//   const { user, checkAuth } = useAuthStore();

//   // Use chat store
//   const {
//     chatSessions,
//     currentSessionId,
//     messages,
//     isLoading,
//     error,
//     loadChatSessions,
//     createNewChatSession,
//     selectChatSession,
//     addMessage,
//     deleteChatSession,
//     updateSessionTopic,
//     clearError,
//     // removed progress score from store usage
//   } = useChatStore();

//   // Sync local messages with store messages when they change
//   useEffect(() => {
//     setLocalMessages(messages);
//   }, [messages]);

//   // Handle mobile view

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth < 768;

//       if (mobile) {
//         // Mobile: both sidebars closed
//         setSidebarOpenLeft(false);
//         setSidebarOpenRight(false);
//       } else {
//         // Desktop: both sidebars open
//         setSidebarOpenLeft(true);
//         setSidebarOpenRight(true);
//       }
//     };

//     // Run once on mount
//     handleResize();

//     // Listen for resize events
//     window.addEventListener("resize", handleResize);

//     // Cleanup
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // Use localMessages for rendering instead of messages from store
//   const displayMessages = localMessages;

//   const currentSession = chatSessions.find(
//     (session) => session._id === currentSessionId
//   );

//   const createNewChat = useCallback(
//     async (isAutoCreate = false) => {
//       // Skip pro user check for auto-creation
//       if (!isAutoCreate && proUser) {
//         router.push("/pricing");
//         return;
//       }

//       if (!user?.id) {
//         console.error("No user ID available");
//         return;
//       }

//       try {
//         const initialMessage =
//           "Hello! I'm your 021 AI. How can I help you today?";
//         await createNewChatSession(user.id, "New Chat", initialMessage);

//         // If this is auto-creation, also set the initial message in local state
//         if (isAutoCreate) {
//           const welcomeMessage: Message = {
//             _id: Date.now().toString() + "_welcome",
//             role: "ai",
//             content: initialMessage,
//             timestamp: new Date(),
//             activeRole: "Idea Validator",
//           };
//           setLocalMessages([welcomeMessage]);
//           setActiveRole("Idea Validator");
//           setActiveAdvisor(null);
//           setClickedAdvisors(new Set());
//         }
//       } catch (error) {
//         console.error("Failed to create new chat:", error);
//         toast({
//           variant: "error",
//           title: "Could not create chat",
//           description: "Please try again in a moment.",
//         });
//       }
//     },
//     [proUser, router, user?.id, createNewChatSession, toast]
//   );

//   // Wrapper function for button click handler
//   const handleCreateNewChat = useCallback(() => {
//     createNewChat(false);
//   }, [createNewChat]);

//   const handleLogout = useCallback(async () => {
//     try {
//       await fetch("/logout", { method: "GET" });
//       // The auth store will be updated by the logout route
//       window.location.href = "/login";
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   }, []);

//   const handleNavigateToPricing = useCallback(() => {
//     router.push("/pricing");
//   }, [router]);

//   // report navigation removed from main chat

//   // const handleToggleSidebar = useCallback(() => {
//   //   setSidebarOpen((prev) => !prev);
//   // }, []);

//   const handleCloseSidebarleft = useCallback(() => {
//     setSidebarOpenLeft(false);
//   }, []);
//   const handleOpenSidebarleft = useCallback(() => {
//     setSidebarOpenLeft(true);
//   }, []);
//   const handleCloseSidebarright = useCallback(() => {
//     setSidebarOpenRight(false);
//   }, []);
//   const handleOpenSidebarright = useCallback(() => {
//     setSidebarOpenRight(true);
//   }, []);

//   // const handleToggleAdvisorPanel = useCallback(() => {
//   //   setSidebarOpen(prev => !prev);
//   // }, []);

//   // const handleRoleChange = useCallback((role: { name: string }) => {
//   //   setActiveRole(role.name);
//   // }, []);

//   // C-Suite Advisor handlers - replacing FloatingNav functionality
//   const handleAdvisorClick = useCallback(
//     (advisorKey: string, advisorName: string) => {
//       if (replyingAdvisor === advisorKey || thinkingAdvisor === advisorKey)
//         return;

//       setActiveAdvisor(advisorKey);
//       setActiveRole(advisorName);
//       setClickedAdvisors((prev) => new Set([...prev, advisorKey]));
//     },
//     [replyingAdvisor, thinkingAdvisor]
//   );

//   // Handle role change from C-Suite cards (replacing FloatingNav)
//   // const handleRoleChange = useCallback((role: CRole) => {
//   //   setActiveRole(role.name);
//   //   setActiveAdvisor(role.id);
//   // }, []);

//   const handleSelectChatSession = useCallback(
//     async (sessionId: string) => {
//       try {
//         await selectChatSession(sessionId);

//         // Restore active role from session messages
//         const session = chatSessions.find((s) => s._id === sessionId);
//         if (session) {
//           // Find the last message with an activeRole to restore the advisor state
//           const lastMessageWithRole = localMessages
//             .filter(
//               (msg) => msg.activeRole && msg.activeRole !== "Idea Validator"
//             )
//             .pop();

//           if (lastMessageWithRole?.activeRole) {
//             setActiveRole(lastMessageWithRole.activeRole);

//             // Map role name back to advisor key
//             const roleToAdvisorMap: { [key: string]: string } = {
//               CEO: "ceo",
//               CFO: "cfo",
//               CTO: "cto",
//               CMO: "cmo",
//             };

//             const advisorKey = roleToAdvisorMap[lastMessageWithRole.activeRole];
//             if (advisorKey) {
//               setActiveAdvisor(advisorKey);
//               setClickedAdvisors((prev) => new Set([...prev, advisorKey]));
//             }
//           } else {
//             setActiveRole("Idea Validator");
//             setActiveAdvisor(null);
//           }
//         }
//       } catch (error) {
//         console.error("Failed to select chat session:", error);
//         toast({
//           variant: "error",
//           title: "Could not load chat",
//           description: "Please try again.",
//         });
//       }
//     },
//     [selectChatSession, chatSessions, localMessages, toast]
//   );

//   const dynamicTitle = useCallback(
//     async (messages: Message): Promise<string> => {
//       const userMsg = messages.content;
//       try {
//         const response = await fetch("/api/ai-title", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ userMsg }),
//         });
//         const data: AITitleResponse = await response.json();
//         return data.title;
//       } catch (error) {
//         console.error("error in dynamicTitle", error);
//         return "Error generating title";
//       }
//     },
//     []
//   );

//   const handleSendMessage = useCallback(async () => {
//     if (!inputValue.trim() || isTyping || !currentSessionId || !user?.id)
//       return;

//     // Prepare the user message
//     const userMessage: Message = {
//       _id: Date.now().toString(),
//       role: "user",
//       content: inputValue.trim(),
//       timestamp: new Date(),
//       activeRole: activeRole,
//     };

//     // Add user message to local state immediately
//     const newMessages = [...localMessages, userMessage];

//     // Compute messages for request *now* to avoid stale state after setState
//     const requestMessagesBase: Message[] = newMessages;

//     // Update session topic if it's still "New Chat"
//     if (currentSession?.topic === "New Chat") {
//       try {
//         const title = (await dynamicTitle(userMessage)) || "new chat";
//         await updateSessionTopic(currentSessionId, title);
//       } catch (error) {
//         console.error("Failed to update session topic:", error);
//       }
//     }

//     // Add user message to store (this will save to database)
//     try {
//       await addMessage(inputValue.trim(), "user", currentSessionId);
//     } catch (error) {
//       console.error("Failed to save user message:", error);
//     }

//     // Update local state immediately to show user message
//     setLocalMessages(newMessages);

//     setInputValue("");
//     setIsTyping(true); // ✅ show typing immediately

//     // Set thinking state for active advisor
//     if (activeAdvisor) {
//       setThinkingAdvisor(activeAdvisor);
//     }

//     // Build safe API payload
//     const requestBody: AIChatRequest = {
//       activeRole: activeRole,
//       messages: normalizeForProvider(requestMessagesBase).map((m) => ({
//         // Providers will treat 'system' as 'user' internally when needed
//         role: m.role,
//         content: m.content,
//         roleContext: m.roleContext,
//       })),
//       sessionId: currentSessionId,
//       userId: user.id,
//     };

//     try {
//       setIsTyping(true);

//       const response = await fetch("/api/ai-chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) throw new Error("Failed to connect to AI service");
//       if (!response.body) throw new Error("No response stream from AI");

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder("utf-8");
//       let finalText = "";

//       // 🪄 Add placeholder for streaming message
//       setLocalMessages((prev) => [
//         ...prev,
//         {
//           _id: Date.now().toString() + "_stream",
//           role: "ai",
//           content: "",
//           timestamp: new Date(),
//           activeRole,
//         },
//       ]);

//       // 🔄 Stream loop (plain text, not JSON)
//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;

//         const chunk = decoder.decode(value, { stream: true });
//         if (!chunk) continue;

//         finalText += chunk;

//         // 💬 Update message live as chunks arrive
//         setLocalMessages((prev) => {
//           const updated = [...prev];
//           updated[updated.length - 1].content = finalText;
//           return updated;
//         });

//         console.log("📦 [GEMINI STREAM] CHUNK RECEIVED:", chunk);
//       }

//       // ✅ Fallback in case no chunks received
//       if (!finalText.trim()) {
//         finalText = "⚠️ No response received from AI.";
//       }

//       // 🧩 Ensure last message has the full text
//       setLocalMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1].content = finalText;
//         return updated;
//       });

//       console.log("✅ Stream complete. Final text length:", finalText.length);
//     } catch (err) {
//       console.error("❌ Stream error:", err);
//       toast({
//         variant: "error",
//         title: "Message failed",
//         description: "AI service temporarily unavailable.",
//       });
//     } finally {
//       setIsTyping(false);
//     }
//   }, [
//     inputValue,
//     isTyping,
//     currentSessionId,
//     user?.id,
//     localMessages,
//     currentSession?.topic,
//     activeRole,
//     activeAdvisor,
//     updateSessionTopic,
//     addMessage,
//     setLocalMessages,
//     setInputValue,
//     setIsTyping,
//     dynamicTitle,
//     toast,
//   ]);

//   const handleKeyDown = useCallback(
//     (e: React.KeyboardEvent) => {
//       if (e.key === "Enter" && !e.shiftKey) {
//         e.preventDefault();
//         handleSendMessage();
//       }
//     },
//     [handleSendMessage]
//   );

//   const handleDeleteChatSession = useCallback(
//     async (sessionId: string) => {
//       try {
//         // Don't allow deleting if it's the only session
//         if (chatSessions.length === 1) {
//           toast({
//             variant: "warning",
//             title: "Cannot delete",
//             description:
//               "You can't delete the last chat. Please create another chat first.",
//           });
//           return;
//         }

//         // Confirm deletion
//         const confirmed = window.confirm(
//           "Delete this chat session? This action cannot be undone."
//         );
//         if (!confirmed) return;

//         setDeletingSessionId(sessionId); // Set loading state
//         await deleteChatSession(sessionId);
//       } catch (error) {
//         console.error("Failed to delete chat session:", error);
//         toast({
//           variant: "error",
//           title: "Delete failed",
//           description: "We couldn't delete the chat. Please try again.",
//         });
//       } finally {
//         setDeletingSessionId(null); // Clear loading state
//       }
//     },
//     [chatSessions.length, deleteChatSession, toast]
//   );

//   // Optionally fetch user once for rendering; middleware handles protection
//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   // Check for incoming message from home page
//   useEffect(() => {
//     // Only run on client side
//     if (typeof window !== "undefined") {
//       const newChatMessage = sessionStorage.getItem("newChatMessage");
//       const shouldCreateNewChat =
//         sessionStorage.getItem("createNewChat") === "true";

//       if (newChatMessage) {
//         // Clear the messages from storage to prevent reuse
//         sessionStorage.removeItem("newChatMessage");
//         sessionStorage.removeItem("createNewChat");

//         // Generate a title based on the user's message
//         const generateTitle = async () => {
//           try {
//             if (shouldCreateNewChat && user?.id) {
//               // Create a message object for title generation
//               const userMessage: Message = {
//                 _id: Date.now().toString(),
//                 role: "user",
//                 content: newChatMessage.trim(),
//                 timestamp: new Date(),
//                 activeRole: activeRole,
//               };

//               // Generate a title using the dynamicTitle function
//               const title = await dynamicTitle(userMessage);

//               // Create a new chat with the generated title
//               const initialMessage =
//                 "Hello! I'm your 021 AI. How can I help you today?";
//               await createNewChatSession(user.id, title, initialMessage);

//               // Set the initial message in local state
//               const welcomeMessage: Message = {
//                 _id: Date.now().toString() + "_welcome",
//                 role: "ai",
//                 content: initialMessage,
//                 timestamp: new Date(),
//                 activeRole: activeRole,
//               };
//               setLocalMessages([welcomeMessage]);

//               // Store the message again temporarily for processing in the next cycle
//               sessionStorage.setItem("newChatMessage", newChatMessage);
//               return true;
//             }
//             return false;
//           } catch (error) {
//             console.error("Failed to generate title or create chat:", error);
//             // Fall back to the default createNewChat if title generation fails
//             if (shouldCreateNewChat && user?.id) {
//               createNewChat(true).then(() => {
//                 sessionStorage.setItem("newChatMessage", newChatMessage);
//               });
//               return true;
//             }
//             return false;
//           }
//         };

//         // If we should create a new chat, do that first with a generated title
//         if (shouldCreateNewChat && user?.id) {
//           generateTitle().then((created) => {
//             if (created) return;
//           });
//           return;
//         }

//         // If we have a user and a current session, send the message directly
//         if (user?.id && currentSessionId) {
//           // Prepare the user message
//           const userMessage: Message = {
//             _id: Date.now().toString(),
//             role: "user",
//             content: newChatMessage.trim(),
//             timestamp: new Date(),
//             activeRole: activeRole,
//           };

//           // Add user message to local state immediately
//           const newMessages = [...localMessages, userMessage];
//           setLocalMessages(newMessages);

//           // Add user message to store (this will save to database)
//           addMessage(newChatMessage.trim(), "user", currentSessionId).then(
//             () => {
//               // After adding the user message, send it to get AI response
//               // Build safe API payload
//               const requestBody: AIChatRequest = {
//                 messages: normalizeForProvider(newMessages).map((m) => ({
//                   role: m.role,
//                   content: m.content,
//                   roleContext: m.roleContext,
//                 })),
//                 activeRole,
//                 sessionId: currentSessionId,
//                 userId: user.id,
//               };

//               setIsTyping(true);

//               // Send the request to get AI response
//               fetch("/api/ai-chat", {
//                 method: "POST",
//                 headers: {
//                   "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(requestBody),
//               })
//                 .then(async (response) => {
//                   if (!response.ok) {
//                     throw new Error(
//                       `API error: ${response.status} ${response.statusText}`
//                     );
//                   }

//                   const contentType =
//                     response.headers.get("content-type") ?? "";

//                   if (contentType.includes("application/json")) {
//                     return (await response.json()) as AIChatResponse;
//                   }

//                   const text = await response.text();

//                   return {
//                     content: text || "",
//                     provider: "gemini-stream",
//                     confidence: 0,
//                   } satisfies AIChatResponse;
//                 })
//                 .then((data: AIChatResponse) => {
//                   // Add AI response to local state
//                   const aiMessage: Message = {
//                     _id: Date.now().toString() + "_ai",
//                     role: "ai",
//                     content: data.content,
//                     timestamp: new Date(),
//                     activeRole: activeRole,
//                   };

//                   setLocalMessages((prev) => [...prev, aiMessage]);
//                 })
//                 .catch((error) => {
//                   console.error("error in chat: ", error);

//                   let errorMessage = "Unexpected error occurred.";

//                   if (
//                     error instanceof TypeError &&
//                     String(error.message || "").includes("fetch")
//                   ) {
//                     errorMessage =
//                       "Network error. Please check your connection and try again.";
//                   } else if (
//                     error instanceof Error &&
//                     String(error.message || "").includes("API error")
//                   ) {
//                     errorMessage =
//                       "AI service is temporarily unavailable. Please try again later.";
//                   } else if (error instanceof Error && error.message) {
//                     errorMessage = `Unexpected error: ${error.message}`;
//                   } else {
//                     errorMessage = `Unexpected error: ${String(error)}`;
//                   }

//                   // Save error message to database
//                   addMessage(errorMessage, "ai", currentSessionId);

//                   // Add error message to local state
//                   const errorMsg: Message = {
//                     _id: Date.now().toString() + "_error",
//                     role: "ai",
//                     content: errorMessage,
//                     timestamp: new Date(),
//                     activeRole: activeRole,
//                   };

//                   setLocalMessages((prev) => [...prev, errorMsg]);
//                   toast({
//                     variant: "error",
//                     title: "Message failed",
//                     description: errorMessage,
//                   });
//                 })
//                 .finally(() => {
//                   setIsTyping(false);
//                 });
//             }
//           );
//         } else if (user?.id) {
//           // If we have a user but no session, create a new one and then send the message
//           // Store the message temporarily
//           const tempMessage = newChatMessage;
//           // Create a new chat first
//           createNewChat(true).then(() => {
//             // Wait a bit for the session to be created and selected
//             setTimeout(() => {
//               // Prepare the user message
//               const userMessage: Message = {
//                 _id: Date.now().toString(),
//                 role: "user",
//                 content: tempMessage.trim(),
//                 timestamp: new Date(),
//                 activeRole: activeRole,
//               };

//               // Add user message to local state immediately
//               const newMessages = [...localMessages, userMessage];
//               setLocalMessages(newMessages);

//               // Add user message to store and handle AI response
//               if (currentSessionId) {
//                 addMessage(tempMessage.trim(), "user", currentSessionId).then(
//                   () => {
//                     // After adding the user message, send it to get AI response
//                     // Build safe API payload
//                     const requestBody: AIChatRequest = {
//                       messages: normalizeForProvider(newMessages).map((m) => ({
//                         role: m.role,
//                         content: m.content,
//                         roleContext: m.roleContext,
//                       })),
//                       activeRole,
//                       sessionId: currentSessionId,
//                       userId: user.id,
//                     };

//                     setIsTyping(true);

//                     // Send the request to get AI response
//                     fetch("/api/ai-chat", {
//                       method: "POST",
//                       headers: {
//                         "Content-Type": "application/json",
//                       },
//                       body: JSON.stringify(requestBody),
//                     })
//                       .then((response) => response.json())
//                       .then((data: AIChatResponse) => {
//                         // Add AI response to local state
//                         const aiMessage: Message = {
//                           _id: Date.now().toString() + "_ai",
//                           role: "ai",
//                           content: data.content,
//                           timestamp: new Date(),
//                           activeRole: activeRole,
//                         };

//                         setLocalMessages((prev) => [...prev, aiMessage]);
//                       })
//                       .catch((error) => {
//                         console.error("error in chat: ", error);
//                         // Error handling similar to above
//                         const errorMessage = "Unexpected error occurred.";
//                         // Add error message to local state
//                         const errorMsg: Message = {
//                           _id: Date.now().toString() + "_error",
//                           role: "ai",
//                           content: errorMessage,
//                           timestamp: new Date(),
//                           activeRole: activeRole,
//                         };

//                         setLocalMessages((prev) => [...prev, errorMsg]);
//                       })
//                       .finally(() => {
//                         setIsTyping(false);
//                       });
//                   }
//                 );
//               }
//             }, 1000);
//           });
//         }
//       }
//     }
//   }, [
//     user?.id,
//     currentSessionId,
//     createNewChat,
//     localMessages,
//     activeRole,
//     createNewChatSession,
//     dynamicTitle,
//     addMessage,
//     setLocalMessages,
//     setIsTyping,
//     toast,
//   ]);

//   // Load chat sessions when user is available
//   const hasLoadedRef = useRef(false);
//   useEffect(() => {
//     if (!hasLoadedRef.current && user?.id) {
//       hasLoadedRef.current = true;
//       loadChatSessions(user.id);
//     }
//   }, [user?.id, loadChatSessions]);

//   // Select the most recent session if available (no auto-creation)
//   const didAutoActionRef = useRef(false);
//   useEffect(() => {
//     if (didAutoActionRef.current) return;
//     if (!user?.id || isLoading) return;
//     if (!hasLoadedRef.current) return; // ensure sessions have been fetched at least once

//     if (!currentSessionId && chatSessions.length > 0) {
//       didAutoActionRef.current = true;
//       const mostRecentSession = chatSessions[0];
//       handleSelectChatSession(mostRecentSession._id!);
//     }
//   }, [
//     user?.id,
//     chatSessions,
//     isLoading,
//     currentSessionId,
//     handleSelectChatSession,
//   ]);

//   // Clear the auto-create guard once sessions exist
//   useEffect(() => {
//     if (!user?.id) return;
//     if (chatSessions.length > 0) {
//       const key = `auto-create-${user.id}`;
//       if (typeof window !== "undefined") sessionStorage.removeItem(key);
//     }
//   }, [user?.id, chatSessions.length]);

//   // Handle session selection when currentSessionId changes
//   useEffect(() => {
//     if (currentSessionId && localMessages.length === 0 && !isLoading) {
//       // If we have a current session but no messages, we might need to load them
//       // This handles the case when a session is selected after deletion
//       const currentSession = chatSessions.find(
//         (s) => s._id === currentSessionId
//       );
//       if (currentSession) {
//         // The messages will be loaded by the store when selectChatSession is called
//         // This is just a safety check
//       }
//     }
//   }, [currentSessionId, localMessages.length, isLoading, chatSessions]);

//   // removed progress score syncing

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [localMessages]); // Changed from messages to localMessages

//   // Show error if any
//   useEffect(() => {
//     if (error) {
//       console.error("Chat store error:", error);
//       toast({ variant: "error", title: "Error", description: String(error) });
//       setTimeout(() => clearError(), 5000); // Auto-clear after 5 seconds
//     }
//   }, [error, clearError, toast]);

//   // Render immediately; middleware prevents unauth access

//   return (
//     <div className="flex h-screen bg-[#0A0A0A] text-white">
//       {/* Sidebar */}
//       <div
//         className={`${
//           sidebarOpenLeft ? "w-60" : "w-0"
//         } bg-[#171717] border-r border-white/10 transition-all duration-300 overflow-hidden flex flex-col h-full`}>
//         {/* 1. Header Container */}
//         <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
//           <h2 className="text-xl font-bold font-mono">021 AI</h2>
//           <button onClick={handleCloseSidebarleft} className="">
//             <ArrowLeftToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
//           </button>
//         </div>

//         {/* 2. New Chat Button Container */}
//         <div className="flex justify-center p-4 shrink-0">
//           <button
//             onClick={handleCreateNewChat}
//             disabled={isLoading}
//             className="group relative w-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg 
//          bg-white/5 border border-white/10 
//          hover:bg-white/10 hover:border-white/20 
//          transition-all duration-300 ease-out
//          shadow-lg shadow-black/20
//          before:absolute before:inset-0 before:rounded-lg 
//          before:bg-linear-to-r before:from-white/10 before:via-transparent before:to-white/10 
//          before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
//          after:absolute after:inset-0 after:rounded-lg 
//          after:bg-linear-to-t after:from-transparent after:via-white/5 after:to-white/10
//          after:pointer-events-none
//          disabled:opacity-50 disabled:cursor-not-allowed">
//             <Plus className="h-5 w-5 -mr-1.5 relative z-10 group-hover:scale-110 transition-transform duration-200" />
//             <span className="relative z-10">
//               {isLoading ? "Creating..." : "New Chat"}
//             </span>
//             <div className="absolute inset-0 rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
//           </button>
//         </div>

//         {/* 3. Chat Session Container */}
//         <div className="shrink-0 h-112 overflow-hidden">
//           <div className="p-3 h-full">
//             <div className="h-full overflow-y-auto space-y-2 custom-scrollbar">
//               {isLoading && chatSessions.length === 0 ? (
//                 <div className="text-center text-white/40 text-sm py-4">
//                   Loading chats...
//                 </div>
//               ) : chatSessions.length === 0 ? (
//                 <div className="text-center text-white/40 text-sm py-4">
//                   No chats yet
//                 </div>
//               ) : (
//                 chatSessions.map((session) => (
//                   <div
//                     key={session._id}
//                     onClick={() => handleSelectChatSession(session._id!)}
//                     className={`group relative w-full text-left rounded-lg transition-all duration-200 ease-out overflow-hidden
//     ${
//       currentSessionId === session._id
//         ? `bg-[#2A2A2A] border border-white/15 shadow-lg shadow-black/10
//            before:absolute before:inset-0 before:rounded-lg before:bg-linear-to-r 
//            before:from-white/5 before:via-white/0 before:to-white/5 before:pointer-events-none
//            after:absolute after:inset-px after:rounded-lg after:bg-linear-to-b 
//            after:from-white/5 after:to-transparent after:pointer-events-none`
//         : `bg-white/0 border border-transparent
//            hover:bg-white/5 hover:border-white/10
//            hover:before:opacity-100 before:absolute before:inset-0 before:rounded-lg 
//            before:bg-linear-to-r before:from-transparent before:via-white/5 before:to-transparent
//            before:opacity-0 before:transition-opacity before:duration-200 before:pointer-events-none`
//     }`}
//                     role="button"
//                     tabIndex={0}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter")
//                         handleSelectChatSession(session._id!);
//                     }}>
//                     <div className="relative z-10 p-3">
//                       <div className="flex items-center gap-3">
//                         <div className="relative shrink-0">
//                           <MessageSquare className="h-4 w-4 text-white/40 group-hover:text-white/60 transition-colors duration-200" />
//                           {currentSessionId === session._id && (
//                             <div className="absolute inset-0 bg-white/10 rounded-full blur-sm -z-10"></div>
//                           )}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div
//                             className={`font-medium text-xs transition-colors duration-200 truncate ${
//                               currentSessionId === session._id
//                                 ? "text-white"
//                                 : "text-white/70 group-hover:text-white/90"
//                             }`}>
//                             {session.topic}
//                           </div>
//                         </div>
//                         {currentSessionId === session._id && (
//                           <div
//                             className="shrink-0 w-1.5 h-1.5 bg-white/60 rounded-full duration-200 
//                group-hover:-translate-x-1.5"></div>
//                         )}

//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleDeleteChatSession(session._id!);
//                           }}
//                           disabled={deletingSessionId === session._id}
//                           className="hidden group-hover:flex items-center justify-center p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
//                           aria-label="Delete chat session">
//                           {deletingSessionId === session._id ? (
//                             <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
//                           ) : (
//                             <Trash className="h-4 w-4 text-white/50 hover:text-red-400" />
//                           )}
//                         </button>
//                       </div>
//                     </div>

//                     {currentSessionId === session._id && (
//                       <div className="absolute inset-0 rounded-lg border border-white/10 pointer-events-none"></div>
//                     )}
//                     <div className="absolute inset-0 rounded-lg border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>

//         {/* 4. Report Container */}

//         {/* 5. Switch to Pro Button */}
//         <div className="shrink-0 p-3">
//           <button
//             onClick={handleNavigateToPricing}
//             className="group relative w-full h-12 overflow-hidden rounded-2xl backdrop-blur-xl border border-purple-400/4 hover:border-purple-300/60 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] transition-all duration-300 ease-out shadow-lg shadow-purple-500/15 hover:shadow-purple-400/25 before:absolute before:inset-0 before:rounded-2xl before:bg-linear-to-r before:from-transparent before:via-white/15 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-px after:rounded-2xl after:bg-linear-to-b after:from-white/10 after:to-transparent after:pointer-events-none">
//             <div className="absolute inset-0 rounded-2xl overflow-hidden">
//               <Image
//                 src={proBg}
//                 alt="Premium background"
//                 fill
//                 className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
//               />
//               <div className="absolute inset-0 bg-linear-to-r from-purple-600/30 via-indigo-500/20 to-purple-800/30 group-hover:from-purple-500/40 group-hover:via-indigo-400/30 group-hover:to-purple-700/40 transition-all duration-300 z-10"></div>
//             </div>
//             <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-in-out z-20"></div>
//             <div className="relative z-30 flex items-center justify-center gap-2">
//               <svg
//                 className="h-5 w-5 text-purple-200 group-hover:text-white group-hover:rotate-12 group-hover:scale-110 transition-all duration-300"
//                 fill="currentColor"
//                 viewBox="0 0 24 24">
//                 <path d="M5 16L3 6l5.5 4L12 4l3.5 6L21 6l-2 10H5zm2.7-2h8.6l.9-4.4L14 12l-2-4-2 4-3.2-2.4L7.7 14z" />
//               </svg>
//               <span className="font-bold text-sm tracking-wide bg-linear-to-r from-purple-100 to-indigo-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-purple-100 transition-all duration-300 font-serif drop-shadow-sm">
//                 SWITCH TO PRO
//               </span>
//               <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-300"></div>
//               <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-indigo-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-500"></div>
//             </div>
//             <div className="absolute inset-0 rounded-2xl border border-purple-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
//             <div className="absolute inset-1 rounded-2xl bg-linear-to-t from-purple-400/10 to-indigo-200/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
//           </button>
//         </div>

//         {/* 6. Profile + Logout */}
//         <div className="shrink-0 p-3">
//           <div className="flex gap-2">
//             <div className="flex-1 flex items-center gap-2 h-14 bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2 hover:bg-[#303030] hover:border-white/15 transition-all duration-300 shadow-lg shadow-black/10 relative overflow-hidden before:absolute before:inset-0 before:rounded-lg before:bg-linear-to-r before:from-white/5 before:via-transparent before:to-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 after:absolute after:inset-px after:rounded-lg after:bg-linear-to-b after:from-white/5 after:to-transparent after:pointer-events-none">
//               <div className="relative shrink-0">
//                 <div className="absolute inset-0 rounded-full bg-white/10 blur-sm"></div>
//                 <Image
//                   className="h-9 w-9 rounded-full relative z-10 border border-white/20"
//                   src={profile}
//                   alt="profile"
//                 />
//                 <div className="absolute inset-0 rounded-full border border-white/20 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
//               </div>
//               <div className="flex-1 min-w-0 relative z-10">
//                 <p className="text-white text-xs font-medium leading-tight">
//                   {user?.email
//                     ? (() => {
//                         const namePart = user.email.split("@")[0];
//                         return namePart.length > 12
//                           ? namePart.slice(0, 12)
//                           : namePart;
//                       })()
//                     : "Loading..."}
//                 </p>
//                 <p className="text-white/40 text-xs leading-tight">Free tier</p>
//               </div>
//             </div>

//             <button
//               onClick={handleLogout}
//               className="group relative flex justify-center items-center w-10 h-14 rounded-lg 
//      bg-[#2A2A2A] border border-white/10
//      hover:bg-[#303030] hover:border-white/15 hover:scale-[1.02]
//      active:scale-[0.98]
//      transition-all duration-200 ease-out
//      shadow-lg hover:shadow-xl
//      before:absolute before:inset-0 before:rounded-lg 
//   before:bg-linear-to-t before:from-white/5 before:to-white/10
//      before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-200
//      after:absolute after:inset-px after:rounded-lg 
//   after:bg-linear-to-b after:from-white/5 after:to-transparent after:pointer-events-none">
//               <LogOut className="h-4 w-4 text-white/60 group-hover:text-white/90 group-hover:rotate-6 transition-transform duration-200 relative z-10" />
//               <div className="absolute inset-0 rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col">
//         {/* Header */}
//         <div className="bg-[#171717] border-b border-white/10 px-6 py-3">
//           <div className="flex items-center gap-4">
//             {!sidebarOpenLeft && (
//               <button onClick={handleOpenSidebarleft}>
//                 <ArrowRightToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
//               </button>
//             )}

//             <div className="rounded-full flex items-center justify-center text-white">
//               <UserRound />
//             </div>

//             <div>
//               <h1 className="text-xl font-bold font-mono">{activeRole}</h1>
//             </div>

//             {!sidebarOpenRight && (
//               <button onClick={handleOpenSidebarright} className="ml-auto">
//                 <ArrowLeftToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200 justify-self-end" />
//               </button>
//             )}

//             {/* <div className="ml-auto">
//               <button
//                 onClick={() => {
//                   if (!currentSessionId || !user?.id) return;
//                   // Navigate to Report page with params
//                   const url = `/Report?sessionId=${encodeURIComponent(
//                     currentSessionId
//                   )}&userId=${encodeURIComponent(user.id)}`;
//                   router.push(url);
//                 }}
//                 disabled={!currentSessionId || !user?.id}
//                 className="group relative p-2 rounded-lg bg-white/5 border border-white/10 
//                   hover:bg-white/10 hover:border-white/15 transition-all duration-300
//                   shadow-lg shadow-black/10 disabled:opacity-50 disabled:cursor-not-allowed"
//                 title="Generate Report">
//                 <FileText className="w-5 h-5 text-white/70 group-hover:text-white" />
//               </button>
//             </div> */}
//           </div>
//         </div>

//         {/* Messages Area */}
//         <div className="flex-1 px-6 py-4 overflow-y-auto relative">
//           <div className="max-w-4xl mx-auto space-y-3">
//             {isLoading && displayMessages.length === 0 ? (
//               <div className="text-center text-white/40 text-sm py-8">
//                 {currentSessionId
//                   ? "Loading messages..."
//                   : chatSessions.length > 0
//                   ? "Loading your chat..."
//                   : "Creating your first chat..."}
//               </div>
//             ) : displayMessages.length === 0 ? (
//               <div className="text-center text-white/40 text-sm py-8">
//                 {currentSessionId
//                   ? "No messages yet. Start a conversation!"
//                   : "Setting up your chat..."}
//               </div>
//             ) : (
//               displayMessages.map((message) => (
//                 <div
//                   key={message._id || Math.random().toString()}
//                   className={`flex ${
//                     message.role === "user" ? "justify-end" : "justify-start"
//                   }`}>
//                   <div
//                     className={`flex max-w-screen items-start gap-3 ${
//                       message.role === "user" ? "flex-row-reverse" : ""
//                     }`}>
//                     <div
//                       className={`rounded-lg px-3 py-2 ${
//                         message.role === "user"
//                           ? "bg-[#2A2A2A] border border-white/10 max-w-xl"
//                           : message.activeRole &&
//                             message.activeRole !== "Idea Validator"
//                           ? "max-w-4xl border-l-4"
//                           : "max-w-4xl"
//                       } text-white wrap-break-word text-wrap`}
//                       style={{
//                         borderLeftColor:
//                           message.activeRole &&
//                           message.activeRole !== "Idea Validator"
//                             ? getAdvisorHexColor(message.activeRole)
//                             : undefined,
//                       }}>
//                       <div className="text-sm leading-5 ai-md">
//                         <AIResponseRenderer content={message.content} />
//                         {/* <AIRenderer content={message.content}/> */}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}

//             {isTyping && (
//               <div className="flex justify-start">
//                 <div className="flex items-start gap-3">
//                   <div className="bg-[#2A2A2A] border border-white/10 rounded-lg px-4 py-3 shadow-sm">
//                     <div className="flex items-center gap-2">
//                       <div className="flex space-x-1">
//                         <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
//                         <div
//                           className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
//                           style={{ animationDelay: "0.1s" }}></div>
//                         <div
//                           className="w-2 h-2 bg-white/70 rounded-full animate-bounce"
//                           style={{ animationDelay: "0.2s" }}></div>
//                       </div>
//                       <span className="text-xs text-white/60">
//                         Assistant is thinking...
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>

//           {/* C-Suite Advisor Toggle Button */}
//           {/* <div className="absolute top-4 right-4 flex gap-2">
//             {!sidebarOpenRight && (
//               <button
//                 onClick={handleOpenSidebarright}
//                 className="group relative p-2 rounded-lg bg-white/5 border border-white/10 
//                   hover:bg-white/10 hover:border-white/15 transition-all duration-300
//                   shadow-lg shadow-black/10"
//                 title="Open C-Suite Advisors">
//                 <svg
//                   className="w-5 h-5 text-white/60 group-hover:text-white transition-colors"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
//                   />
//                 </svg>
//               </button>
//             )}
//           </div>  */}
//         </div>

//         {/* Input Area */}
//         <div className="bg-[#0A0A0A]px-6 py-4">
//           <div className="max-w-4xl mx-auto">
//             <div className="flex items-end gap-3">
//               <div className="flex-1 relative">
//                 <div className="relative rounded-lg bg-[#2A2A2A] border border-white/10 shadow-lg shadow-black/20 hover:border-white/15 hover:bg-[#303030] transition-all duration-300">
//                   <textarea
//                     placeholder={
//                       currentSessionId
//                         ? "Type your message here..."
//                         : chatSessions.length > 0
//                         ? "Loading your chat..."
//                         : "Creating your chat..."
//                     }
//                     className="w-full min-h-10 max-h-[84px] resize-none bg-transparent px-4 py-3 text-white placeholder-white/50 focus:outline-none scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 rounded-t-lg"
//                     rows={1}
//                     value={inputValue}
//                     onChange={(e) => setInputValue(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     disabled={isTyping || !currentSessionId}
//                   />

//                   {/* Buttons Row */}
//                   <div className="flex justify-between items-center px-3 py-2 relative z-10">
//                     {/* Left Button (Idea Validator) */}
//                     <button
//                       onClick={() => {
//                         setActiveRole("Idea Validator");
//                         setActiveAdvisor("idea_validator");
//                         setClickedAdvisors(new Set(["idea_validator"]));
//                       }}
//                       className={`relative rounded-lg h-10 w-10 flex items-center justify-center border transition-all duration-200 ease-out shadow-md hover:shadow-lg hover:scale-105
//                      ${
//                        activeRole === "Idea Validator"
//                          ? "bg-white/15 hover:bg-white/20 border-white/25"
//                          : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
//                      }
//                      disabled:bg-white/5 disabled:cursor-not-allowed disabled:hover:scale-100`}>
//                       <Lightbulb
//                         className={`h-4 w-4 transition-all duration-200 stroke-2 group-hover:scale-110
//                           ${
//                             activeRole === "Idea Validator"
//                               ? "text-yellow-400"
//                               : "text-white/60 group-disabled:text-white/30 group-hover:text-white"
//                           }`}
//                         fill={
//                           activeRole === "Idea Validator"
//                             ? "currentColor"
//                             : "none"
//                         }
//                       />
//                     </button>

//                     {/* Right Button (Send) */}
//                     <button
//                       onClick={handleSendMessage}
//                       disabled={
//                         !inputValue.trim() || isTyping || !currentSessionId
//                       }
//                       className="relative rounded-lg h-10 w-10 flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-200 ease-out shadow-md hover:shadow-lg hover:scale-105 bg-white/5 hover:bg-white/15 disabled:bg-white/5 disabled:cursor-not-allowed disabled:hover:scale-100">
//                       {isTyping ? (
//                         <div
//                           aria-busy="true"
//                           className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin"
//                         />
//                       ) : (
//                         <Send className="h-4 w-4 text-white/70 group-disabled:text-white/30 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200 stroke-3" />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* C-SUITE ADVISOR */}
//       <div
//         className={`${
//           sidebarOpenRight ? "w-60" : "w-0"
//         } bg-[#171717] border-r border-white/10 transition-all duration-300 overflow-hidden flex flex-col h-full`}>
//         {/* 1. Header Container */}
//         <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
//           <h2 className="text-lg font-mono font-bold">C-SUITE ADVISORS</h2>
//           <button
//             onClick={handleCloseSidebarright}
//             className="p-1 rounded hover:bg-white/10 transition-colors">
//             <ArrowRightToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
//           </button>
//         </div>

//         <div className="flex flex-col gap-2 p-3 overflow-y-auto">
//           {/* CEO */}
//           <div className="h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CEO"
//               isLocked={false}
//               title="Chief Executive Officer"
//               expertise="Strategic Leadership & Vision"
//               avatar={CEOImage}
//               isActive={activeAdvisor === "ceo"}
//               isReplying={replyingAdvisor === "ceo"}
//               isThinking={thinkingAdvisor === "ceo"}
//               isClicked={clickedAdvisors.has("ceo")}
//               primaryColor={advisorColors.ceo}
//               onClick={() => handleAdvisorClick("ceo", "CEO")}
//             />
//           </div>

//           {/* CFO */}
//           <div className="h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CFO"
//               isLocked={false}
//               title="Chief Financial Officer"
//               expertise="Financial Strategy & Risk Management"
//               avatar={CFOImage}
//               isActive={activeAdvisor === "cfo"}
//               isReplying={replyingAdvisor === "cfo"}
//               isThinking={thinkingAdvisor === "cfo"}
//               isClicked={clickedAdvisors.has("cfo")}
//               primaryColor={advisorColors.cfo}
//               onClick={() => handleAdvisorClick("cfo", "CFO")}
//             />
//           </div>

//           {/* CTO */}
//           <div className="h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CTO"
//               isLocked={false}
//               title="Chief Technology Officer"
//               expertise="Digital Transformation & Innovation"
//               avatar={CTOImage}
//               isActive={activeAdvisor === "cto"}
//               isReplying={replyingAdvisor === "cto"}
//               isThinking={thinkingAdvisor === "cto"}
//               isClicked={clickedAdvisors.has("cto")}
//               primaryColor={advisorColors.cto}
//               onClick={() => handleAdvisorClick("cto", "CTO")}
//             />
//           </div>

//           {/* CMO */}
//           <div className="h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CMO"
//               isLocked={false}
//               title="Chief Marketing Officer"
//               expertise="Marketing Strategy & Brand Building"
//               avatar={CMOImage}
//               isActive={activeAdvisor === "cmo"}
//               isReplying={replyingAdvisor === "cmo"}
//               isThinking={thinkingAdvisor === "cmo"}
//               isClicked={clickedAdvisors.has("cmo")}
//               primaryColor={advisorColors.cmo}
//               onClick={() => handleAdvisorClick("cmo", "CMO")}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }







// Adding preview button on code blocks.





// "use client";

// import { useState, useRef, useEffect, useCallback } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "../store/authStore";
// import { useChatStore } from "../store/chatStore";
// // Removed ReportCard and ProgressBar from main chat
// import CSuiteAdvisorCard from "../../components/ui/c-suite-card";
// import CEOImage from "../../public/ceo-1.png";
// import CFOImage from "../../public/cfo-1.png";
// import CMOImage from "../../public/cmo-1.png";
// import CTOImage from "../../public/cto-1.png";
// import {
//   Trash,
//   Send,
//   Plus,
//   MessageSquare,
//   Lightbulb,
//   ArrowLeftToLine,
//   ArrowRightToLine,
//   UserRound,
//   LogOut,
//   MonitorPlay,
//   Copy, // ⬅️ added
// } from "lucide-react";
// import Image from "next/image";
// import profile from "../../public/ceo-1.png";
// import proBg from "../../public/proBg.png";
// import AIResponseRenderer from "../../components/ui/AIResponseRenderer";
// import { useToast } from "../../components/ui/Toast";

// type ProviderRole = "user" | "assistant" | "system";
// interface ProviderMessage {
//   role: ProviderRole;
//   content: string;
//   roleContext?: string;
// }
// interface AIChatRequest {
//   messages: ProviderMessage[];
//   activeRole: string;
//   sessionId?: string;
//   userId?: string;
// }
// interface AIChatResponse {
//   content: string;
//   provider: string;
//   confidence: number;
//   userMessageId?: string;
// }

// interface Message {
//   _id?: string;
//   role: "user" | "ai" | "assistant" | "system";
//   content: string;
//   timestamp?: Date;
//   activeRole?: string;
// }

// interface AITitleResponse {
//   title: string;
// }

// function normalizeForProvider(
//   msgs: Array<Message | ProviderMessage>
// ): ProviderMessage[] {
//   const ALLOWED: ProviderRole[] = ["user", "assistant", "system"];
//   return msgs
//     .map((m) => {
//       const role: ProviderRole = ALLOWED.includes(m.role as ProviderRole)
//         ? (m.role as ProviderRole)
//         : "user";
//       const content =
//         (m as Message).content ?? (m as ProviderMessage).content ?? "";
//       const roleContext =
//         (m as Message).activeRole ??
//         (m as ProviderMessage).roleContext ??
//         undefined;

//       return {
//         role,
//         content: typeof content === "string" ? content : String(content ?? ""),
//         roleContext,
//       } as ProviderMessage;
//     })
//     .filter((m) => m.content.trim().length > 0);
// }

// /** ---------- Additive: Code extraction + preview helpers ---------- **/

// type SupportedLang = "html" | "jsx" | "js" | "css";
// const SUPPORTED: SupportedLang[] = ["html", "jsx", "js", "css"];

// function extractFirstCodeBlock(markdown: string): { lang: SupportedLang | null; code: string | null } {
//   const match = markdown.match(/```(\w+)\n([\s\S]*?)```/);
//   if (!match) return { lang: null, code: null };
//   const lang = match[1]?.toLowerCase();
//   const code = match[2] ?? null;
//   if (!code) return { lang: null, code: null };

//   const language =
//     lang === "javascript" ? "js" :
//     lang === "tsx" ? "jsx" :
//     (SUPPORTED.includes(lang as SupportedLang) ? (lang as SupportedLang) : null);

//   return { lang: language, code };
// }

// function buildSrcDoc(lang: SupportedLang, code: string): string {
//   if (lang === "html") {
//     return code;
//   }

//   if (lang === "jsx") {
//     return `
// <!doctype html>
// <html>
//   <head>
//     <meta charset="utf-8"/>
//     <meta name="viewport" content="width=device-width,initial-scale=1"/>
//     <style>
//       html,body,#root { height: 100%; margin: 0; padding: 0; }
//     </style>
//   </head>
//   <body>
//     <div id="root"></div>
//     <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
//     <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
//     <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
//     <script type="text/babel">
//       ${code}
//       const rootEl = document.getElementById('root');
//       try {
//         if (typeof App === 'function') {
//           const r = ReactDOM.createRoot(rootEl);
//           r.render(React.createElement(App));
//         }
//       } catch (e) { console.error(e); }
//     </script>
//   </body>
// </html>`;
//   }

//   if (lang === "js") {
//     return `
// <!doctype html>
// <html>
//   <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
//   <body>
//     <div id="app"></div>
//     <script>
//     ${code}
//     </script>
//   </body>
// </html>`;
//   }

//   return `
// <!doctype html>
// <html>
//   <head>
//     <meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
//     <style>${code}</style>
//   </head>
//   <body>
//     <div class="preview-target">CSS preview area</div>
//   </body>
// </html>`;
// }

// /** Per-message preview open state */
// type PreviewState = Record<string, boolean>;

// export default function ChatPage() {
//   const router = useRouter();
//   const { toast } = useToast();
//   const [inputValue, setInputValue] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [sidebarOpenLeft, setSidebarOpenLeft] = useState(true);
//   const [sidebarOpenRight, setSidebarOpenRight] = useState(true);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const [proUser] = useState(false);
//   const [activeRole, setActiveRole] = useState("Idea Validator");
//   const [localMessages, setLocalMessages] = useState<Message[]>([]);
//   const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

//   // --- Additive: which message(s) have preview toggled open ---
//   const [openPreviews, setOpenPreviews] = useState<PreviewState>({});
//   const togglePreview = useCallback((id: string) => {
//     setOpenPreviews(prev => ({ ...prev, [id]: !prev[id] }));
//   }, []);

//   // Additive: copy helper
//   const copyText = useCallback(async (text: string) => {
//     try {
//       if (navigator.clipboard && window.isSecureContext) {
//         await navigator.clipboard.writeText(text);
//       } else {
//         const ta = document.createElement("textarea");
//         ta.value = text;
//         ta.style.position = "fixed";
//         ta.style.left = "-9999px";
//         document.body.appendChild(ta);
//         ta.focus();
//         ta.select();
//         document.execCommand("copy");
//         document.body.removeChild(ta);
//       }
//       toast({ variant: "success", title: "Copied to clipboard" });
//     } catch (e) {
//       console.error(e);
//       toast({ variant: "error", title: "Copy failed", description: "Please copy manually." });
//     }
//   }, [toast]);

//   // C-Suite Advisor States
//   const [activeAdvisor, setActiveAdvisor] = useState<string | null>(null);
//   const replyingAdvisor: string | null = null;
//   const [thinkingAdvisor, setThinkingAdvisor] = useState<string | null>(null);
//   const [clickedAdvisors, setClickedAdvisors] = useState<Set<string>>(new Set());
//   const advisorColors: Record<string, string> = {
//     ceo: "blue",
//     cfo: "green",
//     cto: "purple",
//     cmo: "pink",
//   };

//   const getAdvisorColor = (roleName: string): string => {
//     return advisorColors[roleName.toLowerCase()] || "gray";
//   };

//   const getAdvisorHexColor = (roleName: string): string => {
//     const colorMap: Record<string, string> = {
//       blue: "#3b82f6",
//       green: "#22c55e",
//       purple: "#8b5cf6",
//       pink: "#ec4899",
//       gray: "#6b7280",
//     };
//     const colorKey = getAdvisorColor(roleName);
//     return colorMap[colorKey] || colorMap.gray;
//   };

//   const { user, checkAuth } = useAuthStore();

//   const {
//     chatSessions,
//     currentSessionId,
//     messages,
//     isLoading,
//     error,
//     loadChatSessions,
//     createNewChatSession,
//     selectChatSession,
//     addMessage,
//     deleteChatSession,
//     updateSessionTopic,
//     clearError,
//   } = useChatStore();

//   useEffect(() => {
//     setLocalMessages(messages);
//   }, [messages]);

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth < 768;
//       if (mobile) {
//         setSidebarOpenLeft(false);
//         setSidebarOpenRight(false);
//       } else {
//         setSidebarOpenLeft(true);
//         setSidebarOpenRight(true);
//       }
//     };
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const displayMessages = localMessages;

//   const currentSession = chatSessions.find(
//     (session) => session._id === currentSessionId
//   );

//   const createNewChat = useCallback(
//     async (isAutoCreate = false) => {
//       if (!isAutoCreate && proUser) {
//         router.push("/pricing");
//         return;
//       }
//       if (!user?.id) {
//         console.error("No user ID available");
//         return;
//       }
//       try {
//         const initialMessage = "Hello! I'm your 021 AI. How can I help you today?";
//         await createNewChatSession(user.id, "New Chat", initialMessage);
//         if (isAutoCreate) {
//           const welcomeMessage: Message = {
//             _id: Date.now().toString() + "_welcome",
//             role: "ai",
//             content: initialMessage,
//             timestamp: new Date(),
//             activeRole: "Idea Validator",
//           };
//           setLocalMessages([welcomeMessage]);
//           setActiveRole("Idea Validator");
//           setActiveAdvisor(null);
//           setClickedAdvisors(new Set());
//         }
//       } catch (error) {
//         console.error("Failed to create new chat:", error);
//         toast({
//           variant: "error",
//           title: "Could not create chat",
//           description: "Please try again in a moment.",
//         });
//       }
//     },
//     [proUser, router, user?.id, createNewChatSession, toast]
//   );

//   const handleCreateNewChat = useCallback(() => {
//     createNewChat(false);
//   }, [createNewChat]);

//   const handleLogout = useCallback(async () => {
//     try {
//       await fetch("/logout", { method: "GET" });
//       window.location.href = "/login";
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   }, []);

//   const handleNavigateToPricing = useCallback(() => {
//     router.push("/pricing");
//   }, [router]);

//   const handleCloseSidebarleft = useCallback(() => {
//     setSidebarOpenLeft(false);
//   }, []);
//   const handleOpenSidebarleft = useCallback(() => {
//     setSidebarOpenLeft(true);
//   }, []);
//   const handleCloseSidebarright = useCallback(() => {
//     setSidebarOpenRight(false);
//   }, []);
//   const handleOpenSidebarright = useCallback(() => {
//     setSidebarOpenRight(true);
//   }, []);

//   const handleAdvisorClick = useCallback(
//     (advisorKey: string, advisorName: string) => {
//       if (replyingAdvisor === advisorKey || thinkingAdvisor === advisorKey) return;
//       setActiveAdvisor(advisorKey);
//       setActiveRole(advisorName);
//       setClickedAdvisors((prev) => new Set([...prev, advisorKey]));
//     },
//     [replyingAdvisor, thinkingAdvisor]
//   );

//   const handleSelectChatSession = useCallback(
//     async (sessionId: string) => {
//       try {
//         await selectChatSession(sessionId);
//         const session = chatSessions.find((s) => s._id === sessionId);
//         if (session) {
//           const lastMessageWithRole = localMessages
//             .filter((msg) => msg.activeRole && msg.activeRole !== "Idea Validator")
//             .pop();

//           if (lastMessageWithRole?.activeRole) {
//             setActiveRole(lastMessageWithRole.activeRole);
//             const roleToAdvisorMap: { [key: string]: string } = {
//               CEO: "ceo",
//               CFO: "cfo",
//               CTO: "cto",
//               CMO: "cmo",
//             };
//             const advisorKey = roleToAdvisorMap[lastMessageWithRole.activeRole];
//             if (advisorKey) {
//               setActiveAdvisor(advisorKey);
//               setClickedAdvisors((prev) => new Set([...prev, advisorKey]));
//             }
//           } else {
//             setActiveRole("Idea Validator");
//             setActiveAdvisor(null);
//           }
//         }
//       } catch (error) {
//         console.error("Failed to select chat session:", error);
//         toast({
//           variant: "error",
//           title: "Could not load chat",
//           description: "Please try again.",
//         });
//       }
//     },
//     [selectChatSession, chatSessions, localMessages, toast]
//   );

//   const dynamicTitle = useCallback(
//     async (messages: Message): Promise<string> => {
//       const userMsg = messages.content;
//       try {
//         const response = await fetch("/api/ai-title", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userMsg }),
//         });
//         const data: AITitleResponse = await response.json();
//         return data.title;
//       } catch (error) {
//         console.error("error in dynamicTitle", error);
//         return "Error generating title";
//       }
//     },
//     []
//   );

//   const handleSendMessage = useCallback(async () => {
//     if (!inputValue.trim() || isTyping || !currentSessionId || !user?.id) return;

//     const userMessage: Message = {
//       _id: Date.now().toString(),
//       role: "user",
//       content: inputValue.trim(),
//       timestamp: new Date(),
//       activeRole: activeRole,
//     };

//     const newMessages = [...localMessages, userMessage];

//     const requestMessagesBase: Message[] = newMessages;

//     if (currentSession?.topic === "New Chat") {
//       try {
//         const title = (await dynamicTitle(userMessage)) || "new chat";
//         await updateSessionTopic(currentSessionId, title);
//       } catch (error) {
//         console.error("Failed to update session topic:", error);
//       }
//     }

//     try {
//       await addMessage(inputValue.trim(), "user", currentSessionId);
//     } catch (error) {
//       console.error("Failed to save user message:", error);
//     }

//     setLocalMessages(newMessages);

//     setInputValue("");
//     setIsTyping(true);

//     if (activeAdvisor) {
//       setThinkingAdvisor(activeAdvisor);
//     }

//     const requestBody: AIChatRequest = {
//       activeRole: activeRole,
//       messages: normalizeForProvider(requestMessagesBase).map((m) => ({
//         role: m.role,
//         content: m.content,
//         roleContext: m.roleContext,
//       })),
//       sessionId: currentSessionId,
//       userId: user.id,
//     };

//     try {
//       setIsTyping(true);

//       const response = await fetch("/api/ai-chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) throw new Error("Failed to connect to AI service");
//       if (!response.body) throw new Error("No response stream from AI");

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder("utf-8");
//       let finalText = "";

//       setLocalMessages((prev) => [
//         ...prev,
//         {
//           _id: Date.now().toString() + "_stream",
//           role: "ai",
//           content: "",
//           timestamp: new Date(),
//           activeRole,
//         },
//       ]);

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
//         const chunk = decoder.decode(value, { stream: true });
//         if (!chunk) continue;

//         finalText += chunk;

//         setLocalMessages((prev) => {
//           const updated = [...prev];
//           updated[updated.length - 1].content = finalText;
//           return updated;
//         });

//         console.log("📦 [GEMINI STREAM] CHUNK RECEIVED:", chunk);
//       }

//       if (!finalText.trim()) {
//         finalText = "⚠️ No response received from AI.";
//       }

//       setLocalMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1].content = finalText;
//         return updated;
//       });

//       console.log("✅ Stream complete. Final text length:", finalText.length);
//     } catch (err) {
//       console.error("❌ Stream error:", err);
//       toast({
//         variant: "error",
//         title: "Message failed",
//         description: "AI service temporarily unavailable.",
//       });
//     } finally {
//       setIsTyping(false);
//     }
//   }, [
//     inputValue,
//     isTyping,
//     currentSessionId,
//     user?.id,
//     localMessages,
//     currentSession?.topic,
//     activeRole,
//     activeAdvisor,
//     updateSessionTopic,
//     addMessage,
//     setLocalMessages,
//     setInputValue,
//     setIsTyping,
//     dynamicTitle,
//     toast,
//   ]);

//   const handleKeyDown = useCallback(
//     (e: React.KeyboardEvent) => {
//       if (e.key === "Enter" && !e.shiftKey) {
//         e.preventDefault();
//         handleSendMessage();
//       }
//     },
//     [handleSendMessage]
//   );

//   const handleDeleteChatSession = useCallback(
//     async (sessionId: string) => {
//       try {
//         if (chatSessions.length === 1) {
//           toast({
//             variant: "warning",
//             title: "Cannot delete",
//             description:
//               "You can't delete the last chat. Please create another chat first.",
//           });
//           return;
//         }

//         const confirmed = window.confirm(
//           "Delete this chat session? This action cannot be undone."
//         );
//         if (!confirmed) return;

//         setDeletingSessionId(sessionId);
//         await deleteChatSession(sessionId);
//       } catch (error) {
//         console.error("Failed to delete chat session:", error);
//         toast({
//           variant: "error",
//           title: "Delete failed",
//           description: "We couldn't delete the chat. Please try again.",
//         });
//       } finally {
//         setDeletingSessionId(null);
//       }
//     },
//     [chatSessions.length, deleteChatSession, toast]
//   );

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const newChatMessage = sessionStorage.getItem("newChatMessage");
//       const shouldCreateNewChat =
//         sessionStorage.getItem("createNewChat") === "true";

//       if (newChatMessage) {
//         sessionStorage.removeItem("newChatMessage");
//         sessionStorage.removeItem("createNewChat");

//         const generateTitle = async () => {
//           try {
//             if (shouldCreateNewChat && user?.id) {
//               const userMessage: Message = {
//                 _id: Date.now().toString(),
//                 role: "user",
//                 content: newChatMessage.trim(),
//                 timestamp: new Date(),
//                 activeRole: activeRole,
//               };

//               const title = await dynamicTitle(userMessage);

//               const initialMessage =
//                 "Hello! I'm your 021 AI. How can I help you today?";
//               await createNewChatSession(user.id, title, initialMessage);

//               const welcomeMessage: Message = {
//                 _id: Date.now().toString() + "_welcome",
//                 role: "ai",
//                 content: initialMessage,
//                 timestamp: new Date(),
//                 activeRole: activeRole,
//               };
//               setLocalMessages([welcomeMessage]);

//               sessionStorage.setItem("newChatMessage", newChatMessage);
//               return true;
//             }
//             return false;
//           } catch (error) {
//             console.error("Failed to generate title or create chat:", error);
//             if (shouldCreateNewChat && user?.id) {
//               createNewChat(true).then(() => {
//                 sessionStorage.setItem("newChatMessage", newChatMessage);
//               });
//               return true;
//             }
//             return false;
//           }
//         };

//         if (shouldCreateNewChat && user?.id) {
//           generateTitle().then((created) => {
//             if (created) return;
//           });
//           return;
//         }

//         if (user?.id && currentSessionId) {
//           const userMessage: Message = {
//             _id: Date.now().toString(),
//             role: "user",
//             content: newChatMessage.trim(),
//             timestamp: new Date(),
//             activeRole: activeRole,
//           };

//           const newMessages = [...localMessages, userMessage];
//           setLocalMessages(newMessages);

//           addMessage(newChatMessage.trim(), "user", currentSessionId).then(
//             () => {
//               const requestBody: AIChatRequest = {
//                 messages: normalizeForProvider(newMessages).map((m) => ({
//                   role: m.role,
//                   content: m.content,
//                   roleContext: m.roleContext,
//                 })),
//                 activeRole,
//                 sessionId: currentSessionId,
//                 userId: user.id,
//               };

//               setIsTyping(true);

//               fetch("/api/ai-chat", {
//                 method: "POST",
//                 headers: {
//                   "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(requestBody),
//               })
//                 .then(async (response) => {
//                   if (!response.ok) {
//                     throw new Error(
//                       `API error: ${response.status} ${response.statusText}`
//                     );
//                   }

//                   const contentType = response.headers.get("content-type") ?? "";

//                   if (contentType.includes("application/json")) {
//                     return (await response.json()) as AIChatResponse;
//                   }

//                   const text = await response.text();

//                   return {
//                     content: text || "",
//                     provider: "gemini-stream",
//                     confidence: 0,
//                   } satisfies AIChatResponse;
//                 })
//                 .then((data: AIChatResponse) => {
//                   const aiMessage: Message = {
//                     _id: Date.now().toString() + "_ai",
//                     role: "ai",
//                     content: data.content,
//                     timestamp: new Date(),
//                     activeRole: activeRole,
//                   };

//                   setLocalMessages((prev) => [...prev, aiMessage]);
//                 })
//                 .catch((error) => {
//                   console.error("error in chat: ", error);

//                   let errorMessage = "Unexpected error occurred.";

//                   if (
//                     error instanceof TypeError &&
//                     String(error.message || "").includes("fetch")
//                   ) {
//                     errorMessage =
//                       "Network error. Please check your connection and try again.";
//                   } else if (
//                     error instanceof Error &&
//                     String(error.message || "").includes("API error")
//                   ) {
//                     errorMessage =
//                       "AI service is temporarily unavailable. Please try again later.";
//                   } else if (error instanceof Error && error.message) {
//                     errorMessage = `Unexpected error: ${error.message}`;
//                   } else {
//                     errorMessage = `Unexpected error: ${String(error)}`;
//                   }

//                   addMessage(errorMessage, "ai", currentSessionId);

//                   const errorMsg: Message = {
//                     _id: Date.now().toString() + "_error",
//                     role: "ai",
//                     content: errorMessage,
//                     timestamp: new Date(),
//                     activeRole: activeRole,
//                   };

//                   setLocalMessages((prev) => [...prev, errorMsg]);
//                   toast({
//                     variant: "error",
//                     title: "Message failed",
//                     description: errorMessage,
//                   });
//                 })
//                 .finally(() => {
//                   setIsTyping(false);
//                 });
//             }
//           );
//         } else if (user?.id) {
//           const tempMessage = newChatMessage;
//           createNewChat(true).then(() => {
//             setTimeout(() => {
//               const userMessage: Message = {
//                 _id: Date.now().toString(),
//                 role: "user",
//                 content: tempMessage.trim(),
//                 timestamp: new Date(),
//                 activeRole: activeRole,
//               };

//               const newMessages = [...localMessages, userMessage];
//               setLocalMessages(newMessages);

//               if (currentSessionId) {
//                 addMessage(tempMessage.trim(), "user", currentSessionId).then(
//                   () => {
//                     const requestBody: AIChatRequest = {
//                       messages: normalizeForProvider(newMessages).map((m) => ({
//                         role: m.role,
//                         content: m.content,
//                         roleContext: m.roleContext,
//                       })),
//                       activeRole,
//                       sessionId: currentSessionId,
//                       userId: user.id,
//                     };

//                     setIsTyping(true);

//                     fetch("/api/ai-chat", {
//                       method: "POST",
//                       headers: { "Content-Type": "application/json" },
//                       body: JSON.stringify(requestBody),
//                     })
//                       .then((response) => response.json())
//                       .then((data: AIChatResponse) => {
//                         const aiMessage: Message = {
//                           _id: Date.now().toString() + "_ai",
//                           role: "ai",
//                           content: data.content,
//                           timestamp: new Date(),
//                           activeRole: activeRole,
//                         };

//                         setLocalMessages((prev) => [...prev, aiMessage]);
//                       })
//                       .catch((error) => {
//                         console.error("error in chat: ", error);
//                         const errorMessage = "Unexpected error occurred.";
//                         const errorMsg: Message = {
//                           _id: Date.now().toString() + "_error",
//                           role: "ai",
//                           content: errorMessage,
//                           timestamp: new Date(),
//                           activeRole: activeRole,
//                         };

//                         setLocalMessages((prev) => [...prev, errorMsg]);
//                       })
//                       .finally(() => {
//                         setIsTyping(false);
//                       });
//                   }
//                 );
//               }
//             }, 1000);
//           });
//         }
//       }
//     }
//   }, [
//     user?.id,
//     currentSessionId,
//     createNewChat,
//     localMessages,
//     activeRole,
//     createNewChatSession,
//     dynamicTitle,
//     addMessage,
//     setLocalMessages,
//     setIsTyping,
//     toast,
//   ]);

//   const hasLoadedRef = useRef(false);
//   useEffect(() => {
//     if (!hasLoadedRef.current && user?.id) {
//       hasLoadedRef.current = true;
//       loadChatSessions(user.id);
//     }
//   }, [user?.id, loadChatSessions]);

//   const didAutoActionRef = useRef(false);
//   useEffect(() => {
//     if (didAutoActionRef.current) return;
//     if (!user?.id || isLoading) return;
//     if (!hasLoadedRef.current) return;

//     if (!currentSessionId && chatSessions.length > 0) {
//       didAutoActionRef.current = true;
//       const mostRecentSession = chatSessions[0];
//       handleSelectChatSession(mostRecentSession._id!);
//     }
//   }, [
//     user?.id,
//     chatSessions,
//     isLoading,
//     currentSessionId,
//     handleSelectChatSession,
//   ]);

//   useEffect(() => {
//     if (!user?.id) return;
//     if (chatSessions.length > 0) {
//       const key = `auto-create-${user.id}`;
//       if (typeof window !== "undefined") sessionStorage.removeItem(key);
//     }
//   }, [user?.id, chatSessions.length]);

//   useEffect(() => {
//     if (currentSessionId && localMessages.length === 0 && !isLoading) {
//       const currentSession = chatSessions.find((s) => s._id === currentSessionId);
//       if (currentSession) {
//         // messages will be loaded by the store
//       }
//     }
//   }, [currentSessionId, localMessages.length, isLoading, chatSessions]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [localMessages]);

//   useEffect(() => {
//     if (error) {
//       console.error("Chat store error:", error);
//       toast({ variant: "error", title: "Error", description: String(error) });
//       setTimeout(() => clearError(), 5000);
//     }
//   }, [error, clearError, toast]);

//   return (
//     <div className="flex h-screen bg-[#0A0A0A] text-white">
//       {/* Sidebar */}
//       <div
//         className={`${sidebarOpenLeft ? "w-60" : "w-0"} bg-[#171717] border-r border-white/10 transition-all duration-300 overflow-hidden flex flex-col h-full`}
//       >
//         {/* ... left sidebar content unchanged ... */}
//         {/* (Keeping as-is for brevity; same as your current file) */}
//         <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
//           <h2 className="text-xl font-bold font-mono">021 AI</h2>
//           <button onClick={handleCloseSidebarleft} className="">
//             <ArrowLeftToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
//           </button>
//         </div>
//         <div className="flex justify-center p-4 shrink-0">
//           <button
//             onClick={handleCreateNewChat}
//             disabled={isLoading}
//             className="group relative w-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 ease-out shadow-lg shadow-black/20 before:absolute before:inset-0 before:rounded-lg before:bg-linear-to-r before:from-white/10 before:via-transparent before:to-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 after:absolute after:inset-0 after:rounded-lg after:bg-linear-to-t after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <Plus className="h-5 w-5 -mr-1.5 relative z-10 group-hover:scale-110 transition-transform duration-200" />
//             <span className="relative z-10">
//               {isLoading ? "Creating..." : "New Chat"}
//             </span>
//             <div className="absolute inset-0 rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
//           </button>
//         </div>
//         <div className="shrink-0 h-112 overflow-hidden">
//           <div className="p-3 h-full">
//             <div className="h-full overflow-y-auto space-y-2 custom-scrollbar">
//               {isLoading && chatSessions.length === 0 ? (
//                 <div className="text-center text-white/40 text-sm py-4">Loading chats...</div>
//               ) : chatSessions.length === 0 ? (
//                 <div className="text-center text-white/40 text-sm py-4">No chats yet</div>
//               ) : (
//                 chatSessions.map((session) => (
//                   <div
//                     key={session._id}
//                     onClick={() => handleSelectChatSession(session._id!)}
//                     className={`group relative w-full text-left rounded-lg transition-all duration-200 ease-out overflow-hidden
//     ${currentSessionId === session._id
//         ? `bg-[#2A2A2A] border border-white/15 shadow-lg shadow-black/10
//            before:absolute before:inset-0 before:rounded-lg before:bg-linear-to-r 
//            before:from-white/5 before:via-white/0 before:to-white/5 before:pointer-events-none
//            after:absolute after:inset-px after:rounded-lg after:bg-linear-to-b 
//            after:from-white/5 after:to-transparent after:pointer-events-none`
//         : `bg:white/0 border border-transparent hover:bg-white/5 hover:border-white/10
//            hover:before:opacity-100 before:absolute before:inset-0 before:rounded-lg 
//            before:bg-linear-to-r before:from-transparent before:via-white/5 before:to-transparent
//            before:opacity-0 before:transition-opacity before:duration-200 before:pointer-events-none`
//       }`}
//                     role="button"
//                     tabIndex={0}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") handleSelectChatSession(session._id!);
//                     }}
//                   >
//                     <div className="relative z-10 p-3">
//                       <div className="flex items-center gap-3">
//                         <div className="relative shrink-0">
//                           <MessageSquare className="h-4 w-4 text-white/40 group-hover:text-white/60 transition-colors duration-200" />
//                           {currentSessionId === session._id && (
//                             <div className="absolute inset-0 bg-white/10 rounded-full blur-sm -z-10"></div>
//                           )}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div
//                             className={`font-medium text-xs transition-colors duration-200 truncate ${
//                               currentSessionId === session._id
//                                 ? "text-white"
//                                 : "text-white/70 group-hover:text-white/90"
//                             }`}
//                           >
//                             {session.topic}
//                           </div>
//                         </div>
//                         {currentSessionId === session._id && (
//                           <div className="shrink-0 w-1.5 h-1.5 bg-white/60 rounded-full duration-200 group-hover:-translate-x-1.5"></div>
//                         )}

//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleDeleteChatSession(session._id!);
//                           }}
//                           disabled={deletingSessionId === session._id}
//                           className="hidden group-hover:flex items-center justify-center p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
//                           aria-label="Delete chat session"
//                         >
//                           {deletingSessionId === session._id ? (
//                             <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
//                           ) : (
//                             <Trash className="h-4 w-4 text-white/50 hover:text-red-400" />
//                           )}
//                         </button>
//                       </div>
//                     </div>

//                     {currentSessionId === session._id && (
//                       <div className="absolute inset-0 rounded-lg border border-white/10 pointer-events-none"></div>
//                     )}
//                     <div className="absolute inset-0 rounded-lg border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Switch to Pro & Profile sections remain unchanged */}
//         <div className="shrink-0 p-3">
//           <button
//             onClick={handleNavigateToPricing}
//             className="group relative w-full h-12 overflow-hidden rounded-2xl backdrop-blur-xl border border-purple-400/4 hover:border-purple-300/60 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] transition-all duration-300 ease-out shadow-lg shadow-purple-500/15 hover:shadow-purple-400/25 before:absolute before:inset-0 before:rounded-2xl before:bg-linear-to-r before:from-transparent before:via-white/15 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-px after:rounded-2xl after:bg-linear-to-b after:from-white/10 after:to-transparent after:pointer-events-none"
//           >
//             <div className="absolute inset-0 rounded-2xl overflow-hidden">
//               <Image
//                 src={proBg}
//                 alt="Premium background"
//                 fill
//                 className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
//               />
//               <div className="absolute inset-0 bg-linear-to-r from-purple-600/30 via-indigo-500/20 to-purple-800/30 group-hover:from-purple-500/40 group-hover:via-indigo-400/30 group-hover:to-purple-700/40 transition-all duration-300 z-10"></div>
//             </div>
//             <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-in-out z-20"></div>
//             <div className="relative z-30 flex items-center justify-center gap-2">
//               <span className="font-bold text-sm tracking-wide bg-linear-to-r from-purple-100 to-indigo-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-purple-100 transition-all duration-300 font-serif drop-shadow-sm">
//                 SWITCH TO PRO
//               </span>
//             </div>
//             <div className="absolute inset-0 rounded-2xl border border-purple-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
//           </button>
//         </div>

//         <div className="shrink-0 p-3">
//           <div className="flex gap-2">
//             <div className="flex-1 flex items-center gap-2 h-14 bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2">
//               <Image className="h-9 w-9 rounded-full border border-white/20" src={profile} alt="profile" />
//               <div className="flex-1 min-w-0">
//                 <p className="text-white text-xs font-medium leading-tight">
//                   {user?.email ? (() => {
//                     const namePart = user.email.split("@")[0];
//                     return namePart.length > 12 ? namePart.slice(0, 12) : namePart;
//                   })() : "Loading..."}
//                 </p>
//                 <p className="text-white/40 text-xs leading-tight">Free tier</p>
//               </div>
//             </div>

//             <button
//               onClick={handleLogout}
//               className="group relative flex justify-center items-center w-10 h-14 rounded-lg bg-[#2A2A2A] border border-white/10 hover:bg-[#303030] hover:border-white/15"
//             >
//               <LogOut className="h-4 w-4 text-white/60 group-hover:text-white/90" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col">
//         {/* Header */}
//         <div className="bg-[#171717] border-b border-white/10 px-6 py-3">
//           <div className="flex items-center gap-4">
//             {!sidebarOpenLeft && (
//               <button onClick={handleOpenSidebarleft}>
//                 <ArrowRightToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
//               </button>
//             )}
//             <div className="rounded-full flex items-center justify-center text-white">
//               <UserRound />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold font-mono">{activeRole}</h1>
//             </div>
//             {!sidebarOpenRight && (
//               <button onClick={handleOpenSidebarright} className="ml-auto">
//                 <ArrowLeftToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200 justify-self-end" />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Messages Area */}
//         <div className="flex-1 px-6 py-4 overflow-y-auto relative">
//           <div className="max-w-4xl mx-auto space-y-3">
//             {isLoading && displayMessages.length === 0 ? (
//               <div className="text-center text-white/40 text-sm py-8">
//                 {currentSessionId
//                   ? "Loading messages..."
//                   : chatSessions.length > 0
//                   ? "Loading your chat..."
//                   : "Creating your first chat..."}
//               </div>
//             ) : displayMessages.length === 0 ? (
//               <div className="text-center text-white/40 text-sm py-8">
//                 {currentSessionId ? "No messages yet. Start a conversation!" : "Setting up your chat..."}
//               </div>
//             ) : (
//               displayMessages.map((message, idx) => {
//                 const messageId = message._id || `msg-${idx}`;
//                 const { lang, code } = extractFirstCodeBlock(message.content || "");
//                 const canPreview =
//                   message.role !== "user" && !!lang && !!code && SUPPORTED.includes(lang as SupportedLang);

//                 return (
//                   <div
//                     key={messageId}
//                     className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
//                   >
//                     <div
//                       className={`flex max-w-screen items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
//                     >
//                       <div
//                         className={`rounded-lg px-3 py-2 ${
//                           message.role === "user"
//                             ? "bg-[#2A2A2A] border border-white/10 max-w-xl"
//                             : message.activeRole && message.activeRole !== "Idea Validator"
//                             ? "max-w-4xl border-l-4"
//                             : "max-w-4xl"
//                         } text-white wrap-break-word text-wrap`}
//                         style={{
//                           borderLeftColor:
//                             message.activeRole && message.activeRole !== "Idea Validator"
//                               ? getAdvisorHexColor(message.activeRole)
//                               : undefined,
//                         }}
//                       >
//                         <div className="text-sm leading-5 ai-md">
//                           <AIResponseRenderer content={message.content} />

//                           {/* --- Additive toolbar: Copy + Preview --- */}
//                           {canPreview && (
//                             <div className="mt-2 flex items-center justify-end gap-2">
//                               <button
//                                 onClick={() => code && copyText(code)}
//                                 className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10 hover:border-white/25 transition"
//                                 title="Copy code"
//                               >
//                                 <Copy className="h-3.5 w-3.5" />
//                                 Copy
//                               </button>

//                               <button
//                                 onClick={() => togglePreview(messageId)}
//                                 className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10 hover:border-white/25 transition"
//                                 title="Preview code"
//                               >
//                                 <MonitorPlay className="h-3.5 w-3.5" />
//                                 {openPreviews[messageId] ? "Hide Preview" : "Preview"}
//                               </button>
//                             </div>
//                           )}

//                           {canPreview && openPreviews[messageId] && code && (
//                             <div className="mt-3 rounded-lg overflow-hidden border border-white/10 bg-black/40">
//                               <iframe
//                                 className="w-full h-96 bg-white"
//                                 sandbox="allow-scripts allow-same-origin"
//                                 srcDoc={buildSrcDoc(lang as SupportedLang, code)}
//                               />
//                               <div className="px-2 py-1 text-[10px] text-white/50 bg-black/30 border-t border-white/10">
//                                 Rendering {lang?.toUpperCase()} in a sandboxed preview
//                               </div>
//                             </div>
//                           )}
//                           {/* --- End additive --- */}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             )}

//             {isTyping && (
//               <div className="flex justify-start">
//                 <div className="flex items-start gap-3">
//                   <div className="bg-[#2A2A2A] border border-white/10 rounded-lg px-4 py-3 shadow-sm">
//                     <div className="flex items-center gap-2">
//                       <div className="flex space-x-1">
//                         <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
//                         <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
//                         <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
//                       </div>
//                       <span className="text-xs text-white/60">Assistant is thinking...</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>
//         </div>

//         {/* Input Area (unchanged) */}
//         <div className="bg-[#0A0A0A]px-6 py-4">
//           <div className="max-w-4xl mx-auto">
//             <div className="flex items-end gap-3">
//               <div className="flex-1 relative">
//                 <div className="relative rounded-lg bg-[#2A2A2A] border border-white/10 shadow-lg shadow-black/20 hover:border-white/15 hover:bg-[#303030] transition-all duration-300">
//                   <textarea
//                     placeholder={
//                       currentSessionId
//                         ? "Type your message here..."
//                         : chatSessions.length > 0
//                         ? "Loading your chat..."
//                         : "Creating your chat..."
//                     }
//                     className="w-full min-h-10 max-h-[84px] resize-none bg-transparent px-4 py-3 text-white placeholder-white/50 focus:outline-none scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 rounded-t-lg"
//                     rows={1}
//                     value={inputValue}
//                     onChange={(e) => setInputValue(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     disabled={isTyping || !currentSessionId}
//                   />

//                   <div className="flex justify-between items-center px-3 py-2 relative z-10">
//                     <button
//                       onClick={() => {
//                         setActiveRole("Idea Validator");
//                         setActiveAdvisor("idea_validator");
//                         setClickedAdvisors(new Set(["idea_validator"]));
//                       }}
//                       className={`relative rounded-lg h-10 w-10 flex items-center justify-center border transition-all duration-200 ease-out shadow-md hover:shadow-lg hover:scale-105
//                      ${activeRole === "Idea Validator"
//                         ? "bg-white/15 hover:bg-white/20 border-white/25"
//                         : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
//                       }
//                      disabled:bg-white/5 disabled:cursor-not-allowed disabled:hover:scale-100`}
//                     >
//                       <Lightbulb
//                         className={`h-4 w-4 transition-all duration-200 stroke-2 group-hover:scale-110
//                           ${activeRole === "Idea Validator"
//                             ? "text-yellow-400"
//                             : "text-white/60 group-disabled:text-white/30 group-hover:text-white"
//                           }`}
//                         fill={activeRole === "Idea Validator" ? "currentColor" : "none"}
//                       />
//                     </button>

//                     <button
//                       onClick={handleSendMessage}
//                       disabled={!inputValue.trim() || isTyping || !currentSessionId}
//                       className="relative rounded-lg h-10 w-10 flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-200 ease-out shadow-md hover:shadow-lg hover:scale-105 bg-white/5 hover:bg-white/15 disabled:bg-white/5 disabled:cursor-not-allowed disabled:hover:scale-100"
//                     >
//                       {isTyping ? (
//                         <div aria-busy="true" className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
//                       ) : (
//                         <Send className="h-4 w-4 text-white/70 group-disabled:text-white/30 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200 stroke-3" />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* C-SUITE ADVISOR (unchanged) */}
//       <div className={`${sidebarOpenRight ? "w-60" : "w-0"} bg-[#171717] border-r border-white/10 transition-all duration-300 overflow-hidden flex flex-col h-full`}>
//         <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
//           <h2 className="text-lg font-mono font-bold">C-SUITE ADVISORS</h2>
//           <button onClick={handleCloseSidebarright} className="p-1 rounded hover:bg-white/10 transition-colors">
//             <ArrowRightToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
//           </button>
//         </div>

//         <div className="flex flex-col gap-2 p-3 overflow-y-auto">
//           <div className="h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CEO"
//               isLocked={false}
//               title="Chief Executive Officer"
//               expertise="Strategic Leadership & Vision"
//               avatar={CEOImage}
//               isActive={activeAdvisor === "ceo"}
//               isReplying={replyingAdvisor === "ceo"}
//               isThinking={thinkingAdvisor === "ceo"}
//               isClicked={clickedAdvisors.has("ceo")}
//               primaryColor={advisorColors.ceo}
//               onClick={() => handleAdvisorClick("ceo", "CEO")}
//             />
//           </div>
//           <div className="h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CFO"
//               isLocked={false}
//               title="Chief Financial Officer"
//               expertise="Financial Strategy & Risk Management"
//               avatar={CFOImage}
//               isActive={activeAdvisor === "cfo"}
//               isReplying={replyingAdvisor === "cfo"}
//               isThinking={thinkingAdvisor === "cfo"}
//               isClicked={clickedAdvisors.has("cfo")}
//               primaryColor={advisorColors.cfo}
//               onClick={() => handleAdvisorClick("cfo", "CFO")}
//             />
//           </div>
//           <div className="h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CTO"
//               isLocked={false}
//               title="Chief Technology Officer"
//               expertise="Digital Transformation & Innovation"
//               avatar={CTOImage}
//               isActive={activeAdvisor === "cto"}
//               isReplying={replyingAdvisor === "cto"}
//               isThinking={thinkingAdvisor === "cto"}
//               isClicked={clickedAdvisors.has("cto")}
//               primaryColor={advisorColors.cto}
//               onClick={() => handleAdvisorClick("cto", "CTO")}
//             />
//           </div>
//           <div className="h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CMO"
//               isLocked={false}
//               title="Chief Marketing Officer"
//               expertise="Marketing Strategy & Brand Building"
//               avatar={CMOImage}
//               isActive={activeAdvisor === "cmo"}
//               isReplying={replyingAdvisor === "cmo"}
//               isThinking={thinkingAdvisor === "cmo"}
//               isClicked={clickedAdvisors.has("cmo")}
//               primaryColor={advisorColors.cmo}
//               onClick={() => handleAdvisorClick("cmo", "CMO")}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





// //Adding search bar




// "use client";

// import { useState, useRef, useEffect, useCallback, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "../store/authStore";
// import { useChatStore } from "../store/chatStore";
// // Removed ReportCard and ProgressBar from main chat
// import CSuiteAdvisorCard from "../../components/ui/c-suite-card";
// import CEOImage from "../../public/ceo-1.png";
// import CFOImage from "../../public/cfo-1.png";
// import CMOImage from "../../public/cmo-1.png";
// import CTOImage from "../../public/cto-1.png";
// import {
//   Trash,
//   Send,
//   Plus,
//   MessageSquare,
//   Lightbulb,
//   ArrowLeftToLine,
//   ArrowRightToLine,
//   UserRound,
//   LogOut,
//   MonitorPlay,
//   Copy, // ⬅️ existing additive
//   ChevronUp,   // ⬅️ search navigation
//   ChevronDown, // ⬅️ search navigation
// } from "lucide-react";
// import Image from "next/image";
// import profile from "../../public/ceo-1.png";
// import proBg from "../../public/proBg.png";
// import AIResponseRenderer from "../../components/ui/AIResponseRenderer";
// import { useToast } from "../../components/ui/Toast";

// type ProviderRole = "user" | "assistant" | "system";
// interface ProviderMessage {
//   role: ProviderRole;
//   content: string;
//   roleContext?: string;
// }
// interface AIChatRequest {
//   messages: ProviderMessage[];
//   activeRole: string;
//   sessionId?: string;
//   userId?: string;
// }
// interface AIChatResponse {
//   content: string;
//   provider: string;
//   confidence: number;
//   userMessageId?: string;
// }

// interface Message {
//   _id?: string;
//   role: "user" | "ai" | "assistant" | "system";
//   content: string;
//   timestamp?: Date;
//   activeRole?: string;
// }

// interface AITitleResponse {
//   title: string;
// }

// function normalizeForProvider(
//   msgs: Array<Message | ProviderMessage>
// ): ProviderMessage[] {
//   const ALLOWED: ProviderRole[] = ["user", "assistant", "system"];
//   return msgs
//     .map((m) => {
//       const role: ProviderRole = ALLOWED.includes(m.role as ProviderRole)
//         ? (m.role as ProviderRole)
//         : "user";
//       const content =
//         (m as Message).content ?? (m as ProviderMessage).content ?? "";
//       const roleContext =
//         (m as Message).activeRole ??
//         (m as ProviderMessage).roleContext ??
//         undefined;

//       return {
//         role,
//         content: typeof content === "string" ? content : String(content ?? ""),
//         roleContext,
//       } as ProviderMessage;
//     })
//     .filter((m) => m.content.trim().length > 0);
// }

// /** ---------- Additive: Code extraction + preview helpers ---------- **/
// type SupportedLang = "html" | "jsx" | "js" | "css";
// const SUPPORTED: SupportedLang[] = ["html", "jsx", "js", "css"];

// function extractFirstCodeBlock(markdown: string): { lang: SupportedLang | null; code: string | null } {
//   const match = markdown.match(/```(\w+)\n([\s\S]*?)```/);
//   if (!match) return { lang: null, code: null };
//   const lang = match[1]?.toLowerCase();
//   const code = match[2] ?? null;
//   if (!code) return { lang: null, code: null };

//   const language =
//     lang === "javascript" ? "js" :
//     lang === "tsx" ? "jsx" :
//     (SUPPORTED.includes(lang as SupportedLang) ? (lang as SupportedLang) : null);

//   return { lang: language, code };
// }

// function buildSrcDoc(lang: SupportedLang, code: string): string {
//   if (lang === "html") {
//     return code;
//   }

//   if (lang === "jsx") {
//     return `
// <!doctype html>
// <html>
//   <head>
//     <meta charset="utf-8"/>
//     <meta name="viewport" content="width=device-width,initial-scale=1"/>
//     <style>
//       html,body,#root { height: 100%; margin: 0; padding: 0; }
//     </style>
//   </head>
//   <body>
//     <div id="root"></div>
//     <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
//     <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
//     <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
//     <script type="text/babel">
//       ${code}
//       const rootEl = document.getElementById('root');
//       try {
//         if (typeof App === 'function') {
//           const r = ReactDOM.createRoot(rootEl);
//           r.render(React.createElement(App));
//         }
//       } catch (e) { console.error(e); }
//     </script>
//   </body>
// </html>`;
//   }

//   if (lang === "js") {
//     return `
// <!doctype html>
// <html>
//   <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
//   <body>
//     <div id="app"></div>
//     <script>
//     ${code}
//     </script>
//   </body>
// </html>`;
//   }

//   return `
// <!doctype html>
// <html>
//   <head>
//     <meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
//     <style>${code}</style>
//   </head>
//   <body>
//     <div class="preview-target">CSS preview area</div>
//   </body>
// </html>`;
// }

// /** Per-message preview open state */
// type PreviewState = Record<string, boolean>;

// /** ---------- Additive: Search types/helpers ---------- **/
// interface MatchRef {
//   messageId: string;
//   start: number;
//   end: number;
//   occurrenceInMessage: number;
// }

// function findAllMatchesInMessages(messages: Message[], query: string): MatchRef[] {
//   const q = query.trim();
//   if (!q) return [];
//   const lowerQ = q.toLowerCase();
//   const results: MatchRef[] = [];

//   for (const m of messages) {
//     const id = m._id || "";
//     if (!id || !m.content) continue;
//     const text = m.content;
//     const lowerText = text.toLowerCase();

//     let from = 0;
//     let occ = 0;
//     while (true) {
//       const idx = lowerText.indexOf(lowerQ, from);
//       if (idx === -1) break;
//       results.push({
//         messageId: id,
//         start: idx,
//         end: idx + lowerQ.length,
//         occurrenceInMessage: occ,
//       });
//       occ += 1;
//       from = idx + (lowerQ.length || 1);
//     }
//   }
//   return results;
// }

// /** ---------- Component ---------- **/
// export default function ChatPage() {
//   const router = useRouter();
//   const { toast } = useToast();
//   const [inputValue, setInputValue] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [sidebarOpenLeft, setSidebarOpenLeft] = useState(true);
//   const [sidebarOpenRight, setSidebarOpenRight] = useState(true);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const [proUser] = useState(false);
//   const [activeRole, setActiveRole] = useState("Idea Validator");
//   const [localMessages, setLocalMessages] = useState<Message[]>([]);
//   const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

//   // --- Additive: which message(s) have preview toggled open ---
//   const [openPreviews, setOpenPreviews] = useState<PreviewState>({});
//   const togglePreview = useCallback((id: string) => {
//     setOpenPreviews(prev => ({ ...prev, [id]: !prev[id] }));
//   }, []);

//   // Additive: copy helper
//   const copyText = useCallback(async (text: string) => {
//     try {
//       if (navigator.clipboard && window.isSecureContext) {
//         await navigator.clipboard.writeText(text);
//       } else {
//         const ta = document.createElement("textarea");
//         ta.value = text;
//         ta.style.position = "fixed";
//         ta.style.left = "-9999px";
//         document.body.appendChild(ta);
//         ta.focus();
//         ta.select();
//         document.execCommand("copy");
//         document.body.removeChild(ta);
//       }
//       toast({ variant: "success", title: "Copied to clipboard" });
//     } catch (e) {
//       console.error(e);
//       toast({ variant: "error", title: "Copy failed", description: "Please copy manually." });
//     }
//   }, [toast]);

//   // C-Suite Advisor States
//   const [activeAdvisor, setActiveAdvisor] = useState<string | null>(null);
//   const replyingAdvisor: string | null = null;
//   const [thinkingAdvisor, setThinkingAdvisor] = useState<string | null>(null);
//   const [clickedAdvisors, setClickedAdvisors] = useState<Set<string>>(new Set());
//   const advisorColors: Record<string, string> = {
//     ceo: "blue",
//     cfo: "green",
//     cto: "purple",
//     cmo: "pink",
//   };

//   const getAdvisorColor = (roleName: string): string => {
//     return advisorColors[roleName.toLowerCase()] || "gray";
//   };

//   const getAdvisorHexColor = (roleName: string): string => {
//     const colorMap: Record<string, string> = {
//       blue: "#3b82f6",
//       green: "#22c55e",
//       purple: "#8b5cf6",
//       pink: "#ec4899",
//       gray: "#6b7280",
//     };
//     const colorKey = getAdvisorColor(roleName);
//     return colorMap[colorKey] || colorMap.gray;
//   };

//   const { user, checkAuth } = useAuthStore();

//   const {
//     chatSessions,
//     currentSessionId,
//     messages,
//     isLoading,
//     error,
//     loadChatSessions,
//     createNewChatSession,
//     selectChatSession,
//     addMessage,
//     deleteChatSession,
//     updateSessionTopic,
//     clearError,
//   } = useChatStore();

//   useEffect(() => {
//     setLocalMessages(messages);
//   }, [messages]);

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth < 768;
//       if (mobile) {
//         setSidebarOpenLeft(false);
//         setSidebarOpenRight(false);
//       } else {
//         setSidebarOpenLeft(true);
//         setSidebarOpenRight(true);
//       }
//     };
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const displayMessages = localMessages;

//   const currentSession = chatSessions.find(
//     (session) => session._id === currentSessionId
//   );

//   const createNewChat = useCallback(
//     async (isAutoCreate = false) => {
//       if (!isAutoCreate && proUser) {
//         router.push("/pricing");
//         return;
//       }
//       if (!user?.id) {
//         console.error("No user ID available");
//         return;
//       }
//       try {
//         const initialMessage = "Hello! I'm your 021 AI. How can I help you today?";
//         await createNewChatSession(user.id, "New Chat", initialMessage);
//         if (isAutoCreate) {
//           const welcomeMessage: Message = {
//             _id: Date.now().toString() + "_welcome",
//             role: "ai",
//             content: initialMessage,
//             timestamp: new Date(),
//             activeRole: "Idea Validator",
//           };
//           setLocalMessages([welcomeMessage]);
//           setActiveRole("Idea Validator");
//           setActiveAdvisor(null);
//           setClickedAdvisors(new Set());
//         }
//       } catch (error) {
//         console.error("Failed to create new chat:", error);
//         toast({
//           variant: "error",
//           title: "Could not create chat",
//           description: "Please try again in a moment.",
//         });
//       }
//     },
//     [proUser, router, user?.id, createNewChatSession, toast]
//   );

//   const handleCreateNewChat = useCallback(() => {
//     createNewChat(false);
//   }, [createNewChat]);

//   const handleLogout = useCallback(async () => {
//     try {
//       await fetch("/logout", { method: "GET" });
//       window.location.href = "/login";
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   }, []);

//   const handleNavigateToPricing = useCallback(() => {
//     router.push("/pricing");
//   }, [router]);

//   const handleCloseSidebarleft = useCallback(() => {
//     setSidebarOpenLeft(false);
//   }, []);
//   const handleOpenSidebarleft = useCallback(() => {
//     setSidebarOpenLeft(true);
//   }, []);
//   const handleCloseSidebarright = useCallback(() => {
//     setSidebarOpenRight(false);
//   }, []);
//   const handleOpenSidebarright = useCallback(() => {
//     setSidebarOpenRight(true);
//   }, []);

//   const handleAdvisorClick = useCallback(
//     (advisorKey: string, advisorName: string) => {
//       if (replyingAdvisor === advisorKey || thinkingAdvisor === advisorKey) return;
//       setActiveAdvisor(advisorKey);
//       setActiveRole(advisorName);
//       setClickedAdvisors((prev) => new Set([...prev, advisorKey]));
//     },
//     [replyingAdvisor, thinkingAdvisor]
//   );

//   const handleSelectChatSession = useCallback(
//     async (sessionId: string) => {
//       try {
//         await selectChatSession(sessionId);
//         const session = chatSessions.find((s) => s._id === sessionId);
//         if (session) {
//           const lastMessageWithRole = localMessages
//             .filter((msg) => msg.activeRole && msg.activeRole !== "Idea Validator")
//             .pop();

//           if (lastMessageWithRole?.activeRole) {
//             setActiveRole(lastMessageWithRole.activeRole);
//             const roleToAdvisorMap: { [key: string]: string } = {
//               CEO: "ceo",
//               CFO: "cfo",
//               CTO: "cto",
//               CMO: "cmo",
//             };
//             const advisorKey = roleToAdvisorMap[lastMessageWithRole.activeRole];
//             if (advisorKey) {
//               setActiveAdvisor(advisorKey);
//               setClickedAdvisors((prev) => new Set([...prev, advisorKey]));
//             }
//           } else {
//             setActiveRole("Idea Validator");
//             setActiveAdvisor(null);
//           }
//         }
//       } catch (error) {
//         console.error("Failed to select chat session:", error);
//         toast({
//           variant: "error",
//           title: "Could not load chat",
//           description: "Please try again.",
//         });
//       }
//     },
//     [selectChatSession, chatSessions, localMessages, toast]
//   );

//   const dynamicTitle = useCallback(
//     async (messages: Message): Promise<string> => {
//       const userMsg = messages.content;
//       try {
//         const response = await fetch("/api/ai-title", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userMsg }),
//         });
//         const data: AITitleResponse = await response.json();
//         return data.title;
//       } catch (error) {
//         console.error("error in dynamicTitle", error);
//         return "Error generating title";
//       }
//     },
//     []
//   );

//   const handleSendMessage = useCallback(async () => {
//     if (!inputValue.trim() || isTyping || !currentSessionId || !user?.id) return;

//     const userMessage: Message = {
//       _id: Date.now().toString(),
//       role: "user",
//       content: inputValue.trim(),
//       timestamp: new Date(),
//       activeRole: activeRole,
//     };

//     const newMessages = [...localMessages, userMessage];

//     const requestMessagesBase: Message[] = newMessages;

//     if (currentSession?.topic === "New Chat") {
//       try {
//         const title = (await dynamicTitle(userMessage)) || "new chat";
//         await updateSessionTopic(currentSessionId, title);
//       } catch (error) {
//         console.error("Failed to update session topic:", error);
//       }
//     }

//     try {
//       await addMessage(inputValue.trim(), "user", currentSessionId);
//     } catch (error) {
//       console.error("Failed to save user message:", error);
//     }

//     setLocalMessages(newMessages);

//     setInputValue("");
//     setIsTyping(true);

//     if (activeAdvisor) {
//       setThinkingAdvisor(activeAdvisor);
//     }

//     const requestBody: AIChatRequest = {
//       activeRole: activeRole,
//       messages: normalizeForProvider(requestMessagesBase).map((m) => ({
//         role: m.role,
//         content: m.content,
//         roleContext: m.roleContext,
//       })),
//       sessionId: currentSessionId,
//       userId: user.id,
//     };

//     try {
//       setIsTyping(true);

//       const response = await fetch("/api/ai-chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) throw new Error("Failed to connect to AI service");
//       if (!response.body) throw new Error("No response stream from AI");

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder("utf-8");
//       let finalText = "";

//       setLocalMessages((prev) => [
//         ...prev,
//         {
//           _id: Date.now().toString() + "_stream",
//           role: "ai",
//           content: "",
//           timestamp: new Date(),
//           activeRole,
//         },
//       ]);

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
//         const chunk = decoder.decode(value, { stream: true });
//         if (!chunk) continue;

//         finalText += chunk;

//         setLocalMessages((prev) => {
//           const updated = [...prev];
//           updated[updated.length - 1].content = finalText;
//           return updated;
//         });

//         console.log("📦 [GEMINI STREAM] CHUNK RECEIVED:", chunk);
//       }

//       if (!finalText.trim()) {
//         finalText = "⚠️ No response received from AI.";
//       }

//       setLocalMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1].content = finalText;
//         return updated;
//       });

//       console.log("✅ Stream complete. Final text length:", finalText.length);
//     } catch (err) {
//       console.error("❌ Stream error:", err);
//       toast({
//         variant: "error",
//         title: "Message failed",
//         description: "AI service temporarily unavailable.",
//       });
//     } finally {
//       setIsTyping(false);
//     }
//   }, [
//     inputValue,
//     isTyping,
//     currentSessionId,
//     user?.id,
//     localMessages,
//     currentSession?.topic,
//     activeRole,
//     activeAdvisor,
//     updateSessionTopic,
//     addMessage,
//     setLocalMessages,
//     setInputValue,
//     setIsTyping,
//     dynamicTitle,
//     toast,
//   ]);

//   const handleKeyDown = useCallback(
//     (e: React.KeyboardEvent) => {
//       if (e.key === "Enter" && !e.shiftKey) {
//         e.preventDefault();
//         handleSendMessage();
//       }
//     },
//     [handleSendMessage]
//   );

//   const handleDeleteChatSession = useCallback(
//     async (sessionId: string) => {
//       try {
//         if (chatSessions.length === 1) {
//           toast({
//             variant: "warning",
//             title: "Cannot delete",
//             description:
//               "You can't delete the last chat. Please create another chat first.",
//           });
//           return;
//         }

//         const confirmed = window.confirm(
//           "Delete this chat session? This action cannot be undone."
//         );
//         if (!confirmed) return;

//         setDeletingSessionId(sessionId);
//         await deleteChatSession(sessionId);
//       } catch (error) {
//         console.error("Failed to delete chat session:", error);
//         toast({
//           variant: "error",
//           title: "Delete failed",
//           description: "We couldn't delete the chat. Please try again.",
//         });
//       } finally {
//         setDeletingSessionId(null);
//       }
//     },
//     [chatSessions.length, deleteChatSession, toast]
//   );

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const newChatMessage = sessionStorage.getItem("newChatMessage");
//       const shouldCreateNewChat =
//         sessionStorage.getItem("createNewChat") === "true";

//       if (newChatMessage) {
//         sessionStorage.removeItem("newChatMessage");
//         sessionStorage.removeItem("createNewChat");

//         const generateTitle = async () => {
//           try {
//             if (shouldCreateNewChat && user?.id) {
//               const userMessage: Message = {
//                 _id: Date.now().toString(),
//                 role: "user",
//                 content: newChatMessage.trim(),
//                 timestamp: new Date(),
//                 activeRole: activeRole,
//               };

//               const title = await dynamicTitle(userMessage);

//               const initialMessage =
//                 "Hello! I'm your 021 AI. How can I help you today?";
//               await createNewChatSession(user.id, title, initialMessage);

//               const welcomeMessage: Message = {
//                 _id: Date.now().toString() + "_welcome",
//                 role: "ai",
//                 content: initialMessage,
//                 timestamp: new Date(),
//                 activeRole: activeRole,
//               };
//               setLocalMessages([welcomeMessage]);

//               sessionStorage.setItem("newChatMessage", newChatMessage);
//               return true;
//             }
//             return false;
//           } catch (error) {
//             console.error("Failed to generate title or create chat:", error);
//             if (shouldCreateNewChat && user?.id) {
//               createNewChat(true).then(() => {
//                 sessionStorage.setItem("newChatMessage", newChatMessage);
//               });
//               return true;
//             }
//             return false;
//           }
//         };

//         if (shouldCreateNewChat && user?.id) {
//           generateTitle().then((created) => {
//             if (created) return;
//           });
//           return;
//         }

//         if (user?.id && currentSessionId) {
//           const userMessage: Message = {
//             _id: Date.now().toString(),
//             role: "user",
//             content: newChatMessage.trim(),
//             timestamp: new Date(),
//             activeRole: activeRole,
//           };

//           const newMessages = [...localMessages, userMessage];
//           setLocalMessages(newMessages);

//           addMessage(newChatMessage.trim(), "user", currentSessionId).then(
//             () => {
//               const requestBody: AIChatRequest = {
//                 messages: normalizeForProvider(newMessages).map((m) => ({
//                   role: m.role,
//                   content: m.content,
//                   roleContext: m.roleContext,
//                 })),
//                 activeRole,
//                 sessionId: currentSessionId,
//                 userId: user.id,
//               };

//               setIsTyping(true);

//               fetch("/api/ai-chat", {
//                 method: "POST",
//                 headers: {
//                   "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(requestBody),
//               })
//                 .then(async (response) => {
//                   if (!response.ok) {
//                     throw new Error(
//                       `API error: ${response.status} ${response.statusText}`
//                     );
//                   }

//                   const contentType = response.headers.get("content-type") ?? "";

//                   if (contentType.includes("application/json")) {
//                     return (await response.json()) as AIChatResponse;
//                   }

//                   const text = await response.text();

//                   return {
//                     content: text || "",
//                     provider: "gemini-stream",
//                     confidence: 0,
//                   } satisfies AIChatResponse;
//                 })
//                 .then((data: AIChatResponse) => {
//                   const aiMessage: Message = {
//                     _id: Date.now().toString() + "_ai",
//                     role: "ai",
//                     content: data.content,
//                     timestamp: new Date(),
//                     activeRole: activeRole,
//                   };

//                   setLocalMessages((prev) => [...prev, aiMessage]);
//                 })
//                 .catch((error) => {
//                   console.error("error in chat: ", error);

//                   let errorMessage = "Unexpected error occurred.";

//                   if (
//                     error instanceof TypeError &&
//                     String(error.message || "").includes("fetch")
//                   ) {
//                     errorMessage =
//                       "Network error. Please check your connection and try again.";
//                   } else if (
//                     error instanceof Error &&
//                     String(error.message || "").includes("API error")
//                   ) {
//                     errorMessage =
//                       "AI service is temporarily unavailable. Please try again later.";
//                   } else if (error instanceof Error && error.message) {
//                     errorMessage = `Unexpected error: ${error.message}`;
//                   } else {
//                     errorMessage = `Unexpected error: ${String(error)}`;
//                   }

//                   addMessage(errorMessage, "ai", currentSessionId);

//                   const errorMsg: Message = {
//                     _id: Date.now().toString() + "_error",
//                     role: "ai",
//                     content: errorMessage,
//                     timestamp: new Date(),
//                     activeRole: activeRole,
//                   };

//                   setLocalMessages((prev) => [...prev, errorMsg]);
//                   toast({
//                     variant: "error",
//                     title: "Message failed",
//                     description: errorMessage,
//                   });
//                 })
//                 .finally(() => {
//                   setIsTyping(false);
//                 });
//             }
//           );
//         } else if (user?.id) {
//           const tempMessage = newChatMessage;
//           createNewChat(true).then(() => {
//             setTimeout(() => {
//               const userMessage: Message = {
//                 _id: Date.now().toString(),
//                 role: "user",
//                 content: tempMessage.trim(),
//                 timestamp: new Date(),
//                 activeRole: activeRole,
//               };

//               const newMessages = [...localMessages, userMessage];
//               setLocalMessages(newMessages);

//               if (currentSessionId) {
//                 addMessage(tempMessage.trim(), "user", currentSessionId).then(
//                   () => {
//                     const requestBody: AIChatRequest = {
//                       messages: normalizeForProvider(newMessages).map((m) => ({
//                         role: m.role,
//                         content: m.content,
//                         roleContext: m.roleContext,
//                       })),
//                       activeRole,
//                       sessionId: currentSessionId,
//                       userId: user.id,
//                     };

//                     setIsTyping(true);

//                     fetch("/api/ai-chat", {
//                       method: "POST",
//                       headers: { "Content-Type": "application/json" },
//                       body: JSON.stringify(requestBody),
//                     })
//                       .then((response) => response.json())
//                       .then((data: AIChatResponse) => {
//                         const aiMessage: Message = {
//                           _id: Date.now().toString() + "_ai",
//                           role: "ai",
//                           content: data.content,
//                           timestamp: new Date(),
//                           activeRole: activeRole,
//                         };

//                         setLocalMessages((prev) => [...prev, aiMessage]);
//                       })
//                       .catch((error) => {
//                         console.error("error in chat: ", error);
//                         const errorMessage = "Unexpected error occurred.";
//                         const errorMsg: Message = {
//                           _id: Date.now().toString() + "_error",
//                           role: "ai",
//                           content: errorMessage,
//                           timestamp: new Date(),
//                           activeRole: activeRole,
//                         };

//                         setLocalMessages((prev) => [...prev, errorMsg]);
//                       })
//                       .finally(() => {
//                         setIsTyping(false);
//                       });
//                   }
//                 );
//               }
//             }, 1000);
//           });
//         }
//       }
//     }
//   }, [
//     user?.id,
//     currentSessionId,
//     createNewChat,
//     localMessages,
//     activeRole,
//     createNewChatSession,
//     dynamicTitle,
//     addMessage,
//     setLocalMessages,
//     setIsTyping,
//     toast,
//   ]);

//   const hasLoadedRef = useRef(false);
//   useEffect(() => {
//     if (!hasLoadedRef.current && user?.id) {
//       hasLoadedRef.current = true;
//       loadChatSessions(user.id);
//     }
//   }, [user?.id, loadChatSessions]);

//   const didAutoActionRef = useRef(false);
//   useEffect(() => {
//     if (didAutoActionRef.current) return;
//     if (!user?.id || isLoading) return;
//     if (!hasLoadedRef.current) return;

//     if (!currentSessionId && chatSessions.length > 0) {
//       didAutoActionRef.current = true;
//       const mostRecentSession = chatSessions[0];
//       handleSelectChatSession(mostRecentSession._id!);
//     }
//   }, [
//     user?.id,
//     chatSessions,
//     isLoading,
//     currentSessionId,
//     handleSelectChatSession,
//   ]);

//   useEffect(() => {
//     if (!user?.id) return;
//     if (chatSessions.length > 0) {
//       const key = `auto-create-${user.id}`;
//       if (typeof window !== "undefined") sessionStorage.removeItem(key);
//     }
//   }, [user?.id, chatSessions.length]);

//   useEffect(() => {
//     if (currentSessionId && localMessages.length === 0 && !isLoading) {
//       const currentSession = chatSessions.find((s) => s._id === currentSessionId);
//       if (currentSession) {
//         // messages will be loaded by the store
//       }
//     }
//   }, [currentSessionId, localMessages.length, isLoading, chatSessions]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [localMessages]);

//   useEffect(() => {
//     if (error) {
//       console.error("Chat store error:", error);
//       toast({ variant: "error", title: "Error", description: String(error) });
//       setTimeout(() => clearError(), 5000);
//     }
//   }, [error, clearError, toast]);

//   /** ---------- Additive: Search state & behavior ---------- **/
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

//   // Refs to each rendered message container & its content block
//   const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
//   const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

//   const matches: MatchRef[] = useMemo(
//     () => findAllMatchesInMessages(displayMessages, searchQuery),
//     [displayMessages, searchQuery]
//   );

//   const normalizedIndex = matches.length
//     ? (currentMatchIndex % matches.length + matches.length) % matches.length
//     : 0;

//   const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     const q = e.target.value;
//     setSearchQuery(q);
//     setCurrentMatchIndex(0);
//   }, []);

//   const goToNext = useCallback(() => {
//     if (matches.length === 0) return;
//     setCurrentMatchIndex((i) => (i + 1) % matches.length);
//   }, [matches.length]);

//   const goToPrev = useCallback(() => {
//     if (matches.length === 0) return;
//     setCurrentMatchIndex((i) => (i - 1 + matches.length) % matches.length);
//   }, [matches.length]);

//   // Highlight implementation: DOM-safe, no string markup injection (prevents distortion)
//   const clearHighlights = useCallback((root: HTMLElement) => {
//     const spans = root.querySelectorAll('span[data-search-highlight]');
//     spans.forEach((span) => {
//       const parent = span.parentNode;
//       if (!parent) return;
//       const text = document.createTextNode(span.textContent || "");
//       parent.replaceChild(text, span);
//       parent.normalize();
//     });
//   }, []);

//   const applyHighlightsInNode = useCallback((root: HTMLElement, q: string) => {
//     if (!q) return 0;
//     const query = q.toLowerCase();
//     let count = 0;

//     const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
//       acceptNode(node: Node) {
//         if (!node || !node.nodeValue) return NodeFilter.FILTER_REJECT;
//         const val = node.nodeValue.trim();
//         if (!val) return NodeFilter.FILTER_REJECT;
//         // skip code blocks/pre tags to avoid breaking code formatting
//         const parentEl = node.parentElement;
//         if (!parentEl) return NodeFilter.FILTER_REJECT;
//         const tag = parentEl.tagName.toLowerCase();
//         if (tag === "code" || tag === "pre" || tag === "kbd" || tag === "samp") {
//           return NodeFilter.FILTER_REJECT;
//         }
//         return NodeFilter.FILTER_ACCEPT;
//       }
//     } as any);

//     const textNodes: Text[] = [];
//     let cur = walker.nextNode();
//     while (cur) {
//       textNodes.push(cur as Text);
//       cur = walker.nextNode();
//     }

//     textNodes.forEach((textNode) => {
//       const original = textNode.nodeValue || "";
//       const lower = original.toLowerCase();
//       let from = 0;
//       const pieces: (Text | HTMLSpanElement)[] = [];

//       while (true) {
//         const idx = lower.indexOf(query, from);
//         if (idx === -1) break;
//         if (idx > from) {
//           pieces.push(document.createTextNode(original.slice(from, idx)));
//         }
//         const span = document.createElement("span");
//         span.setAttribute("data-search-highlight", "1");
//         span.style.background = "rgba(250,204,21,0.45)";
//         span.style.borderRadius = "4px";
//         span.style.padding = "0 2px";
//         span.style.boxShadow = "0 0 0 0.5px rgba(0,0,0,0.15)";
//         span.textContent = original.slice(idx, idx + query.length);
//         pieces.push(span);
//         count += 1;
//         from = idx + query.length;
//       }
//       if (from < original.length) {
//         pieces.push(document.createTextNode(original.slice(from)));
//       }

//       if (pieces.length) {
//         const parent = textNode.parentNode!;
//         pieces.forEach((p) => parent.insertBefore(p, textNode));
//         parent.removeChild(textNode);
//       }
//     });

//     return count;
//   }, []);

//   // Apply highlights across all messages whenever query or messages change
//   useEffect(() => {
//     // Clear previous highlights first
//     Object.values(contentRefs.current).forEach((el) => {
//       if (el) clearHighlights(el);
//     });

//     if (!searchQuery.trim()) return;

//     // Apply highlights and set indices for navigation
//     let total = 0;
//     const orderedSpans: HTMLSpanElement[] = [];
//     displayMessages.forEach((m, idx) => {
//       const id = m._id || `msg-${idx}`;
//       const root = contentRefs.current[id];
//       if (!root) return;
//       const count = applyHighlightsInNode(root, searchQuery);
//       if (count > 0) {
//         // collect in DOM order
//         root.querySelectorAll('span[data-search-highlight]').forEach((s) => {
//           orderedSpans.push(s as HTMLSpanElement);
//         });
//         total += count;
//       }
//     });

//     // assign indices and active style
//     orderedSpans.forEach((span, i) => {
//       span.setAttribute("data-highlight-index", String(i));
//       span.style.outline = "";
//       span.style.outlineOffset = "";
//     });

//     if (orderedSpans.length > 0) {
//       const idx = (currentMatchIndex % orderedSpans.length + orderedSpans.length) % orderedSpans.length;
//       const active = orderedSpans[idx];
//       if (active) {
//         active.style.outline = "2px solid #facc15";
//         active.style.outlineOffset = "2px";
//         // Scroll the active span into view smoothly
//         active.scrollIntoView({ behavior: "smooth", block: "center" });
//       }
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [displayMessages, searchQuery, currentMatchIndex, applyHighlightsInNode, clearHighlights]);

//   /** ---------- Additive: Role avatar persistence (per session) ---------- **/
//   const [avatarRoleById, setAvatarRoleById] = useState<Record<string, string>>({});

//   // load from localStorage when session changes
//   useEffect(() => {
//     if (!currentSessionId) return;
//     try {
//       const key = `roleAvatarMap:${currentSessionId}`;
//       const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
//       setAvatarRoleById(raw ? JSON.parse(raw) : {});
//     } catch {
//       setAvatarRoleById({});
//     }
//   }, [currentSessionId]);

//   // persist any roles we see on messages to localStorage
//   useEffect(() => {
//     if (!currentSessionId) return;
//     const key = `roleAvatarMap:${currentSessionId}`;
//     try {
//       const next = { ...(avatarRoleById || {}) };
//       let changed = false;
//       displayMessages.forEach((m) => {
//         const id = m._id;
//         if (!id) return;
//         if (m.activeRole && ["CEO", "CTO", "CMO", "CFO"].includes(m.activeRole)) {
//           if (next[id] !== m.activeRole) {
//             next[id] = m.activeRole;
//             changed = true;
//           }
//         }
//       });
//       if (changed) {
//         setAvatarRoleById(next);
//         if (typeof window !== "undefined") {
//           localStorage.setItem(key, JSON.stringify(next));
//         }
//       }
//     } catch {
//       // ignore
//     }
//   }, [currentSessionId, displayMessages]); // eslint-disable-line react-hooks/exhaustive-deps

//   // Role Avatar helpers
//   const roleAvatarMap: Record<string, { img: any; border: string; label: string }> = {
//     CEO: { img: CEOImage, border: "#3b82f6", label: "CEO" },      // blue
//     CTO: { img: CTOImage, border: "#22c55e", label: "CTO" },      // green
//     CMO: { img: CMOImage, border: "#fb923c", label: "CMO" },      // orange
//     CFO: { img: CFOImage, border: "#8b5cf6", label: "CFO" },      // purple
//   };

//   const resolveRoleForMessage = (m: Message, mid: string): string | undefined => {
//     if (m.activeRole && ["CEO", "CTO", "CMO", "CFO"].includes(m.activeRole)) return m.activeRole;
//     return avatarRoleById[mid];
//   };

//   return (
//     <div className="flex h-screen bg-[#0A0A0A] text-white">
//       {/* Sidebar */}
//       <div
//         className={`${sidebarOpenLeft ? "w-60" : "w-0"} bg-[#171717] border-r border-white/10 transition-all duration-300 overflow-hidden flex flex-col h-full`}
//       >
//         {/* ... left sidebar content unchanged ... */}
//         {/* (Keeping as-is for brevity; same as your current file) */}
//         <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
//           <h2 className="text-xl font-bold font-mono">021 AI</h2>
//           <button onClick={handleCloseSidebarleft} className="">
//             <ArrowLeftToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
//           </button>
//         </div>
//         <div className="flex justify-center p-4 shrink-0">
//           <button
//             onClick={handleCreateNewChat}
//             disabled={isLoading}
//             className="group relative w-50 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 ease-out shadow-lg shadow-black/20 before:absolute before:inset-0 before:rounded-lg before:bg-linear-to-r before:from-white/10 before:via-transparent before:to-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 after:absolute after:inset-0 after:rounded-lg after:bg-linear-to-t after:from-transparent after:via-white/5 after:to-white/10 after:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <Plus className="h-5 w-5 -mr-1.5 relative z-10 group-hover:scale-110 transition-transform duration-200" />
//             <span className="relative z-10">
//               {isLoading ? "Creating..." : "New Chat"}
//             </span>
//             <div className="absolute inset-0 rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
//           </button>
//         </div>
//         <div className="shrink-0 h-112 overflow-hidden">
//           <div className="p-3 h-full">
//             <div className="h-full overflow-y-auto space-y-2 custom-scrollbar">
//               {isLoading && chatSessions.length === 0 ? (
//                 <div className="text-center text-white/40 text-sm py-4">Loading chats...</div>
//               ) : chatSessions.length === 0 ? (
//                 <div className="text-center text-white/40 text-sm py-4">No chats yet</div>
//               ) : (
//                 chatSessions.map((session) => (
//                   <div
//                     key={session._id}
//                     onClick={() => handleSelectChatSession(session._id!)}
//                     className={`group relative w-full text-left rounded-lg transition-all duration-200 ease-out overflow-hidden
//     ${currentSessionId === session._id
//         ? `bg-[#2A2A2A] border border-white/15 shadow-lg shadow-black/10
//            before:absolute before:inset-0 before:rounded-lg before:bg-linear-to-r 
//            before:from-white/5 before:via-white/0 before:to-white/5 before:pointer-events-none
//            after:absolute after:inset-px after:rounded-lg after:bg-linear-to-b 
//            after:from-white/5 after:to-transparent after:pointer-events-none`
//         : `bg:white/0 border border-transparent hover:bg-white/5 hover:border-white/10
//            hover:before:opacity-100 before:absolute before:inset-0 before:rounded-lg 
//            before:bg-linear-to-r before:from-transparent before:via-white/5 before:to-transparent
//            before:opacity-0 before:transition-opacity before:duration-200 before:pointer-events-none`
//       }`}
//                     role="button"
//                     tabIndex={0}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") handleSelectChatSession(session._id!);
//                     }}
//                   >
//                     <div className="relative z-10 p-3">
//                       <div className="flex items-center gap-3">
//                         <div className="relative shrink-0">
//                           <MessageSquare className="h-4 w-4 text-white/40 group-hover:text-white/60 transition-colors duration-200" />
//                           {currentSessionId === session._id && (
//                             <div className="absolute inset-0 bg-white/10 rounded-full blur-sm -z-10"></div>
//                           )}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div
//                             className={`font-medium text-xs transition-colors duration-200 truncate ${
//                               currentSessionId === session._id
//                                 ? "text-white"
//                                 : "text-white/70 group-hover:text-white/90"
//                             }`}
//                           >
//                             {session.topic}
//                           </div>
//                         </div>
//                         {currentSessionId === session._id && (
//                           <div className="shrink-0 w-1.5 h-1.5 bg-white/60 rounded-full duration-200 group-hover:-translate-x-1.5"></div>
//                         )}

//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleDeleteChatSession(session._id!);
//                           }}
//                           disabled={deletingSessionId === session._id}
//                           className="hidden group-hover:flex items-center justify-center p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
//                           aria-label="Delete chat session"
//                         >
//                           {deletingSessionId === session._id ? (
//                             <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
//                           ) : (
//                             <Trash className="h-4 w-4 text-white/50 hover:text-red-400" />
//                           )}
//                         </button>
//                       </div>
//                     </div>

//                     {currentSessionId === session._id && (
//                       <div className="absolute inset-0 rounded-lg border border-white/10 pointer-events-none"></div>
//                     )}
//                     <div className="absolute inset-0 rounded-lg border border-white/15 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"></div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Switch to Pro & Profile sections remain unchanged */}
//         <div className="shrink-0 p-3">
//           <button
//             onClick={handleNavigateToPricing}
//             className="group relative w-full h-12 overflow-hidden rounded-2xl backdrop-blur-xl border border-purple-400/4 hover:border-purple-300/60 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98] transition-all duration-300 ease-out shadow-lg shadow-purple-500/15 hover:shadow-purple-400/25 before:absolute before:inset-0 before:rounded-2xl before:bg-linear-to-r before:from-transparent before:via-white/15 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500 after:absolute after:inset-px after:rounded-2xl after:bg-linear-to-b after:from-white/10 after:to-transparent after:pointer-events-none"
//           >
//             <div className="absolute inset-0 rounded-2xl overflow-hidden">
//               <Image
//                 src={proBg}
//                 alt="Premium background"
//                 fill
//                 className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
//               />
//               <div className="absolute inset-0 bg-linear-to-r from-purple-600/30 via-indigo-500/20 to-purple-800/30 group-hover:from-purple-500/40 group-hover:via-indigo-400/30 group-hover:to-purple-700/40 transition-all duration-300 z-10"></div>
//             </div>
//             <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-in-out z-20"></div>
//             <div className="relative z-30 flex items-center justify-center gap-2">
//               <span className="font-bold text-sm tracking-wide bg-linear-to-r from-purple-100 to-indigo-100 bg-clip-text text-transparent group-hover:from-white group-hover:to-purple-100 transition-all duration-300 font-serif drop-shadow-sm">
//                 SWITCH TO PRO
//               </span>
//             </div>
//             <div className="absolute inset-0 rounded-2xl border border-purple-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"></div>
//           </button>
//         </div>

//         <div className="shrink-0 p-3">
//           <div className="flex gap-2">
//             <div className="flex-1 flex items-center gap-2 h-14 bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2">
//               <Image className="h-9 w-9 rounded-full border border-white/20" src={profile} alt="profile" />
//               <div className="flex-1 min-w-0">
//                 <p className="text-white text-xs font-medium leading-tight">
//                   {user?.email ? (() => {
//                     const namePart = user.email.split("@")[0];
//                     return namePart.length > 12 ? namePart.slice(0, 12) : namePart;
//                   })() : "Loading..."}
//                 </p>
//                 <p className="text-white/40 text-xs leading-tight">Free tier</p>
//               </div>
//             </div>

//             <button
//               onClick={handleLogout}
//               className="group relative flex justify-center items-center w-10 h-14 rounded-lg bg-[#2A2A2A] border border-white/10 hover:bg-[#303030] hover:border-white/15"
//             >
//               <LogOut className="h-4 w-4 text-white/60 group-hover:text-white/90" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col">
//         {/* Header */}
//         <div className="bg-[#171717] border-b border-white/10 px-6 py-3">
//           <div className="flex items-center gap-4">
//             {!sidebarOpenLeft && (
//               <button onClick={handleOpenSidebarleft}>
//                 <ArrowRightToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
//               </button>
//             )}
//             <div className="rounded-full flex items-center justify-center text-white">
//               <UserRound />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold font-mono">{activeRole}</h1>
//             </div>

//             {/* ---------- Search Bar in Navbar (unchanged APIs) ---------- */}
//             <div className="ml-auto flex items-center gap-2">
//               <div className="flex items-center gap-2 bg-[#2A2A2A] border border-white/10 rounded-lg px-2 py-1">
//                 <input
//                   value={searchQuery}
//                   onChange={onSearchChange}
//                   placeholder="Search in chat…"
//                   className="bg-transparent outline-none text-sm placeholder-white/50 px-1 py-1 w-52"
//                 />
//                 <span className="text-xs text-white/50">
//                   {matches.length > 0 ? `${normalizedIndex + 1}/${matches.length}` : "0/0"}
//                 </span>
//                 <button
//                   onClick={goToPrev}
//                   disabled={!matches.length}
//                   className="p-1 rounded hover:bg-white/10 disabled:opacity-40"
//                   title="Previous match"
//                 >
//                   <ChevronUp className="h-4 w-4" />
//                 </button>
//                 <button
//                   onClick={goToNext}
//                   disabled={!matches.length}
//                   className="p-1 rounded hover:bg-white/10 disabled:opacity-40"
//                   title="Next match"
//                 >
//                   <ChevronDown className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//             {/* ---------- End Search Bar ---------- */}

//             {!sidebarOpenRight && (
//               <button onClick={handleOpenSidebarright} className="ml-2">
//                 <ArrowLeftToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200 justify-self-end" />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Messages Area */}
//         <div className="flex-1 px-6 py-4 overflow-y-auto relative">
//           <div className="max-w-4xl mx-auto space-y-3">
//             {isLoading && displayMessages.length === 0 ? (
//               <div className="text-center text-white/40 text-sm py-8">
//                 {currentSessionId
//                   ? "Loading messages..."
//                   : chatSessions.length > 0
//                   ? "Loading your chat..."
//                   : "Creating your first chat..."}
//               </div>
//             ) : displayMessages.length === 0 ? (
//               <div className="text-center text-white/40 text-sm py-8">
//                 {currentSessionId ? "No messages yet. Start a conversation!" : "Setting up your chat..."}
//               </div>
//             ) : (
//               displayMessages.map((message, idx) => {
//                 const messageId = message._id || `msg-${idx}`;
//                 const { lang, code } = extractFirstCodeBlock(message.content || "");
//                 const canPreview =
//                   message.role !== "user" && !!lang && !!code && SUPPORTED.includes(lang as SupportedLang);

//                 // Resolve role for avatar/border even after refresh (from localStorage)
//                 const resolvedRole = resolveRoleForMessage(message, messageId);
//                 const showRoleAvatar =
//                   resolvedRole && ["CEO", "CTO", "CMO", "CFO"].includes(resolvedRole) && message.role !== "user";
//                 const roleMeta = showRoleAvatar ? roleAvatarMap[resolvedRole as keyof typeof roleAvatarMap] : null;

//                 return (
//                   <div
//                     key={messageId}
//                     ref={(el) => { messageRefs.current[messageId] = el; }}
//                     className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
//                   >
//                     <div
//                       className={`flex max-w-screen items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
//                     >

//                       {/* Round Role Avatar (persists via resolvedRole) */}
//                       {showRoleAvatar && (
//                         <div className="shrink-0 flex items-start pt-1">
//                           <div
//                             className="h-7 w-7 rounded-full overflow-hidden"
//                             style={{
//                               border: `2px solid ${roleMeta?.border}`,
//                               boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
//                             }}
//                             title={roleMeta?.label}
//                           >
//                             <Image
//                               src={roleMeta!.img}
//                               alt={roleMeta!.label}
//                               className="h-full w-full object-cover rounded-full"
//                             />
//                           </div>
//                         </div>
//                       )}

//                       <div
//                         className={`rounded-lg px-3 py-2 ${
//                           message.role === "user"
//                             ? "bg-[#2A2A2A] border border-white/10 max-w-xl"
//                             : message.activeRole && message.activeRole !== "Idea Validator"
//                             ? "max-w-4xl border-l-4"
//                             : "max-w-4xl"
//                         } text-white wrap-break-word text-wrap`}
//                         style={{
//                           borderLeftColor:
//                             message.activeRole && message.activeRole !== "Idea Validator"
//                               ? getAdvisorHexColor(message.activeRole)
//                               : (showRoleAvatar && resolvedRole
//                                   ? getAdvisorHexColor(resolvedRole)
//                                   : undefined),
//                         }}
//                       >
//                         <div
//                           className="text-sm leading-5 ai-md"
//                           ref={(el) => { contentRefs.current[messageId] = el; }}
//                         >
//                           {/* Render original content (no HTML injection) */}
//                           <AIResponseRenderer content={message.content} />

//                           {/* Toolbar: Copy + Preview (unchanged) */}
//                           {canPreview && (
//                             <div className="mt-2 flex items-center justify-end gap-2">
//                               <button
//                                 onClick={() => code && copyText(code)}
//                                 className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10 hover:border-white/25 transition"
//                                 title="Copy code"
//                               >
//                                 <Copy className="h-3.5 w-3.5" />
//                                 Copy
//                               </button>

//                               <button
//                                 onClick={() => togglePreview(messageId)}
//                                 className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10 hover:border-white/25 transition"
//                                 title="Preview code"
//                               >
//                                 <MonitorPlay className="h-3.5 w-3.5" />
//                                 {openPreviews[messageId] ? "Hide Preview" : "Preview"}
//                               </button>
//                             </div>
//                           )}

//                           {canPreview && openPreviews[messageId] && code && (
//                             <div className="mt-3 rounded-lg overflow-hidden border border-white/10 bg-black/40">
//                               <iframe
//                                 className="w-full h-96 bg-white"
//                                 sandbox="allow-scripts allow-same-origin"
//                                 srcDoc={buildSrcDoc(lang as SupportedLang, code)}
//                               />
//                               <div className="px-2 py-1 text-[10px] text-white/50 bg-black/30 border-t border-white/10">
//                                 Rendering {lang?.toUpperCase()} in a sandboxed preview
//                               </div>
//                             </div>
//                           )}
//                           {/* --- End additive --- */}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             )}

//             {isTyping && (
//               <div className="flex justify-start">
//                 <div className="flex items-start gap-3">
//                   <div className="bg-[#2A2A2A] border border-white/10 rounded-lg px-4 py-3 shadow-sm">
//                     <div className="flex items-center gap-2">
//                       <div className="flex space-x-1">
//                         <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
//                         <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
//                         <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
//                       </div>
//                       <span className="text-xs text-white/60">Assistant is thinking...</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>
//         </div>

//         {/* Input Area (unchanged) */}
//         <div className="bg-[#0A0A0A]px-6 py-4">
//           <div className="max-w-4xl mx-auto">
//             <div className="flex items-end gap-3">
//               <div className="flex-1 relative">
//                 <div className="relative rounded-lg bg-[#2A2A2A] border border-white/10 shadow-lg shadow-black/20 hover:border-white/15 hover:bg-[#303030] transition-all duration-300">
//                   <textarea
//                     placeholder={
//                       currentSessionId
//                         ? "Type your message here..."
//                         : chatSessions.length > 0
//                         ? "Loading your chat..."
//                         : "Creating your chat..."
//                     }
//                     className="w-full min-h-10 max-h-[84px] resize-none bg-transparent px-4 py-3 text-white placeholder-white/50 focus:outline-none scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 rounded-t-lg"
//                     rows={1}
//                     value={inputValue}
//                     onChange={(e) => setInputValue(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     disabled={isTyping || !currentSessionId}
//                   />

//                   <div className="flex justify-between items-center px-3 py-2 relative z-10">
//                     <button
//                       onClick={() => {
//                         setActiveRole("Idea Validator");
//                         setActiveAdvisor("idea_validator");
//                         setClickedAdvisors(new Set(["idea_validator"]));
//                       }}
//                       className={`relative rounded-lg h-10 w-10 flex items-center justify-center border transition-all duration-200 ease-out shadow-md hover:shadow-lg hover:scale-105
//                      ${activeRole === "Idea Validator"
//                         ? "bg-white/15 hover:bg-white/20 border-white/25"
//                         : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
//                       }
//                      disabled:bg-white/5 disabled:cursor-not-allowed disabled:hover:scale-100`}
//                     >
//                       <Lightbulb
//                         className={`h-4 w-4 transition-all duration-200 stroke-2 group-hover:scale-110
//                           ${activeRole === "Idea Validator"
//                             ? "text-yellow-400"
//                             : "text-white/60 group-disabled:text-white/30 group-hover:text-white"
//                           }`}
//                         fill={activeRole === "Idea Validator" ? "currentColor" : "none"}
//                       />
//                     </button>

//                     <button
//                       onClick={handleSendMessage}
//                       disabled={!inputValue.trim() || isTyping || !currentSessionId}
//                       className="relative rounded-lg h-10 w-10 flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-200 ease-out shadow-md hover:shadow-lg hover:scale-105 bg-white/5 hover:bg-white/15 disabled:bg-white/5 disabled:cursor-not-allowed disabled:hover:scale-100"
//                     >
//                       {isTyping ? (
//                         <div aria-busy="true" className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
//                       ) : (
//                         <Send className="h-4 w-4 text-white/70 group-disabled:text-white/30 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200 stroke-3" />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* C-SUITE ADVISOR (unchanged) */}
//       <div className={`${sidebarOpenRight ? "w-60" : "w-0"} bg-[#171717] border-r border-white/10 transition-all duration-300 overflow-hidden flex flex-col h-full`}>
//         <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
//           <h2 className="text-lg font-mono font-bold">C-SUITE ADVISORS</h2>
//           <button onClick={handleCloseSidebarright} className="p-1 rounded hover:bg-white/10 transition-colors">
//             <ArrowRightToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
//           </button>
//         </div>

//         <div className="flex flex-col gap-2 p-3 overflow-y-auto">
//           <div className="h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CEO"
//               isLocked={false}
//               title="Chief Executive Officer"
//               expertise="Strategic Leadership & Vision"
//               avatar={CEOImage}
//               isActive={activeAdvisor === "ceo"}
//               isReplying={replyingAdvisor === "ceo"}
//               isThinking={thinkingAdvisor === "ceo"}
//               isClicked={clickedAdvisors.has("ceo")}
//               primaryColor={advisorColors.ceo}
//               onClick={() => handleAdvisorClick("ceo", "CEO")}
//             />
//           </div>
//           <div className="h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CFO"
//               isLocked={false}
//               title="Chief Financial Officer"
//               expertise="Financial Strategy & Risk Management"
//               avatar={CFOImage}
//               isActive={activeAdvisor === "cfo"}
//               isReplying={replyingAdvisor === "cfo"}
//               isThinking={thinkingAdvisor === "cfo"}
//               isClicked={clickedAdvisors.has("cfo")}
//               primaryColor={advisorColors.cfo}
//               onClick={() => handleAdvisorClick("cfo", "CFO")}
//             />
//           </div>
//           <div className="h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CTO"
//               isLocked={false}
//               title="Chief Technology Officer"
//               expertise="Digital Transformation & Innovation"
//               avatar={CTOImage}
//               isActive={activeAdvisor === "cto"}
//               isReplying={replyingAdvisor === "cto"}
//               isThinking={thinkingAdvisor === "cto"}
//               isClicked={clickedAdvisors.has("cto")}
//               primaryColor={advisorColors.cto}
//               onClick={() => handleAdvisorClick("cto", "CTO")}
//             />
//           </div>
//           <div className="h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CMO"
//               isLocked={false}
//               title="Chief Marketing Officer"
//               expertise="Marketing Strategy & Brand Building"
//               avatar={CMOImage}
//               isActive={activeAdvisor === "cmo"}
//               isReplying={replyingAdvisor === "cmo"}
//               isThinking={thinkingAdvisor === "cmo"}
//               isClicked={clickedAdvisors.has("cmo")}
//               primaryColor={advisorColors.cmo}
//               onClick={() => handleAdvisorClick("cmo", "CMO")}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }









// Mobile Responsive Chat Page









// "use client";

// import { useState, useRef, useEffect, useCallback, useMemo } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "../store/authStore";
// import { useChatStore } from "../store/chatStore";
// // Removed ReportCard and ProgressBar from main chat
// import CSuiteAdvisorCard from "../../components/ui/c-suite-card";
// import CEOImage from "../../public/ceo-1.png";
// import CFOImage from "../../public/cfo-1.png";
// import CMOImage from "../../public/cmo-1.png";
// import CTOImage from "../../public/cto-1.png";
// import {
//   Trash,
//   Send,
//   Plus,
//   MessageSquare,
//   Lightbulb,
//   ArrowLeftToLine,
//   ArrowRightToLine,
//   UserRound,
//   LogOut,
//   MonitorPlay,
//   Copy, // ⬅️ existing additive
//   ChevronUp,   // ⬅️ search navigation
//   ChevronDown, // ⬅️ search navigation
// } from "lucide-react";
// import Image from "next/image";
// import profile from "../../public/ceo-1.png";
// import proBg from "../../public/proBg.png";
// import AIResponseRenderer from "../../components/ui/AIResponseRenderer";
// import { useToast } from "../../components/ui/Toast";

// type ProviderRole = "user" | "assistant" | "system";
// interface ProviderMessage {
//   role: ProviderRole;
//   content: string;
//   roleContext?: string;
// }
// interface AIChatRequest {
//   messages: ProviderMessage[];
//   activeRole: string;
//   sessionId?: string;
//   userId?: string;
// }
// interface AIChatResponse {
//   content: string;
//   provider: string;
//   confidence: number;
//   userMessageId?: string;
// }

// interface Message {
//   _id?: string;
//   role: "user" | "ai" | "assistant" | "system";
//   content: string;
//   timestamp?: Date;
//   activeRole?: string;
// }

// interface AITitleResponse {
//   title: string;
// }

// function normalizeForProvider(
//   msgs: Array<Message | ProviderMessage>
// ): ProviderMessage[] {
//   const ALLOWED: ProviderRole[] = ["user", "assistant", "system"];
//   return msgs
//     .map((m) => {
//       const role: ProviderRole = ALLOWED.includes(m.role as ProviderRole)
//         ? (m.role as ProviderRole)
//         : "user";
//       const content =
//         (m as Message).content ?? (m as ProviderMessage).content ?? "";
//       const roleContext =
//         (m as Message).activeRole ??
//         (m as ProviderMessage).roleContext ??
//         undefined;

//       return {
//         role,
//         content: typeof content === "string" ? content : String(content ?? ""),
//         roleContext,
//       } as ProviderMessage;
//     })
//     .filter((m) => m.content.trim().length > 0);
// }

// /** ---------- Additive: Code extraction + preview helpers ---------- **/
// type SupportedLang = "html" | "jsx" | "js" | "css";
// const SUPPORTED: SupportedLang[] = ["html", "jsx", "js", "css"];

// function extractFirstCodeBlock(markdown: string): { lang: SupportedLang | null; code: string | null } {
//   const match = markdown.match(/```(\w+)\n([\s\S]*?)```/);
//   if (!match) return { lang: null, code: null };
//   const lang = match[1]?.toLowerCase();
//   const code = match[2] ?? null;
//   if (!code) return { lang: null, code: null };

//   const language =
//     lang === "javascript" ? "js" :
//     lang === "tsx" ? "jsx" :
//     (SUPPORTED.includes(lang as SupportedLang) ? (lang as SupportedLang) : null);

//   return { lang: language, code };
// }

// function buildSrcDoc(lang: SupportedLang, code: string): string {
//   if (lang === "html") {
//     return code;
//   }

//   if (lang === "jsx") {
//     return `
// <!doctype html>
// <html>
//   <head>
//     <meta charset="utf-8"/>
//     <meta name="viewport" content="width=device-width,initial-scale=1"/>
//     <style>
//       html,body,#root { height: 100%; margin: 0; padding: 0; }
//     </style>
//   </head>
//   <body>
//     <div id="root"></div>
//     <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
//     <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
//     <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
//     <script type="text/babel">
//       ${code}
//       const rootEl = document.getElementById('root');
//       try {
//         if (typeof App === 'function') {
//           const r = ReactDOM.createRoot(rootEl);
//           r.render(React.createElement(App));
//         }
//       } catch (e) { console.error(e); }
//     </script>
//   </body>
// </html>`;
//   }

//   if (lang === "js") {
//     return `
// <!doctype html>
// <html>
//   <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
//   <body>
//     <div id="app"></div>
//     <script>
//     ${code}
//     </script>
//   </body>
// </html>`;
//   }

//   return `
// <!doctype html>
// <html>
//   <head>
//     <meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
//     <style>${code}</style>
//   </head>
//   <body>
//     <div class="preview-target">CSS preview area</div>
//   </body>
// </html>`;
// }

// /** Per-message preview open state */
// type PreviewState = Record<string, boolean>;

// /** ---------- Additive: Search types/helpers ---------- **/
// interface MatchRef {
//   messageId: string;
//   start: number;
//   end: number;
//   occurrenceInMessage: number;
// }

// function findAllMatchesInMessages(messages: Message[], query: string): MatchRef[] {
//   const q = query.trim();
//   if (!q) return [];
//   const lowerQ = q.toLowerCase();
//   const results: MatchRef[] = [];

//   for (const m of messages) {
//     const id = m._id || "";
//     if (!id || !m.content) continue;
//     const text = m.content;
//     const lowerText = text.toLowerCase();

//     let from = 0;
//     let occ = 0;
//     while (true) {
//       const idx = lowerText.indexOf(lowerQ, from);
//       if (idx === -1) break;
//       results.push({
//         messageId: id,
//         start: idx,
//         end: idx + lowerQ.length,
//         occurrenceInMessage: occ,
//       });
//       occ += 1;
//       from = idx + (lowerQ.length || 1);
//     }
//   }
//   return results;
// }

// /** ---------- Component ---------- **/
// export default function ChatPage() {
//   const router = useRouter();
//   const { toast } = useToast();
//   const [inputValue, setInputValue] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [sidebarOpenLeft, setSidebarOpenLeft] = useState(true);
//   const [sidebarOpenRight, setSidebarOpenRight] = useState(true);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const [proUser] = useState(false);
//   const [localMessages, setLocalMessages] = useState<Message[]>([]);
//   const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  
//   // Role mapping: UI display names <-> store keys
//   const roleToStoreKey: Record<string, string> = {
//     "Idea Validator": "idea-validator",
//     "CEO": "ceo",
//     "CFO": "cfo",
//     "CTO": "cto",
//     "CMO": "cmo",
//   };
//   const storeKeyToRole: Record<string, string> = {
//     "idea-validator": "Idea Validator",
//     "ceo": "CEO",
//     "cfo": "CFO",
//     "cto": "CTO",
//     "cmo": "CMO",
//   };

//   // --- Additive: which message(s) have preview toggled open ---
//   const [openPreviews, setOpenPreviews] = useState<PreviewState>({});
//   const togglePreview = useCallback((id: string) => {
//     setOpenPreviews(prev => ({ ...prev, [id]: !prev[id] }));
//   }, []);

//   // Additive: copy helper
//   const copyText = useCallback(async (text: string) => {
//     try {
//       if (navigator.clipboard && window.isSecureContext) {
//         await navigator.clipboard.writeText(text);
//       } else {
//         const ta = document.createElement("textarea");
//         ta.value = text;
//         ta.style.position = "fixed";
//         ta.style.left = "-9999px";
//         document.body.appendChild(ta);
//         ta.focus();
//         ta.select();
//         document.execCommand("copy");
//         document.body.removeChild(ta);
//       }
//       toast({ variant: "success", title: "Copied to clipboard" });
//     } catch (e) {
//       console.error(e);
//       toast({ variant: "error", title: "Copy failed", description: "Please copy manually." });
//     }
//   }, [toast]);

//   // C-Suite Advisor States
//   const [activeAdvisor, setActiveAdvisor] = useState<string | null>(null);
//   const replyingAdvisor: string | null = null;
//   const [thinkingAdvisor, setThinkingAdvisor] = useState<string | null>(null);
//   const [clickedAdvisors, setClickedAdvisors] = useState<Set<string>>(new Set());
//   const advisorColors: Record<string, string> = {
//     ceo: "blue",
//     cfo: "green",
//     cto: "purple",
//     cmo: "pink",
//   };

//   const getAdvisorColor = (roleName: string): string => {
//     return advisorColors[roleName.toLowerCase()] || "gray";
//   };

//   const getAdvisorHexColor = (roleName: string): string => {
//     const colorMap: Record<string, string> = {
//       blue: "#3b82f6",
//       green: "#22c55e",
//       purple: "#8b5cf6",
//       pink: "#ec4899",
//       gray: "#6b7280",
//     };
//     const colorKey = getAdvisorColor(roleName);
//     return colorMap[colorKey] || colorMap.gray;
//   };

//   const { user, checkAuth } = useAuthStore();

//   const {
//     chatSessions,
//     currentSessionId,
//     messages,
//     currentActiveRole,
//     isLoading,
//     error,
//     loadChatSessions,
//     createNewChatSession,
//     selectChatSession,
//     addMessage,
//     deleteChatSession,
//     updateSessionTopic,
//     clearError,
//     setActiveRole,
//   } = useChatStore();
  
//   // Get display role from store key
//   const activeRole = storeKeyToRole[currentActiveRole] || "Idea Validator";

//   // Messages are already filtered by the store based on activeRole
//   // No client-side filtering needed - database handles it
//   useEffect(() => {
//     setLocalMessages(messages);
//   }, [messages]);

//   useEffect(() => {
//     const handleResize = () => {
//       const mobile = window.innerWidth < 768;
//       if (mobile) {
//         setSidebarOpenLeft(false);
//         setSidebarOpenRight(false);
//       } else {
//         setSidebarOpenLeft(true);
//         setSidebarOpenRight(true);
//       }
//     };
//     handleResize();
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const displayMessages = localMessages;

//   const currentSession = chatSessions.find(
//     (session) => session._id === currentSessionId
//   );

//   const createNewChat = useCallback(
//     async (isAutoCreate = false) => {
//       if (!isAutoCreate && proUser) {
//         router.push("/pricing");
//         return;
//       }
//       if (!user?.id) {
//         console.error("No user ID available");
//         return;
//       }
//       try {
//         const initialMessage = "Hello! I'm your 021 AI. How can I help you today?";
//         await createNewChatSession(user.id, "New Chat", initialMessage);
//         if (isAutoCreate) {
//           const welcomeMessage: Message = {
//             _id: Date.now().toString() + "_welcome",
//             role: "ai",
//             content: initialMessage,
//             timestamp: new Date(),
//             activeRole: "Idea Validator", // Display name
//           };
//           setLocalMessages([welcomeMessage]);
//           setActiveRole("idea-validator"); // Store key
//           setActiveAdvisor(null);
//           setClickedAdvisors(new Set());
//         }
//       } catch (error) {
//         console.error("Failed to create new chat:", error);
//         toast({
//           variant: "error",
//           title: "Could not create chat",
//           description: "Please try again in a moment.",
//         });
//       }
//     },
//     [proUser, router, user?.id, createNewChatSession, toast]
//   );

//   const handleCreateNewChat = useCallback(() => {
//     createNewChat(false);
//   }, [createNewChat]);

//   const handleLogout = useCallback(async () => {
//     try {
//       await fetch("/logout", { method: "GET" });
//       window.location.href = "/login";
//     } catch (error) {
//       console.error("Logout failed:", error);
//     }
//   }, []);

//   const handleNavigateToPricing = useCallback(() => {
//     router.push("/pricing");
//   }, [router]);

//   const handleCloseSidebarleft = useCallback(() => {
//     setSidebarOpenLeft(false);
//   }, []);
//   const handleOpenSidebarleft = useCallback(() => {
//     setSidebarOpenLeft(true);
//   }, []);
//   const handleCloseSidebarright = useCallback(() => {
//     setSidebarOpenRight(false);
//   }, []);
//   const handleOpenSidebarright = useCallback(() => {
//     setSidebarOpenRight(true);
//   }, []);

//   const handleAdvisorClick = useCallback(
//     (advisorKey: string, advisorName: string) => {
//       if (replyingAdvisor === advisorKey || thinkingAdvisor === advisorKey) return;
//       setActiveAdvisor(advisorKey);
//       // Update store with store key (lowercase) - this will reload messages for this advisor
//       const storeKey = advisorKey.toLowerCase();
//       setActiveRole(storeKey); // This reloads messages filtered by this advisor
//       setClickedAdvisors((prev) => new Set([...prev, advisorKey]));
//     },
//     [replyingAdvisor, thinkingAdvisor, setActiveRole]
//   );

//   const handleSelectChatSession = useCallback(
//     async (sessionId: string) => {
//       try {
//         // Load persisted advisor selection for this session
//         let persistedRole: string | null = null;
//         if (typeof window !== "undefined") {
//           persistedRole = localStorage.getItem(`activeRole:${sessionId}`);
//         }
        
//         // Use persisted role or default to idea-validator
//         const roleToLoad = persistedRole || "idea-validator";
        
//         // Load messages with role filter
//         await selectChatSession(sessionId, roleToLoad);
        
//         const session = chatSessions.find((s) => s._id === sessionId);
//         if (session) {
//           // Restore advisor UI state from persisted role
//           if (persistedRole && persistedRole !== "idea-validator") {
//             const roleName = storeKeyToRole[persistedRole] || persistedRole;
//             const advisorKey = persistedRole;
//             setActiveAdvisor(advisorKey);
//             setClickedAdvisors((prev) => new Set([...prev, advisorKey]));
//           } else {
//             // Check messages for last used advisor
//             const allMessages = messages;
//             const lastMessageWithRole = allMessages
//               .filter((msg) => {
//                 const msgRole = (msg as any).activeRole?.toLowerCase();
//                 return msgRole && msgRole !== "idea-validator";
//               })
//               .pop();

//             if (lastMessageWithRole?.activeRole) {
//               const msgRoleKey = lastMessageWithRole.activeRole.toLowerCase();
//               setActiveRole(msgRoleKey);
//               const advisorKey = msgRoleKey;
//               setActiveAdvisor(advisorKey);
//               setClickedAdvisors((prev) => new Set([...prev, advisorKey]));
//               if (typeof window !== "undefined") {
//                 localStorage.setItem(`activeRole:${sessionId}`, msgRoleKey);
//               }
//             } else {
//               setActiveRole("idea-validator");
//               setActiveAdvisor(null);
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Failed to select chat session:", error);
//         toast({
//           variant: "error",
//           title: "Could not load chat",
//           description: "Please try again.",
//         });
//       }
//     },
//     [selectChatSession, chatSessions, messages, storeKeyToRole, setActiveRole, toast]
//   );

//   const dynamicTitle = useCallback(
//     async (messages: Message): Promise<string> => {
//       const userMsg = messages.content;
//       try {
//         const response = await fetch("/api/ai-title", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ userMsg }),
//         });
//         const data: AITitleResponse = await response.json();
//         return data.title;
//       } catch (error) {
//         console.error("error in dynamicTitle", error);
//         return "Error generating title";
//       }
//     },
//     []
//   );

//   const handleSendMessage = useCallback(async () => {
//     if (!inputValue.trim() || isTyping || !currentSessionId || !user?.id) return;

//     const storeRoleKey = roleToStoreKey[activeRole] || "idea-validator";
//     const userMessage: Message = {
//       _id: Date.now().toString(),
//       role: "user",
//       content: inputValue.trim(),
//       timestamp: new Date(),
//       activeRole: activeRole, // Keep display name for UI
//     };

//     const newMessages = [...localMessages, userMessage];

//     const requestMessagesBase: Message[] = newMessages;

//     if (currentSession?.topic === "New Chat") {
//       try {
//         const title = (await dynamicTitle(userMessage)) || "new chat";
//         await updateSessionTopic(currentSessionId, title);
//       } catch (error) {
//         console.error("Failed to update session topic:", error);
//       }
//     }

//     try {
//       // Store activeRole with message (only for advisors, not idea-validator)
//       await addMessage(
//         inputValue.trim(),
//         "user",
//         currentSessionId,
//         storeRoleKey !== "idea-validator" ? storeRoleKey : undefined
//       );
//     } catch (error) {
//       console.error("Failed to save user message:", error);
//     }

//     setLocalMessages(newMessages);

//     setInputValue("");
//     setIsTyping(true);

//     if (activeAdvisor) {
//       setThinkingAdvisor(activeAdvisor);
//     }

//     const requestBody: AIChatRequest = {
//       activeRole: storeRoleKey, // Use store key for API
//       messages: normalizeForProvider(requestMessagesBase).map((m) => ({
//         role: m.role,
//         content: m.content,
//         roleContext: m.roleContext || storeRoleKey, // Forward role context
//       })),
//       sessionId: currentSessionId,
//       userId: user.id,
//     };

//     try {
//       setIsTyping(true);

//       const response = await fetch("/api/ai-chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) throw new Error("Failed to connect to AI service");
//       if (!response.body) throw new Error("No response stream from AI");

//       const reader = response.body.getReader();
//       const decoder = new TextDecoder("utf-8");
//       let finalText = "";

//       setLocalMessages((prev) => [
//         ...prev,
//         {
//           _id: Date.now().toString() + "_stream",
//           role: "ai",
//           content: "",
//           timestamp: new Date(),
//           activeRole,
//         },
//       ]);

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
//         const chunk = decoder.decode(value, { stream: true });
//         if (!chunk) continue;

//         finalText += chunk;

//         setLocalMessages((prev) => {
//           const updated = [...prev];
//           updated[updated.length - 1].content = finalText;
//           return updated;
//         });

//         console.log("📦 [GEMINI STREAM] CHUNK RECEIVED:", chunk);
//       }

//       if (!finalText.trim()) {
//         finalText = "⚠️ No response received from AI.";
//       }

//       setLocalMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1].content = finalText;
//         return updated;
//       });

//       console.log("✅ Stream complete. Final text length:", finalText.length);
//     } catch (err) {
//       console.error("❌ Stream error:", err);
//       toast({
//         variant: "error",
//         title: "Message failed",
//         description: "AI service temporarily unavailable.",
//       });
//     } finally {
//       setIsTyping(false);
//     }
//   }, [
//     inputValue,
//     isTyping,
//     currentSessionId,
//     user?.id,
//     localMessages,
//     currentSession?.topic,
//     activeRole,
//     activeAdvisor,
//     updateSessionTopic,
//     addMessage,
//     setLocalMessages,
//     setInputValue,
//     setIsTyping,
//     dynamicTitle,
//     toast,
//   ]);

//   const handleKeyDown = useCallback(
//     (e: React.KeyboardEvent) => {
//       if (e.key === "Enter" && !e.shiftKey) {
//         e.preventDefault();
//         handleSendMessage();
//       }
//     },
//     [handleSendMessage]
//   );

//   const handleDeleteChatSession = useCallback(
//     async (sessionId: string) => {
//       try {
//         if (chatSessions.length === 1) {
//           toast({
//             variant: "warning",
//             title: "Cannot delete",
//             description:
//               "You can't delete the last chat. Please create another chat first.",
//           });
//           return;
//         }

//         const confirmed = window.confirm(
//           "Delete this chat session? This action cannot be undone."
//         );
//         if (!confirmed) return;

//         setDeletingSessionId(sessionId);
//         await deleteChatSession(sessionId);
//       } catch (error) {
//         console.error("Failed to delete chat session:", error);
//         toast({
//           variant: "error",
//           title: "Delete failed",
//           description: "We couldn't delete the chat. Please try again.",
//         });
//       } finally {
//                setDeletingSessionId(null);
//       }
//     },
//     [chatSessions.length, deleteChatSession, toast]
//   );

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const newChatMessage = sessionStorage.getItem("newChatMessage");
//       const shouldCreateNewChat =
//         sessionStorage.getItem("createNewChat") === "true";

//       if (newChatMessage) {
//         sessionStorage.removeItem("newChatMessage");
//         sessionStorage.removeItem("createNewChat");

//         const generateTitle = async () => {
//           try {
//             if (shouldCreateNewChat && user?.id) {
//               const userMessage: Message = {
//                 _id: Date.now().toString(),
//                 role: "user",
//                 content: newChatMessage.trim(),
//                 timestamp: new Date(),
//                 activeRole: activeRole,
//               };

//               const title = await dynamicTitle(userMessage);

//               const initialMessage =
//                 "Hello! I'm your 021 AI. How can I help you today?";
//               await createNewChatSession(user.id, title, initialMessage);

//               const welcomeMessage: Message = {
//                 _id: Date.now().toString() + "_welcome",
//                 role: "ai",
//                 content: initialMessage,
//                 timestamp: new Date(),
//                 activeRole: activeRole,
//               };
//               setLocalMessages([welcomeMessage]);

//               sessionStorage.setItem("newChatMessage", newChatMessage);
//               return true;
//             }
//             return false;
//           } catch (error) {
//             console.error("Failed to generate title or create chat:", error);
//             if (shouldCreateNewChat && user?.id) {
//               createNewChat(true).then(() => {
//                 sessionStorage.setItem("newChatMessage", newChatMessage);
//               });
//               return true;
//             }
//             return false;
//           }
//         };

//         if (shouldCreateNewChat && user?.id) {
//           generateTitle().then((created) => {
//             if (created) return;
//           });
//           return;
//         }

//         if (user?.id && currentSessionId) {
//           const userMessage: Message = {
//             _id: Date.now().toString(),
//             role: "user",
//             content: newChatMessage.trim(),
//             timestamp: new Date(),
//             activeRole: activeRole,
//           };

//           const newMessages = [...localMessages, userMessage];
//           setLocalMessages(newMessages);

//           addMessage(newChatMessage.trim(), "user", currentSessionId).then(
//             () => {
//               const requestBody: AIChatRequest = {
//                 messages: normalizeForProvider(newMessages).map((m) => ({
//                   role: m.role,
//                   content: m.content,
//                   roleContext: m.roleContext,
//                 })),
//                 activeRole,
//                 sessionId: currentSessionId,
//                 userId: user.id,
//               };

//               setIsTyping(true);

//               fetch("/api/ai-chat", {
//                 method: "POST",
//                 headers: {
//                   "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify(requestBody),
//               })
//                 .then(async (response) => {
//                   if (!response.ok) {
//                     throw new Error(
//                       `API error: ${response.status} ${response.statusText}`
//                     );
//                   }

//                   const contentType = response.headers.get("content-type") ?? "";

//                   if (contentType.includes("application/json")) {
//                     return (await response.json()) as AIChatResponse;
//                   }

//                   const text = await response.text();

//                   return {
//                     content: text || "",
//                     provider: "gemini-stream",
//                     confidence: 0,
//                   } satisfies AIChatResponse;
//                 })
//                 .then((data: AIChatResponse) => {
//                   const aiMessage: Message = {
//                     _id: Date.now().toString() + "_ai",
//                     role: "ai",
//                     content: data.content,
//                     timestamp: new Date(),
//                     activeRole: activeRole,
//                   };

//                   setLocalMessages((prev) => [...prev, aiMessage]);
//                 })
//                 .catch((error) => {
//                   console.error("error in chat: ", error);

//                   let errorMessage = "Unexpected error occurred.";

//                   if (
//                     error instanceof TypeError &&
//                     String(error.message || "").includes("fetch")
//                   ) {
//                     errorMessage =
//                       "Network error. Please check your connection and try again.";
//                   } else if (
//                     error instanceof Error &&
//                     String(error.message || "").includes("API error")
//                   ) {
//                     errorMessage =
//                       "AI service is temporarily unavailable. Please try again later.";
//                   } else if (error instanceof Error && error.message) {
//                     errorMessage = `Unexpected error: ${error.message}`;
//                   } else {
//                     errorMessage = `Unexpected error: ${String(error)}`;
//                   }

//                   addMessage(errorMessage, "ai", currentSessionId);

//                   const errorMsg: Message = {
//                     _id: Date.now().toString() + "_error",
//                     role: "ai",
//                     content: errorMessage,
//                     timestamp: new Date(),
//                     activeRole: activeRole,
//                   };

//                   setLocalMessages((prev) => [...prev, errorMsg]);
//                   toast({
//                     variant: "error",
//                     title: "Message failed",
//                     description: errorMessage,
//                   });
//                 })
//                 .finally(() => {
//                   setIsTyping(false);
//                 });
//             }
//           );
//         } else if (user?.id) {
//           const tempMessage = newChatMessage;
//           createNewChat(true).then(() => {
//             setTimeout(() => {
//               const userMessage: Message = {
//                 _id: Date.now().toString(),
//                 role: "user",
//                 content: tempMessage.trim(),
//                 timestamp: new Date(),
//                 activeRole: activeRole,
//               };

//               const newMessages = [...localMessages, userMessage];
//               setLocalMessages(newMessages);

//               if (currentSessionId) {
//                 addMessage(tempMessage.trim(), "user", currentSessionId).then(
//                   () => {
//                     const requestBody: AIChatRequest = {
//                       messages: normalizeForProvider(newMessages).map((m) => ({
//                         role: m.role,
//                         content: m.content,
//                         roleContext: m.roleContext,
//                       })),
//                       activeRole,
//                       sessionId: currentSessionId,
//                       userId: user.id,
//                     };

//                     setIsTyping(true);

//                     fetch("/api/ai-chat", {
//                       method: "POST",
//                       headers: { "Content-Type": "application/json" },
//                       body: JSON.stringify(requestBody),
//                     })
//                       .then((response) => response.json())
//                       .then((data: AIChatResponse) => {
//                         const aiMessage: Message = {
//                           _id: Date.now().toString() + "_ai",
//                           role: "ai",
//                           content: data.content,
//                           timestamp: new Date(),
//                           activeRole: activeRole,
//                         };

//                         setLocalMessages((prev) => [...prev, aiMessage]);
//                       })
//                       .catch((error) => {
//                         console.error("error in chat: ", error);
//                         const errorMessage = "Unexpected error occurred.";
//                         const errorMsg: Message = {
//                           _id: Date.now().toString() + "_error",
//                           role: "ai",
//                           content: errorMessage,
//                           timestamp: new Date(),
//                           activeRole: activeRole,
//                         };

//                         setLocalMessages((prev) => [...prev, errorMsg]);
//                       })
//                       .finally(() => {
//                         setIsTyping(false);
//                       });
//                   }
//                 );
//               }
//             }, 1000);
//           });
//         }
//       }
//     }
//   }, [
//     user?.id,
//     currentSessionId,
//     createNewChat,
//     localMessages,
//     activeRole,
//     createNewChatSession,
//     dynamicTitle,
//     addMessage,
//     setLocalMessages,
//     setIsTyping,
//     toast,
//   ]);

//   const hasLoadedRef = useRef(false);
//   useEffect(() => {
//     if (!hasLoadedRef.current && user?.id) {
//       hasLoadedRef.current = true;
//       loadChatSessions(user.id);
//     }
//   }, [user?.id, loadChatSessions]);

//   const didAutoActionRef = useRef(false);
//   useEffect(() => {
//     if (didAutoActionRef.current) return;
//     if (!user?.id || isLoading) return;
//     if (!hasLoadedRef.current) return;

//     if (!currentSessionId && chatSessions.length > 0) {
//       didAutoActionRef.current = true;
//       const mostRecentSession = chatSessions[0];
//       handleSelectChatSession(mostRecentSession._id!);
//     }
//   }, [
//     user?.id,
//     chatSessions,
//     isLoading,
//     currentSessionId,
//     handleSelectChatSession,
//   ]);

//   useEffect(() => {
//     if (!user?.id) return;
//     if (chatSessions.length > 0) {
//       const key = `auto-create-${user.id}`;
//       if (typeof window !== "undefined") sessionStorage.removeItem(key);
//     }
//   }, [user?.id, chatSessions.length]);

//   useEffect(() => {
//     if (currentSessionId && localMessages.length === 0 && !isLoading) {
//       const currentSession = chatSessions.find((s) => s._id === currentSessionId);
//       if (currentSession) {
//         // messages will be loaded by the store
//       }
//     }
//   }, [currentSessionId, localMessages.length, isLoading, chatSessions]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [localMessages]);

//   useEffect(() => {
//     if (error) {
//       console.error("Chat store error:", error);
//       toast({ variant: "error", title: "Error", description: String(error) });
//       setTimeout(() => clearError(), 5000);
//     }
//   }, [error, clearError, toast]);

//   /** ---------- Additive: Search state & behavior ---------- **/
//   const [searchQuery, setSearchQuery] = useState("");
//   const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

//   // Refs to each rendered message container & its content block
//   const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
//   const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

//   const matches: MatchRef[] = useMemo(
//     () => findAllMatchesInMessages(displayMessages, searchQuery),
//     [displayMessages, searchQuery]
//   );

//   const normalizedIndex = matches.length
//     ? (currentMatchIndex % matches.length + matches.length) % matches.length
//     : 0;

//   const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     const q = e.target.value;
//     setSearchQuery(q);
//     setCurrentMatchIndex(0);
//   }, []);

//   const goToNext = useCallback(() => {
//     if (matches.length === 0) return;
//     setCurrentMatchIndex((i) => (i + 1) % matches.length);
//   }, [matches.length]);

//   const goToPrev = useCallback(() => {
//     if (matches.length === 0) return;
//     setCurrentMatchIndex((i) => (i - 1 + matches.length) % matches.length);
//   }, [matches.length]);

//   // Highlight implementation
//   const clearHighlights = useCallback((root: HTMLElement) => {
//     const spans = root.querySelectorAll('span[data-search-highlight]');
//     spans.forEach((span) => {
//       const parent = span.parentNode;
//       if (!parent) return;
//       const text = document.createTextNode(span.textContent || "");
//       parent.replaceChild(text, span);
//       parent.normalize();
//     });
//   }, []);

//   const applyHighlightsInNode = useCallback((root: HTMLElement, q: string) => {
//     if (!q) return 0;
//     const query = q.toLowerCase();
//     let count = 0;

//     const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
//       acceptNode(node: Node) {
//         if (!node || !node.nodeValue) return NodeFilter.FILTER_REJECT;
//         const val = node.nodeValue.trim();
//         if (!val) return NodeFilter.FILTER_REJECT;
//         const parentEl = (node as any).parentElement as HTMLElement | null;
//         if (!parentEl) return NodeFilter.FILTER_REJECT;
//         const tag = parentEl.tagName.toLowerCase();
//         if (tag === "code" || tag === "pre" || tag === "kbd" || tag === "samp") {
//           return NodeFilter.FILTER_REJECT;
//         }
//         return NodeFilter.FILTER_ACCEPT;
//       }
//     } as any);

//     const textNodes: Text[] = [];
//     let cur = walker.nextNode();
//     while (cur) {
//       textNodes.push(cur as Text);
//       cur = walker.nextNode();
//     }

//     textNodes.forEach((textNode) => {
//       const original = textNode.nodeValue || "";
//       const lower = original.toLowerCase();
//       let from = 0;
//       const pieces: (Text | HTMLSpanElement)[] = [];

//       while (true) {
//         const idx = lower.indexOf(query, from);
//         if (idx === -1) break;
//         if (idx > from) {
//           pieces.push(document.createTextNode(original.slice(from, idx)));
//         }
//         const span = document.createElement("span");
//         span.setAttribute("data-search-highlight", "1");
//         span.style.background = "rgba(250,204,21,0.45)";
//         span.style.borderRadius = "4px";
//         span.style.padding = "0 2px";
//         span.style.boxShadow = "0 0 0 0.5px rgba(0,0,0,0.15)";
//         span.textContent = original.slice(idx, idx + query.length);
//         pieces.push(span);
//         count += 1;
//         from = idx + query.length;
//       }
//       if (from < original.length) {
//         pieces.push(document.createTextNode(original.slice(from)));
//       }

//       if (pieces.length) {
//         const parent = textNode.parentNode!;
//         pieces.forEach((p) => parent.insertBefore(p, textNode));
//         parent.removeChild(textNode);
//       }
//     });

//     return count;
//   }, []);

//   useEffect(() => {
//     Object.values(contentRefs.current).forEach((el) => {
//       if (el) clearHighlights(el);
//     });

//     if (!searchQuery.trim()) return;

//     let total = 0;
//     const orderedSpans: HTMLSpanElement[] = [];
//     displayMessages.forEach((m, idx) => {
//       const id = m._id || `msg-${idx}`;
//       const root = contentRefs.current[id];
//       if (!root) return;
//       const count = applyHighlightsInNode(root, searchQuery);
//       if (count > 0) {
//         root.querySelectorAll('span[data-search-highlight]').forEach((s) => {
//           orderedSpans.push(s as HTMLSpanElement);
//         });
//         total += count;
//       }
//     });

//     orderedSpans.forEach((span, i) => {
//       span.setAttribute("data-highlight-index", String(i));
//       span.style.outline = "";
//       span.style.outlineOffset = "";
//     });

//     if (orderedSpans.length > 0) {
//       const idx = (currentMatchIndex % orderedSpans.length + orderedSpans.length) % orderedSpans.length;
//       const active = orderedSpans[idx];
//       if (active) {
//         active.style.outline = "2px solid #facc15";
//         active.style.outlineOffset = "2px";
//         active.scrollIntoView({ behavior: "smooth", block: "center" });
//       }
//     }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [displayMessages, searchQuery, currentMatchIndex, applyHighlightsInNode, clearHighlights]);

//   /** ---------- Additive: Role avatar persistence (per session) ---------- **/
//   const [avatarRoleById, setAvatarRoleById] = useState<Record<string, string>>({});

//   useEffect(() => {
//     if (!currentSessionId) return;
//     try {
//       const key = `roleAvatarMap:${currentSessionId}`;
//       const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
//       setAvatarRoleById(raw ? JSON.parse(raw) : {});
//     } catch {
//       setAvatarRoleById({});
//     }
//   }, [currentSessionId]);

//   useEffect(() => {
//     if (!currentSessionId) return;
//     const key = `roleAvatarMap:${currentSessionId}`;
//     try {
//       const next = { ...(avatarRoleById || {}) };
//       let changed = false;
//       displayMessages.forEach((m) => {
//         const id = m._id;
//         if (!id) return;
//         if (m.activeRole && ["CEO", "CTO", "CMO", "CFO"].includes(m.activeRole)) {
//           if (next[id] !== m.activeRole) {
//             next[id] = m.activeRole;
//             changed = true;
//           }
//         }
//       });
//       if (changed) {
//         setAvatarRoleById(next);
//         if (typeof window !== "undefined") {
//           localStorage.setItem(key, JSON.stringify(next));
//         }
//       }
//     } catch {
//       // ignore
//     }
//   }, [currentSessionId, displayMessages]); // eslint-disable-line react-hooks/exhaustive-deps

//   const roleAvatarMap: Record<string, { img: any; border: string; label: string }> = {
//     CEO: { img: CEOImage, border: "#3b82f6", label: "CEO" },      // blue
//     CTO: { img: CTOImage, border: "#22c55e", label: "CTO" },      // green
//     CMO: { img: CMOImage, border: "#fb923c", label: "CMO" },      // orange
//     CFO: { img: CFOImage, border: "#8b5cf6", label: "CFO" },      // purple
//   };

//   const resolveRoleForMessage = (m: Message, mid: string): string | undefined => {
//     if (m.activeRole && ["CEO", "CTO", "CMO", "CFO"].includes(m.activeRole)) return m.activeRole;
//     return avatarRoleById[mid];
//   };

//   return (
//     <div className="flex h-screen bg-[#0A0A0A] text-white overflow-hidden">
//       {/* Sidebar - LEFT */}
//       <div
//         className={`${sidebarOpenLeft ? "w-[80vw] md:w-60" : "w-0"} bg-[#171717] border-r border-white/10 transition-all duration-300 overflow-hidden flex flex-col h-full`}
//       >
//         {/* Header */}
//         <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
//           <h2 className="text-lg md:text-xl font-bold font-mono">021 AI</h2>
//           <button onClick={handleCloseSidebarleft}>
//             <ArrowLeftToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
//           </button>
//         </div>

//         {/* New Chat */}
//         <div className="flex justify-center p-3 md:p-4 shrink-0">
//           <button
//             onClick={handleCreateNewChat}
//             disabled={isLoading}
//             className="group relative w-full md:w-50 flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-white rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 ease-out shadow-lg shadow-black/20"
//           >
//             <Plus className="h-5 w-5 -mr-1.5 relative z-10" />
//             <span className="relative z-10">
//               {isLoading ? "Creating..." : "New Chat"}
//             </span>
//           </button>
//         </div>

//         {/* Sessions */}
//         <div className="shrink-0 h-112 overflow-hidden">
//           <div className="p-2 md:p-3 h-full">
//             <div className="h-full overflow-y-auto space-y-2 custom-scrollbar">
//               {isLoading && chatSessions.length === 0 ? (
//                 <div className="text-center text-white/40 text-sm py-4">Loading chats...</div>
//               ) : chatSessions.length === 0 ? (
//                 <div className="text-center text-white/40 text-sm py-4">No chats yet</div>
//               ) : (
//                 chatSessions.map((session) => (
//                   <div
//                     key={session._id}
//                     onClick={() => handleSelectChatSession(session._id!)}
//                     className={`group relative w-full text-left rounded-lg transition-all duration-200 ease-out overflow-hidden
//     ${currentSessionId === session._id
//         ? `bg-[#2A2A2A] border border-white/15 shadow-lg shadow-black/10`
//         : `bg:white/0 border border-transparent hover:bg-white/5 hover:border-white/10`
//       }`}
//                     role="button"
//                     tabIndex={0}
//                     onKeyDown={(e) => {
//                       if (e.key === "Enter") handleSelectChatSession(session._id!);
//                     }}
//                   >
//                     <div className="relative z-10 p-3">
//                       <div className="flex items-center gap-3">
//                         <div className="relative shrink-0">
//                           <MessageSquare className="h-4 w-4 text-white/40 group-hover:text-white/60 transition-colors duration-200" />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <div
//                             className={`font-medium text-xs transition-colors duration-200 truncate ${
//                               currentSessionId === session._id
//                                 ? "text-white"
//                                 : "text-white/70 group-hover:text-white/90"
//                             }`}
//                           >
//                             {session.topic}
//                           </div>
//                         </div>

//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleDeleteChatSession(session._id!);
//                           }}
//                           disabled={deletingSessionId === session._id}
//                           className="hidden md:flex items-center justify-center p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
//                           aria-label="Delete chat session"
//                         >
//                           {deletingSessionId === session._id ? (
//                             <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
//                           ) : (
//                             <Trash className="h-4 w-4 text-white/50 hover:text-red-400" />
//                           )}
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Switch to Pro */}
//         <div className="shrink-0 p-3">
//           <button
//             onClick={handleNavigateToPricing}
//             className="group relative w-full h-12 overflow-hidden rounded-2xl backdrop-blur-xl border border-purple-400/40 hover:border-purple-300/60 transition-all duration-300 ease-out"
//           >
//             <div className="absolute inset-0 rounded-2xl overflow-hidden">
//               <Image
//                 src={proBg}
//                 alt="Premium background"
//                 fill
//                 className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
//               />
//               <div className="absolute inset-0 bg-linear-to-r from-purple-600/30 via-indigo-500/20 to-purple-800/30" />
//             </div>
//             <div className="relative z-30 flex items-center justify-center gap-2">
//               <span className="font-bold text-sm tracking-wide bg-linear-to-r from-purple-100 to-indigo-100 bg-clip-text text-transparent">
//                 SWITCH TO PRO
//               </span>
//             </div>
//           </button>
//         </div>

//         {/* Profile */}
//         <div className="shrink-0 p-3">
//           <div className="flex gap-2">
//             <div className="flex-1 flex items-center gap-2 h-14 bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2">
//               <Image className="h-9 w-9 rounded-full border border-white/20" src={profile} alt="profile" />
//               <div className="flex-1 min-w-0">
//                 <p className="text-white text-xs font-medium leading-tight truncate">
//                   {user?.email ? (() => {
//                     const namePart = user.email.split("@")[0];
//                     return namePart.length > 16 ? namePart.slice(0, 16) : namePart;
//                   })() : "Loading..."}
//                 </p>
//                 <p className="text-white/40 text-xs leading-tight">Free tier</p>
//               </div>
//             </div>

//             <button
//               onClick={handleLogout}
//               className="group relative flex justify-center items-center w-10 h-14 rounded-lg bg-[#2A2A2A] border border-white/10 hover:bg-[#303030] hover:border-white/15"
//             >
//               <LogOut className="h-4 w-4 text-white/60 group-hover:text-white/90" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Chat Area */}
//       <div className="flex-1 flex flex-col min-w-0">
//         {/* Header */}
//         <div className="bg-[#171717] border-b border-white/10 px-3 md:px-6 py-3">
//           <div className="flex items-center gap-3 md:gap-4">
//             {!sidebarOpenLeft && (
//               <button onClick={handleOpenSidebarleft}>
//                 <ArrowRightToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
//               </button>
//             )}
//             <div className="rounded-full flex items-center justify-center text-white">
//               <UserRound className="h-5 w-5" />
//             </div>
//             <div className="min-w-0">
//               <h1 className="text-base md:text-xl font-bold font-mono truncate max-w-[40vw] md:max-w-none">
//                 {activeRole}
//               </h1>
//             </div>

//             {/* Search Bar */}
//             <div className="ml-auto flex items-center gap-2">
//               <div className="flex items-center gap-2 bg-[#2A2A2A] border border-white/10 rounded-lg px-2 py-1">
//                 <input
//                   value={searchQuery}
//                   onChange={onSearchChange}
//                   placeholder="Search…"
//                   className="bg-transparent outline-none text-sm placeholder-white/50 px-1 py-1 w-24 sm:w-36 md:w-52"
//                 />
//                 <span className="text-[11px] md:text-xs text-white/50 shrink-0">
//                   {matches.length > 0 ? `${normalizedIndex + 1}/${matches.length}` : "0/0"}
//                 </span>
//                 <button
//                   onClick={goToPrev}
//                   disabled={!matches.length}
//                   className="p-1 rounded hover:bg-white/10 disabled:opacity-40"
//                   title="Previous match"
//                 >
//                   <ChevronUp className="h-4 w-4" />
//                 </button>
//                 <button
//                   onClick={goToNext}
//                   disabled={!matches.length}
//                   className="p-1 rounded hover:bg-white/10 disabled:opacity-40"
//                   title="Next match"
//                 >
//                   <ChevronDown className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>

//             {!sidebarOpenRight && (
//               <button onClick={handleOpenSidebarright} className="ml-2">
//                 <ArrowLeftToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Messages Area */}
//         <div className="flex-1 px-3 md:px-6 py-3 md:py-4 overflow-y-auto relative">
//           <div className="max-w-full md:max-w-4xl mx-auto space-y-3">
//             {isLoading && displayMessages.length === 0 ? (
//               <div className="text-center text-white/40 text-sm py-8">
//                 {currentSessionId
//                   ? "Loading messages..."
//                   : chatSessions.length > 0
//                   ? "Loading your chat..."
//                   : "Creating your first chat..."}
//               </div>
//             ) : displayMessages.length === 0 ? (
//               <div className="text-center text-white/40 text-sm py-8">
//                 {currentSessionId ? "No messages yet. Start a conversation!" : "Setting up your chat..."}
//               </div>
//             ) : (
//               displayMessages.map((message, idx) => {
//                 const messageId = message._id || `msg-${idx}`;
//                 const { lang, code } = extractFirstCodeBlock(message.content || "");
//                 const canPreview =
//                   message.role !== "user" && !!lang && !!code && SUPPORTED.includes(lang as SupportedLang);

//                 const resolvedRole = resolveRoleForMessage(message, messageId);
//                 const showRoleAvatar =
//                   resolvedRole && ["CEO", "CTO", "CMO", "CFO"].includes(resolvedRole) && message.role !== "user";
//                 const roleMeta = showRoleAvatar ? roleAvatarMap[resolvedRole as keyof typeof roleAvatarMap] : null;

//                 return (
//                   <div
//                     key={messageId}
//                     ref={(el) => { messageRefs.current[messageId] = el; }}
//                     className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
//                   >
//                     <div
//                       className={`flex items-start gap-2 md:gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
//                     >
//                       {showRoleAvatar && (
//                         <div className="shrink-0 flex items-start pt-1">
//                           <div
//                             className="h-7 w-7 rounded-full overflow-hidden"
//                             style={{
//                               border: `2px solid ${roleMeta?.border}`,
//                               boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
//                             }}
//                             title={roleMeta?.label}
//                           >
//                             <Image
//                               src={roleMeta!.img}
//                               alt={roleMeta!.label}
//                               className="h-full w-full object-cover rounded-full"
//                             />
//                           </div>
//                         </div>
//                       )}

//                       <div
//                         className={`rounded-lg px-3 py-2 break-words ${message.role === "user"
//                           ? "bg-[#2A2A2A] border border-white/10 max-w-[80vw] md:max-w-xl"
//                           : message.activeRole && message.activeRole !== "Idea Validator"
//                           ? "max-w-[90vw] md:max-w-4xl border-l-4"
//                           : "max-w-[90vw] md:max-w-4xl"
//                         } text-white`}
//                         style={{
//                           borderLeftColor:
//                             message.activeRole && message.activeRole !== "Idea Validator"
//                               ? getAdvisorHexColor(message.activeRole)
//                               : (showRoleAvatar && resolvedRole
//                                   ? getAdvisorHexColor(resolvedRole)
//                                   : undefined),
//                         }}
//                       >
//                         <div
//                           className="text-sm leading-5 ai-md"
//                           ref={(el) => { contentRefs.current[messageId] = el; }}
//                         >
//                           <AIResponseRenderer content={message.content} />

//                           {canPreview && (
//                             <div className="mt-2 flex items-center justify-end gap-2">
//                               <button
//                                 onClick={() => code && copyText(code)}
//                                 className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10 hover:border-white/25 transition"
//                                 title="Copy code"
//                               >
//                                 <Copy className="h-3.5 w-3.5" />
//                                 Copy
//                               </button>

//                               <button
//                                 onClick={() => togglePreview(messageId)}
//                                 className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10 hover:border-white/25 transition"
//                                 title="Preview code"
//                               >
//                                 <MonitorPlay className="h-3.5 w-3.5" />
//                                 {openPreviews[messageId] ? "Hide Preview" : "Preview"}
//                               </button>
//                             </div>
//                           )}

//                           {canPreview && openPreviews[messageId] && code && (
//                             <div className="mt-3 rounded-lg overflow-hidden border border-white/10 bg-black/40">
//                               <iframe
//                                 className="w-full h-64 md:h-96 bg-white"
//                                 sandbox="allow-scripts allow-same-origin"
//                                 srcDoc={buildSrcDoc(lang as SupportedLang, code)}
//                               />
//                               <div className="px-2 py-1 text-[10px] text-white/50 bg-black/30 border-t border-white/10">
//                                 Rendering {lang?.toUpperCase()} in a sandboxed preview
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })
//             )}

//             {isTyping && (
//               <div className="flex justify-start">
//                 <div className="flex items-start gap-3">
//                   <div className="bg-[#2A2A2A] border border-white/10 rounded-lg px-4 py-3 shadow-sm">
//                     <div className="flex items-center gap-2">
//                       <div className="flex space-x-1">
//                         <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
//                         <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
//                         <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
//                       </div>
//                       <span className="text-xs text-white/60">Assistant is thinking...</span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div ref={messagesEndRef} />
//           </div>
//         </div>

//         {/* Input Area */}
//         <div className="bg-[#0A0A0A] px-3 md:px-6 py-3 md:py-4">
//           <div className="max-w-full md:max-w-4xl mx-auto">
//             <div className="flex items-end gap-3">
//               <div className="flex-1 relative">
//                 <div className="relative rounded-lg bg-[#2A2A2A] border border-white/10 shadow-lg shadow-black/20 hover:border-white/15 hover:bg-[#303030] transition-all duration-300">
//                   <textarea
//                     placeholder={
//                       currentSessionId
//                         ? "Type your message here..."
//                         : chatSessions.length > 0
//                         ? "Loading your chat..."
//                         : "Creating your chat..."
//                     }
//                     className="w-full min-h-10 max-h-[30vh] md:max-h-[84px] resize-none bg-transparent px-3 md:px-4 py-3 text-white placeholder-white/50 focus:outline-none scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 rounded-t-lg"
//                     rows={1}
//                     value={inputValue}
//                     onChange={(e) => setInputValue(e.target.value)}
//                     onKeyDown={handleKeyDown}
//                     disabled={isTyping || !currentSessionId}
//                   />

//                   <div className="flex justify-between items-center px-2 md:px-3 py-2 relative z-10">
//                     <button
//                       onClick={() => {
//                         const storeKey = "idea-validator";
//                         setActiveRole(storeKey); // This will reload messages without filter
//                         setActiveAdvisor(null);
//                         setClickedAdvisors(new Set());
//                       }}
//                       className={`relative rounded-lg h-9 w-9 md:h-10 md:w-10 flex items-center justify-center border transition-all duration-200 ease-out shadow-md
//                      ${activeRole === "Idea Validator"
//                         ? "bg-white/15 hover:bg-white/20 border-white/25"
//                         : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
//                       }
//                      disabled:bg-white/5 disabled:cursor-not-allowed`}
//                     >
//                       <Lightbulb
//                         className={`h-4 w-4 transition-all duration-200 stroke-2
//                           ${activeRole === "Idea Validator"
//                             ? "text-yellow-400"
//                             : "text-white/60"
//                           }`}
//                         fill={activeRole === "Idea Validator" ? "currentColor" : "none"}
//                       />
//                     </button>

//                     <button
//                       onClick={handleSendMessage}
//                       disabled={!inputValue.trim() || isTyping || !currentSessionId}
//                       className="relative rounded-lg h-9 w-9 md:h-10 md:w-10 flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-200 ease-out shadow-md bg-white/5 hover:bg-white/15 disabled:bg-white/5 disabled:cursor-not-allowed"
//                     >
//                       {isTyping ? (
//                         <div aria-busy="true" className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
//                       ) : (
//                         <Send className="h-4 w-4 text-white/70" />
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* C-SUITE ADVISOR - RIGHT */}
//       <div className={`${sidebarOpenRight ? "w-[80vw] md:w-60" : "w-0"} bg-[#171717] border-l border-white/10 transition-all duration-300 overflow-hidden flex flex-col h-full`}>
//         <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
//           <h2 className="text-base md:text-lg font-mono font-bold">C-SUITE ADVISORS</h2>
//           <button onClick={handleCloseSidebarright} className="p-1 rounded hover:bg-white/10 transition-colors">
//             <ArrowRightToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
//           </button>
//         </div>

//         <div className="flex flex-col gap-2 p-3 overflow-y-auto">
//           <div className="h-36 md:h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CEO"
//               isLocked={false}
//               title="Chief Executive Officer"
//               expertise="Strategic Leadership & Vision"
//               avatar={CEOImage}
//               isActive={activeAdvisor === "ceo"}
//               isReplying={replyingAdvisor === "ceo"}
//               isThinking={thinkingAdvisor === "ceo"}
//               isClicked={clickedAdvisors.has("ceo")}
//               primaryColor={advisorColors.ceo}
//               onClick={() => handleAdvisorClick("ceo", "CEO")}
//             />
//           </div>
//           <div className="h-36 md:h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CFO"
//               isLocked={false}
//               title="Chief Financial Officer"
//               expertise="Financial Strategy & Risk Management"
//               avatar={CFOImage}
//               isActive={activeAdvisor === "cfo"}
//               isReplying={replyingAdvisor === "cfo"}
//               isThinking={thinkingAdvisor === "cfo"}
//               isClicked={clickedAdvisors.has("cfo")}
//               primaryColor={advisorColors.cfo}
//               onClick={() => handleAdvisorClick("cfo", "CFO")}
//             />
//           </div>
//           <div className="h-36 md:h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CTO"
//               isLocked={false}
//               title="Chief Technology Officer"
//               expertise="Digital Transformation & Innovation"
//               avatar={CTOImage}
//               isActive={activeAdvisor === "cto"}
//               isReplying={replyingAdvisor === "cto"}
//               isThinking={thinkingAdvisor === "cto"}
//               isClicked={clickedAdvisors.has("cto")}
//               primaryColor={advisorColors.cto}
//               onClick={() => handleAdvisorClick("cto", "CTO")}
//             />
//           </div>
//           <div className="h-36 md:h-40 w-full bg-transparent">
//             <CSuiteAdvisorCard
//               name="CMO"
//               isLocked={false}
//               title="Chief Marketing Officer"
//               expertise="Marketing Strategy & Brand Building"
//               avatar={CMOImage}
//               isActive={activeAdvisor === "cmo"}
//               isReplying={replyingAdvisor === "cmo"}
//               isThinking={thinkingAdvisor === "cmo"}
//               isClicked={clickedAdvisors.has("cmo")}
//               primaryColor={advisorColors.cmo}
//               onClick={() => handleAdvisorClick("cmo", "CMO")}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }









//Splitting chat pages








"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
// Removed ReportCard and ProgressBar from main chat
import CSuiteAdvisorCard from "../../components/ui/c-suite-card";
import CEOImage from "../../public/ceo-1.png";
import CFOImage from "../../public/cfo-1.png";
import CMOImage from "../../public/cmo-1.png";
import CTOImage from "../../public/cto-1.png";
import {
  Trash,
  Send,
  Plus,
  MessageSquare,
  Lightbulb,
  ArrowLeftToLine,
  ArrowRightToLine,
  UserRound,
  LogOut,
  MonitorPlay,
  Copy, // ⬅️ existing additive
  ChevronUp,   // ⬅️ search navigation
  ChevronDown, // ⬅️ search navigation
} from "lucide-react";
import Image from "next/image";
import profile from "../../public/ceo-1.png";
import proBg from "../../public/proBg.png";
import AIResponseRenderer from "../../components/ui/AIResponseRenderer";
import { useToast } from "../../components/ui/Toast";

type ProviderRole = "user" | "assistant" | "system";
interface ProviderMessage {
  role: ProviderRole;
  content: string;
  roleContext?: string;
}
interface AIChatRequest {
  messages: ProviderMessage[];
  activeRole: string;
  sessionId?: string;
  userId?: string;
}
interface AIChatResponse {
  content: string;
  provider: string;
  confidence: number;
  userMessageId?: string;
}

interface Message {
  _id?: string;
  role: "user" | "ai" | "assistant" | "system";
  content: string;
  timestamp?: Date;
  activeRole?: string;
}

interface AITitleResponse {
  title: string;
}

function normalizeForProvider(
  msgs: Array<Message | ProviderMessage>
): ProviderMessage[] {
  const ALLOWED: ProviderRole[] = ["user", "assistant", "system"];
  return msgs
    .map((m) => {
      const role: ProviderRole = ALLOWED.includes(m.role as ProviderRole)
        ? (m.role as ProviderRole)
        : "user";
      const content =
        (m as Message).content ?? (m as ProviderMessage).content ?? "";
      const roleContext =
        (m as Message).activeRole ??
        (m as ProviderMessage).roleContext ??
        undefined;

      return {
        role,
        content: typeof content === "string" ? content : String(content ?? ""),
        roleContext,
      } as ProviderMessage;
    })
    .filter((m) => m.content.trim().length > 0);
}

/** ---------- Additive: Code extraction + preview helpers ---------- **/
type SupportedLang = "html" | "jsx" | "js" | "css";
const SUPPORTED: SupportedLang[] = ["html", "jsx", "js", "css"];

function extractFirstCodeBlock(markdown: string): { lang: SupportedLang | null; code: string | null } {
  const match = markdown.match(/```(\w+)\n([\s\S]*?)```/);
  if (!match) return { lang: null, code: null };
  const lang = match[1]?.toLowerCase();
  const code = match[2] ?? null;
  if (!code) return { lang: null, code: null };

  const language =
    lang === "javascript" ? "js" :
    lang === "tsx" ? "jsx" :
    (SUPPORTED.includes(lang as SupportedLang) ? (lang as SupportedLang) : null);

  return { lang: language, code };
}

function buildSrcDoc(lang: SupportedLang, code: string): string {
  if (lang === "html") {
    return code;
  }

  if (lang === "jsx") {
    return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <style>
      html,body,#root { height: 100%; margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="text/babel">
      ${code}
      const rootEl = document.getElementById('root');
      try {
        if (typeof App === 'function') {
          const r = ReactDOM.createRoot(rootEl);
          r.render(React.createElement(App));
        }
      } catch (e) { console.error(e); }
    </script>
  </body>
</html>`;
  }

  if (lang === "js") {
    return `
<!doctype html>
<html>
  <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body>
    <div id="app"></div>
    <script>
    ${code}
    </script>
  </body>
</html>`;
  }

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
    <style>${code}</style>
  </head>
  <body>
    <div class="preview-target">CSS preview area</div>
  </body>
</html>`;
}

/** Per-message preview open state */
type PreviewState = Record<string, boolean>;

/** ---------- Additive: Search types/helpers ---------- **/
interface MatchRef {
  messageId: string;
  start: number;
  end: number;
  occurrenceInMessage: number;
}

function findAllMatchesInMessages(messages: Message[], query: string): MatchRef[] {
  const q = query.trim();
  if (!q) return [];
  const lowerQ = q.toLowerCase();
  const results: MatchRef[] = [];

  for (const m of messages) {
    const id = m._id || "";
    if (!id || !m.content) continue;
    const text = m.content;
    const lowerText = text.toLowerCase();

    let from = 0;
    let occ = 0;
    while (true) {
      const idx = lowerText.indexOf(lowerQ, from);
      if (idx === -1) break;
      results.push({
        messageId: id,
        start: idx,
        end: idx + lowerQ.length,
        occurrenceInMessage: occ,
      });
      occ += 1;
      from = idx + (lowerQ.length || 1);
    }
  }
  return results;
}

/** ---------- Component ---------- **/
export default function ChatPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpenLeft, setSidebarOpenLeft] = useState(true);
  const [sidebarOpenRight, setSidebarOpenRight] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [proUser] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  
  // Role mapping: UI display names <-> store keys
  const roleToStoreKey: Record<string, string> = {
    "Idea Validator": "idea-validator",
    "CEO": "ceo",
    "CFO": "cfo",
    "CTO": "cto",
    "CMO": "cmo",
  };
  const storeKeyToRole: Record<string, string> = {
    "idea-validator": "Idea Validator",
    "ceo": "CEO",
    "cfo": "CFO",
    "cto": "CTO",
    "cmo": "CMO",
  };

  // --- Additive: which message(s) have preview toggled open ---
  const [openPreviews, setOpenPreviews] = useState<PreviewState>({});
  const togglePreview = useCallback((id: string) => {
    setOpenPreviews(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Additive: copy helper
  const copyText = useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast({ variant: "success", title: "Copied to clipboard" });
    } catch (e) {
      console.error(e);
      toast({ variant: "error", title: "Copy failed", description: "Please copy manually." });
    }
  }, [toast]);

  // C-Suite Advisor States
  const [activeAdvisor, setActiveAdvisor] = useState<string | null>(null);
  const replyingAdvisor: string | null = null;
  const [thinkingAdvisor, setThinkingAdvisor] = useState<string | null>(null);
  const [clickedAdvisors, setClickedAdvisors] = useState<Set<string>>(new Set());
  const advisorColors: Record<string, string> = {
    ceo: "blue",
    cfo: "green",
    cto: "purple",
    cmo: "pink",
  };

  const getAdvisorColor = (roleName: string): string => {
    return advisorColors[roleName.toLowerCase()] || "gray";
  };

  const getAdvisorHexColor = (roleName: string): string => {
    const colorMap: Record<string, string> = {
      blue: "#3b82f6",
      green: "#22c55e",
      purple: "#8b5cf6",
      pink: "#ec4899",
      gray: "#6b7280",
    };
    const colorKey = getAdvisorColor(roleName);
    return colorMap[colorKey] || colorMap.gray;
  };

  const { user, checkAuth } = useAuthStore();

  const {
    chatSessions,
    currentSessionId,
    messages,
    currentActiveRole,
    isLoading,
    error,
    loadChatSessions,
    createNewChatSession,
    selectChatSession,
    addMessage,
    deleteChatSession,
    updateSessionTopic,
    clearError,
    setActiveRole,
  } = useChatStore();
  
  // Get display role from store key
  const activeRole = storeKeyToRole[currentActiveRole] || "Idea Validator";

  // Store all messages (including Idea Validator messages for C-Suite advisors' context)
  // Always merge store messages with local optimistic updates to preserve real-time UI
  const lastSessionIdRef = useRef<string | null>(null);
  useEffect(() => {
    // Reset when session changes
    if (currentSessionId !== lastSessionIdRef.current) {
      lastSessionIdRef.current = currentSessionId;
      // On session change, use store messages directly (they're already filtered)
      if (messages.length > 0) {
        setLocalMessages(messages);
        return;
      }
    }
    
    // Merge: keep optimistic messages that aren't in store yet, and update with store messages
    setLocalMessages((prevLocal) => {
      // If store messages are empty, keep local messages (optimistic updates)
      if (messages.length === 0) return prevLocal;
      
      // Get store message IDs
      const storeMessageIds = new Set(messages.map(m => m._id).filter(Boolean));
      
      // Keep optimistic messages that aren't in store yet
      const optimisticMessages = prevLocal.filter(m => {
        if (!m._id) return true; // Keep messages without IDs
        // Keep streaming/error messages that aren't in store yet
        if (m._id.includes("_stream") || m._id.includes("_error") || m._id.includes("_ai") || m._id.includes("_welcome")) {
          return !storeMessageIds.has(m._id);
        }
        // For regular messages, only keep if not in store (optimistic)
        return !storeMessageIds.has(m._id);
      });
      
      // Combine: store messages (authoritative) + optimistic messages (pending)
      const merged = [...messages, ...optimisticMessages];
      const sorted = merged.sort((a, b) => {
        const aMsg = a as any;
        const bMsg = b as any;
        const aTime = aMsg.timestamp ? new Date(aMsg.timestamp).getTime() : (aMsg.createdAt ? new Date(aMsg.createdAt).getTime() : 0);
        const bTime = bMsg.timestamp ? new Date(bMsg.timestamp).getTime() : (bMsg.createdAt ? new Date(bMsg.createdAt).getTime() : 0);
        return aTime - bTime;
      });
      
      return sorted;
    });
  }, [messages, currentSessionId]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile) {
        setSidebarOpenLeft(false);
        setSidebarOpenRight(false);
      } else {
        setSidebarOpenLeft(true);
        setSidebarOpenRight(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Filter display messages: C-Suite advisors see only their own messages (not Idea Validator messages)
  // But Idea Validator messages are still in localMessages for AI context
  const displayMessages = useMemo(() => {
    if (currentActiveRole === "idea-validator") {
      // Idea Validator sees only its own messages (undefined/null activeRole or "idea-validator")
      return localMessages.filter((msg) => {
        const msgRole = (msg as any).activeRole;
        // Normalize: handle both display name "Idea Validator" and store key "idea-validator"
        if (!msgRole) return true; // No activeRole = Idea Validator message
        const normalizedRole = typeof msgRole === "string" ? msgRole.toLowerCase() : null;
        return !normalizedRole || normalizedRole === "idea-validator" || normalizedRole === "idea validator";
      });
    } else if (currentActiveRole && currentActiveRole !== "idea-validator") {
      // C-Suite advisor sees ONLY their own messages (not Idea Validator messages)
      return localMessages.filter((msg) => {
        const msgRole = (msg as any).activeRole;
        if (!msgRole) return false; // Exclude Idea Validator messages (no activeRole)
        const normalizedRole = typeof msgRole === "string" ? msgRole.toLowerCase() : null;
        return normalizedRole === currentActiveRole;
      });
    }
    return localMessages;
  }, [localMessages, currentActiveRole]);

  const currentSession = chatSessions.find(
    (session) => session._id === currentSessionId
  );

  const createNewChat = useCallback(
    async (isAutoCreate = false) => {
      if (!isAutoCreate && proUser) {
        router.push("/pricing");
        return;
      }
      if (!user?.id) {
        console.error("No user ID available");
        return;
      }
      try {
        const initialMessage = "Hello! I'm your 021 AI. How can I help you today?";
        await createNewChatSession(user.id, "New Chat", initialMessage);
        if (isAutoCreate) {
          const welcomeMessage: Message = {
            _id: Date.now().toString() + "_welcome",
            role: "ai",
            content: initialMessage,
            timestamp: new Date(),
            activeRole: "Idea Validator", // Display name
          };
          setLocalMessages([welcomeMessage]);
          setActiveRole("idea-validator"); // Store key
          setActiveAdvisor(null);
          setClickedAdvisors(new Set());
        }
      } catch (error) {
        console.error("Failed to create new chat:", error);
        toast({
          variant: "error",
          title: "Could not create chat",
          description: "Please try again in a moment.",
        });
      }
    },
    [proUser, router, user?.id, createNewChatSession, toast]
  );

  const handleCreateNewChat = useCallback(() => {
    createNewChat(false);
  }, [createNewChat]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/logout", { method: "GET" });
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  const handleNavigateToPricing = useCallback(() => {
    router.push("/pricing");
  }, [router]);

  const handleCloseSidebarleft = useCallback(() => {
    setSidebarOpenLeft(false);
  }, []);
  const handleOpenSidebarleft = useCallback(() => {
    setSidebarOpenLeft(true);
  }, []);
  const handleCloseSidebarright = useCallback(() => {
    setSidebarOpenRight(false);
  }, []);
  const handleOpenSidebarright = useCallback(() => {
    setSidebarOpenRight(true);
  }, []);

  const handleAdvisorClick = useCallback(
    (advisorKey: string, advisorName: string) => {
      if (replyingAdvisor === advisorKey || thinkingAdvisor === advisorKey) return;
      setActiveAdvisor(advisorKey);
      // Update store with store key (lowercase) - this will reload messages for this advisor
      const storeKey = advisorKey.toLowerCase();
      setActiveRole(storeKey); // This reloads messages filtered by this advisor
      setClickedAdvisors((prev) => new Set([...prev, advisorKey]));
    },
    [replyingAdvisor, thinkingAdvisor, setActiveRole]
  );

  const handleSelectChatSession = useCallback(
    async (sessionId: string) => {
      try {
        // Load persisted advisor selection for this session
        let persistedRole: string | null = null;
        if (typeof window !== "undefined") {
          persistedRole = localStorage.getItem(`activeRole:${sessionId}`);
        }
        
        // Use persisted role or default to idea-validator
        const roleToLoad = persistedRole || "idea-validator";
        
        // Load messages with role filter
        await selectChatSession(sessionId, roleToLoad);
        
        const session = chatSessions.find((s) => s._id === sessionId);
        if (session) {
          // Restore advisor UI state from persisted role
          if (persistedRole && persistedRole !== "idea-validator") {
            const roleName = storeKeyToRole[persistedRole] || persistedRole;
            const advisorKey = persistedRole;
            setActiveAdvisor(advisorKey);
            setClickedAdvisors((prev) => new Set([...prev, advisorKey]));
          } else {
            // Check messages for last used advisor
            const allMessages = messages;
            const lastMessageWithRole = allMessages
              .filter((msg) => {
                const msgRole = (msg as any).activeRole?.toLowerCase();
                return msgRole && msgRole !== "idea-validator";
              })
              .pop();

            if (lastMessageWithRole?.activeRole) {
              const msgRoleKey = lastMessageWithRole.activeRole.toLowerCase();
              setActiveRole(msgRoleKey);
              const advisorKey = msgRoleKey;
              setActiveAdvisor(advisorKey);
              setClickedAdvisors((prev) => new Set([...prev, advisorKey]));
              if (typeof window !== "undefined") {
                localStorage.setItem(`activeRole:${sessionId}`, msgRoleKey);
              }
            } else {
              setActiveRole("idea-validator");
              setActiveAdvisor(null);
            }
          }
        }
      } catch (error) {
        console.error("Failed to select chat session:", error);
        toast({
          variant: "error",
          title: "Could not load chat",
          description: "Please try again.",
        });
      }
    },
    [selectChatSession, chatSessions, messages, storeKeyToRole, setActiveRole, toast]
  );

  const dynamicTitle = useCallback(
    async (messages: Message): Promise<string> => {
      const userMsg = messages.content;
      try {
        const response = await fetch("/api/ai-title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userMsg }),
        });
        const data: AITitleResponse = await response.json();
        return data.title;
      } catch (error) {
        console.error("error in dynamicTitle", error);
        return "Error generating title";
      }
    },
    []
  );

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isTyping || !currentSessionId || !user?.id) return;

    const storeRoleKey = roleToStoreKey[activeRole] || "idea-validator";
    const userMessage: Message = {
      _id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
      // For Idea Validator, don't set activeRole (undefined) to match database behavior
      // For advisors, use the display name for UI consistency
      activeRole: storeRoleKey !== "idea-validator" ? activeRole : undefined,
    };

    const newMessages = [...localMessages, userMessage];

    const requestMessagesBase: Message[] = newMessages;

    if (currentSession?.topic === "New Chat") {
      try {
        const title = (await dynamicTitle(userMessage)) || "new chat";
        await updateSessionTopic(currentSessionId, title);
      } catch (error) {
        console.error("Failed to update session topic:", error);
      }
    }

    try {
      // Store activeRole with message (only for advisors, not idea-validator)
      await addMessage(
        inputValue.trim(),
        "user",
        currentSessionId,
        storeRoleKey !== "idea-validator" ? storeRoleKey : undefined
      );
    } catch (error) {
      console.error("Failed to save user message:", error);
    }

    setLocalMessages(newMessages);

    setInputValue("");
    setIsTyping(true);

    if (activeAdvisor) {
      setThinkingAdvisor(activeAdvisor);
    }

    const requestBody: AIChatRequest = {
      activeRole: storeRoleKey, // Use store key for API
      messages: normalizeForProvider(requestMessagesBase).map((m) => ({
        role: m.role,
        content: m.content,
        roleContext: m.roleContext || storeRoleKey, // Forward role context
      })),
      sessionId: currentSessionId,
      userId: user.id,
    };

    try {
      setIsTyping(true);

      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error("Failed to connect to AI service");
      if (!response.body) throw new Error("No response stream from AI");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finalText = "";

      setLocalMessages((prev) => [
        ...prev,
        {
          _id: Date.now().toString() + "_stream",
          role: "ai",
          content: "",
          timestamp: new Date(),
          // For Idea Validator, don't set activeRole (undefined) to match database behavior
          activeRole: storeRoleKey !== "idea-validator" ? activeRole : undefined,
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        finalText += chunk;

        setLocalMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].content = finalText;
          return updated;
        });

        console.log("📦 [GEMINI STREAM] CHUNK RECEIVED:", chunk);
      }

      if (!finalText.trim()) {
        finalText = "⚠️ No response received from AI.";
      }

      setLocalMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].content = finalText;
        return updated;
      });

      console.log("✅ Stream complete. Final text length:", finalText.length);
    } catch (err) {
      console.error("❌ Stream error:", err);
      toast({
        variant: "error",
        title: "Message failed",
        description: "AI service temporarily unavailable.",
      });
    } finally {
      setIsTyping(false);
    }
  }, [
    inputValue,
    isTyping,
    currentSessionId,
    user?.id,
    localMessages,
    currentSession?.topic,
    activeRole,
    activeAdvisor,
    updateSessionTopic,
    addMessage,
    setLocalMessages,
    setInputValue,
    setIsTyping,
    dynamicTitle,
    toast,
  ]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  const handleDeleteChatSession = useCallback(
    async (sessionId: string) => {
      try {
        if (chatSessions.length === 1) {
          toast({
            variant: "warning",
            title: "Cannot delete",
            description:
              "You can't delete the last chat. Please create another chat first.",
          });
          return;
        }

        const confirmed = window.confirm(
          "Delete this chat session? This action cannot be undone."
        );
        if (!confirmed) return;

        setDeletingSessionId(sessionId);
        await deleteChatSession(sessionId);
      } catch (error) {
        console.error("Failed to delete chat session:", error);
        toast({
          variant: "error",
          title: "Delete failed",
          description: "We couldn't delete the chat. Please try again.",
        });
      } finally {
               setDeletingSessionId(null);
      }
    },
    [chatSessions.length, deleteChatSession, toast]
  );

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const newChatMessage = sessionStorage.getItem("newChatMessage");
      const shouldCreateNewChat =
        sessionStorage.getItem("createNewChat") === "true";

      if (newChatMessage) {
        sessionStorage.removeItem("newChatMessage");
        sessionStorage.removeItem("createNewChat");

        const generateTitle = async () => {
          try {
            if (shouldCreateNewChat && user?.id) {
              const userMessage: Message = {
                _id: Date.now().toString(),
                role: "user",
                content: newChatMessage.trim(),
                timestamp: new Date(),
                activeRole: activeRole,
              };

              const title = await dynamicTitle(userMessage);

              const initialMessage =
                "Hello! I'm your 021 AI. How can I help you today?";
              await createNewChatSession(user.id, title, initialMessage);

              const welcomeMessage: Message = {
                _id: Date.now().toString() + "_welcome",
                role: "ai",
                content: initialMessage,
                timestamp: new Date(),
                activeRole: activeRole,
              };
              setLocalMessages([welcomeMessage]);

              sessionStorage.setItem("newChatMessage", newChatMessage);
              return true;
            }
            return false;
          } catch (error) {
            console.error("Failed to generate title or create chat:", error);
            if (shouldCreateNewChat && user?.id) {
              createNewChat(true).then(() => {
                sessionStorage.setItem("newChatMessage", newChatMessage);
              });
              return true;
            }
            return false;
          }
        };

        if (shouldCreateNewChat && user?.id) {
          generateTitle().then((created) => {
            if (created) return;
          });
          return;
        }

        if (user?.id && currentSessionId) {
          const userMessage: Message = {
            _id: Date.now().toString(),
            role: "user",
            content: newChatMessage.trim(),
            timestamp: new Date(),
            activeRole: activeRole,
          };

          const newMessages = [...localMessages, userMessage];
          setLocalMessages(newMessages);

          addMessage(newChatMessage.trim(), "user", currentSessionId).then(
            () => {
              const requestBody: AIChatRequest = {
                messages: normalizeForProvider(newMessages).map((m) => ({
                  role: m.role,
                  content: m.content,
                  roleContext: m.roleContext,
                })),
                activeRole,
                sessionId: currentSessionId,
                userId: user.id,
              };

              setIsTyping(true);

              fetch("/api/ai-chat", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
              })
                .then(async (response) => {
                  if (!response.ok) {
                    throw new Error(
                      `API error: ${response.status} ${response.statusText}`
                    );
                  }

                  const contentType = response.headers.get("content-type") ?? "";

                  if (contentType.includes("application/json")) {
                    return (await response.json()) as AIChatResponse;
                  }

                  const text = await response.text();

                  return {
                    content: text || "",
                    provider: "gemini-stream",
                    confidence: 0,
                  } satisfies AIChatResponse;
                })
                .then((data: AIChatResponse) => {
                  const aiMessage: Message = {
                    _id: Date.now().toString() + "_ai",
                    role: "ai",
                    content: data.content,
                    timestamp: new Date(),
                    activeRole: activeRole,
                  };

                  setLocalMessages((prev) => [...prev, aiMessage]);
                })
                .catch((error) => {
                  console.error("error in chat: ", error);

                  let errorMessage = "Unexpected error occurred.";

                  if (
                    error instanceof TypeError &&
                    String(error.message || "").includes("fetch")
                  ) {
                    errorMessage =
                      "Network error. Please check your connection and try again.";
                  } else if (
                    error instanceof Error &&
                    String(error.message || "").includes("API error")
                  ) {
                    errorMessage =
                      "AI service is temporarily unavailable. Please try again later.";
                  } else if (error instanceof Error && error.message) {
                    errorMessage = `Unexpected error: ${error.message}`;
                  } else {
                    errorMessage = `Unexpected error: ${String(error)}`;
                  }

                  addMessage(errorMessage, "ai", currentSessionId);

                  const errorMsg: Message = {
                    _id: Date.now().toString() + "_error",
                    role: "ai",
                    content: errorMessage,
                    timestamp: new Date(),
                    activeRole: activeRole,
                  };

                  setLocalMessages((prev) => [...prev, errorMsg]);
                  toast({
                    variant: "error",
                    title: "Message failed",
                    description: errorMessage,
                  });
                })
                .finally(() => {
                  setIsTyping(false);
                });
            }
          );
        } else if (user?.id) {
          const tempMessage = newChatMessage;
          createNewChat(true).then(() => {
            setTimeout(() => {
              const userMessage: Message = {
                _id: Date.now().toString(),
                role: "user",
                content: tempMessage.trim(),
                timestamp: new Date(),
                activeRole: activeRole,
              };

              const newMessages = [...localMessages, userMessage];
              setLocalMessages(newMessages);

              if (currentSessionId) {
                addMessage(tempMessage.trim(), "user", currentSessionId).then(
                  () => {
                    const requestBody: AIChatRequest = {
                      messages: normalizeForProvider(newMessages).map((m) => ({
                        role: m.role,
                        content: m.content,
                        roleContext: m.roleContext,
                      })),
                      activeRole,
                      sessionId: currentSessionId,
                      userId: user.id,
                    };

                    setIsTyping(true);

                    fetch("/api/ai-chat", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(requestBody),
                    })
                      .then((response) => response.json())
                      .then((data: AIChatResponse) => {
                        const aiMessage: Message = {
                          _id: Date.now().toString() + "_ai",
                          role: "ai",
                          content: data.content,
                          timestamp: new Date(),
                          activeRole: activeRole,
                        };

                        setLocalMessages((prev) => [...prev, aiMessage]);
                      })
                      .catch((error) => {
                        console.error("error in chat: ", error);
                        const errorMessage = "Unexpected error occurred.";
                        const errorMsg: Message = {
                          _id: Date.now().toString() + "_error",
                          role: "ai",
                          content: errorMessage,
                          timestamp: new Date(),
                          activeRole: activeRole,
                        };

                        setLocalMessages((prev) => [...prev, errorMsg]);
                      })
                      .finally(() => {
                        setIsTyping(false);
                      });
                  }
                );
              }
            }, 1000);
          });
        }
      }
    }
  }, [
    user?.id,
    currentSessionId,
    createNewChat,
    localMessages,
    activeRole,
    createNewChatSession,
    dynamicTitle,
    addMessage,
    setLocalMessages,
    setIsTyping,
    toast,
  ]);

  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (!hasLoadedRef.current && user?.id) {
      hasLoadedRef.current = true;
      loadChatSessions(user.id);
    }
  }, [user?.id, loadChatSessions]);

  const didAutoActionRef = useRef(false);
  useEffect(() => {
    if (didAutoActionRef.current) return;
    if (!user?.id || isLoading) return;
    if (!hasLoadedRef.current) return;

    if (!currentSessionId && chatSessions.length > 0) {
      didAutoActionRef.current = true;
      const mostRecentSession = chatSessions[0];
      handleSelectChatSession(mostRecentSession._id!);
    }
  }, [
    user?.id,
    chatSessions,
    isLoading,
    currentSessionId,
    handleSelectChatSession,
  ]);

  useEffect(() => {
    if (!user?.id) return;
    if (chatSessions.length > 0) {
      const key = `auto-create-${user.id}`;
      if (typeof window !== "undefined") sessionStorage.removeItem(key);
    }
  }, [user?.id, chatSessions.length]);

  useEffect(() => {
    if (currentSessionId && localMessages.length === 0 && !isLoading) {
      const currentSession = chatSessions.find((s) => s._id === currentSessionId);
      if (currentSession) {
        // messages will be loaded by the store
      }
    }
  }, [currentSessionId, localMessages.length, isLoading, chatSessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  useEffect(() => {
    if (error) {
      console.error("Chat store error:", error);
      toast({ variant: "error", title: "Error", description: String(error) });
      setTimeout(() => clearError(), 5000);
    }
  }, [error, clearError, toast]);

  /** ---------- Additive: Search state & behavior ---------- **/
  const [searchQuery, setSearchQuery] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Refs to each rendered message container & its content block
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const matches: MatchRef[] = useMemo(
    () => findAllMatchesInMessages(displayMessages, searchQuery),
    [displayMessages, searchQuery]
  );

  const normalizedIndex = matches.length
    ? (currentMatchIndex % matches.length + matches.length) % matches.length
    : 0;

  const onSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    setCurrentMatchIndex(0);
  }, []);

  const goToNext = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((i) => (i + 1) % matches.length);
  }, [matches.length]);

  const goToPrev = useCallback(() => {
    if (matches.length === 0) return;
    setCurrentMatchIndex((i) => (i - 1 + matches.length) % matches.length);
  }, [matches.length]);

  // Highlight implementation
  const clearHighlights = useCallback((root: HTMLElement) => {
    const spans = root.querySelectorAll('span[data-search-highlight]');
    spans.forEach((span) => {
      const parent = span.parentNode;
      if (!parent) return;
      const text = document.createTextNode(span.textContent || "");
      parent.replaceChild(text, span);
      parent.normalize();
    });
  }, []);

  const applyHighlightsInNode = useCallback((root: HTMLElement, q: string) => {
    if (!q) return 0;
    const query = q.toLowerCase();
    let count = 0;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node: Node) {
        if (!node || !node.nodeValue) return NodeFilter.FILTER_REJECT;
        const val = node.nodeValue.trim();
        if (!val) return NodeFilter.FILTER_REJECT;
        const parentEl = (node as any).parentElement as HTMLElement | null;
        if (!parentEl) return NodeFilter.FILTER_REJECT;
        const tag = parentEl.tagName.toLowerCase();
        if (tag === "code" || tag === "pre" || tag === "kbd" || tag === "samp") {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    } as any);

    const textNodes: Text[] = [];
    let cur = walker.nextNode();
    while (cur) {
      textNodes.push(cur as Text);
      cur = walker.nextNode();
    }

    textNodes.forEach((textNode) => {
      const original = textNode.nodeValue || "";
      const lower = original.toLowerCase();
      let from = 0;
      const pieces: (Text | HTMLSpanElement)[] = [];

      while (true) {
        const idx = lower.indexOf(query, from);
        if (idx === -1) break;
        if (idx > from) {
          pieces.push(document.createTextNode(original.slice(from, idx)));
        }
        const span = document.createElement("span");
        span.setAttribute("data-search-highlight", "1");
        span.style.background = "rgba(250,204,21,0.45)";
        span.style.borderRadius = "4px";
        span.style.padding = "0 2px";
        span.style.boxShadow = "0 0 0 0.5px rgba(0,0,0,0.15)";
        span.textContent = original.slice(idx, idx + query.length);
        pieces.push(span);
        count += 1;
        from = idx + query.length;
      }
      if (from < original.length) {
        pieces.push(document.createTextNode(original.slice(from)));
      }

      if (pieces.length) {
        const parent = textNode.parentNode!;
        pieces.forEach((p) => parent.insertBefore(p, textNode));
        parent.removeChild(textNode);
      }
    });

    return count;
  }, []);

  useEffect(() => {
    Object.values(contentRefs.current).forEach((el) => {
      if (el) clearHighlights(el);
    });

    if (!searchQuery.trim()) return;

    let total = 0;
    const orderedSpans: HTMLSpanElement[] = [];
    displayMessages.forEach((m, idx) => {
      const id = m._id || `msg-${idx}`;
      const root = contentRefs.current[id];
      if (!root) return;
      const count = applyHighlightsInNode(root, searchQuery);
      if (count > 0) {
        root.querySelectorAll('span[data-search-highlight]').forEach((s) => {
          orderedSpans.push(s as HTMLSpanElement);
        });
        total += count;
      }
    });

    orderedSpans.forEach((span, i) => {
      span.setAttribute("data-highlight-index", String(i));
      span.style.outline = "";
      span.style.outlineOffset = "";
    });

    if (orderedSpans.length > 0) {
      const idx = (currentMatchIndex % orderedSpans.length + orderedSpans.length) % orderedSpans.length;
      const active = orderedSpans[idx];
      if (active) {
        active.style.outline = "2px solid #facc15";
        active.style.outlineOffset = "2px";
        active.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayMessages, searchQuery, currentMatchIndex, applyHighlightsInNode, clearHighlights]);

  /** ---------- Additive: Role avatar persistence (per session) ---------- **/
  const [avatarRoleById, setAvatarRoleById] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!currentSessionId) return;
    try {
      const key = `roleAvatarMap:${currentSessionId}`;
      const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
      setAvatarRoleById(raw ? JSON.parse(raw) : {});
    } catch {
      setAvatarRoleById({});
    }
  }, [currentSessionId]);

  useEffect(() => {
    if (!currentSessionId) return;
    const key = `roleAvatarMap:${currentSessionId}`;
    try {
      const next = { ...(avatarRoleById || {}) };
      let changed = false;
      displayMessages.forEach((m) => {
        const id = m._id;
        if (!id) return;
        if (m.activeRole && ["CEO", "CTO", "CMO", "CFO"].includes(m.activeRole)) {
          if (next[id] !== m.activeRole) {
            next[id] = m.activeRole;
            changed = true;
          }
        }
      });
      if (changed) {
        setAvatarRoleById(next);
        if (typeof window !== "undefined") {
          localStorage.setItem(key, JSON.stringify(next));
        }
      }
    } catch {
      // ignore
    }
  }, [currentSessionId, displayMessages]); // eslint-disable-line react-hooks/exhaustive-deps

  const roleAvatarMap: Record<string, { img: any; border: string; label: string }> = {
    CEO: { img: CEOImage, border: "#3b82f6", label: "CEO" },      // blue
    CTO: { img: CTOImage, border: "#22c55e", label: "CTO" },      // green
    CMO: { img: CMOImage, border: "#fb923c", label: "CMO" },      // orange
    CFO: { img: CFOImage, border: "#8b5cf6", label: "CFO" },      // purple
  };

  const resolveRoleForMessage = (m: Message, mid: string): string | undefined => {
    if (m.activeRole && ["CEO", "CTO", "CMO", "CFO"].includes(m.activeRole)) return m.activeRole;
    return avatarRoleById[mid];
  };

  return (
    <div className="flex h-screen bg-[#0A0A0A] text-white overflow-hidden">
      {/* Sidebar - LEFT */}
      <div
        className={`${sidebarOpenLeft ? "w-[80vw] md:w-60" : "w-0"} bg-[#171717] border-r border-white/10 transition-all duration-300 overflow-hidden flex flex-col h-full`}
      >
        {/* Header */}
        <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <h2 className="text-lg md:text-xl font-bold font-mono">021 AI</h2>
          <button onClick={handleCloseSidebarleft}>
            <ArrowLeftToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
          </button>
        </div>

        {/* New Chat */}
        <div className="flex justify-center p-3 md:p-4 shrink-0">
          <button
            onClick={handleCreateNewChat}
            disabled={isLoading}
            className="group relative w-full md:w-50 flex items-center justify-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-white rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 ease-out shadow-lg shadow-black/20"
          >
            <Plus className="h-5 w-5 -mr-1.5 relative z-10" />
            <span className="relative z-10">
              {isLoading ? "Creating..." : "New Chat"}
            </span>
          </button>
        </div>

        {/* Sessions */}
        <div className="shrink-0 h-112 overflow-hidden">
          <div className="p-2 md:p-3 h-full">
            <div className="h-full overflow-y-auto space-y-2 custom-scrollbar">
              {isLoading && chatSessions.length === 0 ? (
                <div className="text-center text-white/40 text-sm py-4">Loading chats...</div>
              ) : chatSessions.length === 0 ? (
                <div className="text-center text-white/40 text-sm py-4">No chats yet</div>
              ) : (
                chatSessions.map((session) => (
                  <div
                    key={session._id}
                    onClick={() => handleSelectChatSession(session._id!)}
                    className={`group relative w-full text-left rounded-lg transition-all duration-200 ease-out overflow-hidden
    ${currentSessionId === session._id
        ? `bg-[#2A2A2A] border border-white/15 shadow-lg shadow-black/10`
        : `bg:white/0 border border-transparent hover:bg-white/5 hover:border-white/10`
      }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSelectChatSession(session._id!);
                    }}
                  >
                    <div className="relative z-10 p-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <MessageSquare className="h-4 w-4 text-white/40 group-hover:text-white/60 transition-colors duration-200" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`font-medium text-xs transition-colors duration-200 truncate ${
                              currentSessionId === session._id
                                ? "text-white"
                                : "text-white/70 group-hover:text-white/90"
                            }`}
                          >
                            {session.topic}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChatSession(session._id!);
                          }}
                          disabled={deletingSessionId === session._id}
                          className="hidden md:flex items-center justify-center p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Delete chat session"
                        >
                          {deletingSessionId === session._id ? (
                            <div className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Trash className="h-4 w-4 text-white/50 hover:text-red-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Switch to Pro */}
        <div className="shrink-0 p-3">
          <button
            onClick={handleNavigateToPricing}
            className="group relative w-full h-12 overflow-hidden rounded-2xl backdrop-blur-xl border border-purple-400/40 hover:border-purple-300/60 transition-all duration-300 ease-out"
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <Image
                src={proBg}
                alt="Premium background"
                fill
                className="object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
              />
              <div className="absolute inset-0 bg-linear-to-r from-purple-600/30 via-indigo-500/20 to-purple-800/30" />
            </div>
            <div className="relative z-30 flex items-center justify-center gap-2">
              <span className="font-bold text-sm tracking-wide bg-linear-to-r from-purple-100 to-indigo-100 bg-clip-text text-transparent">
                SWITCH TO PRO
              </span>
            </div>
          </button>
        </div>

        {/* Profile */}
        <div className="shrink-0 p-3">
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 h-14 bg-[#2A2A2A] border border-white/10 rounded-lg px-3 py-2">
              <Image className="h-9 w-9 rounded-full border border-white/20" src={profile} alt="profile" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium leading-tight truncate">
                  {user?.email ? (() => {
                    const namePart = user.email.split("@")[0];
                    return namePart.length > 16 ? namePart.slice(0, 16) : namePart;
                  })() : "Loading..."}
                </p>
                <p className="text-white/40 text-xs leading-tight">Free tier</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="group relative flex justify-center items-center w-10 h-14 rounded-lg bg-[#2A2A2A] border border-white/10 hover:bg-[#303030] hover:border-white/15"
            >
              <LogOut className="h-4 w-4 text-white/60 group-hover:text-white/90" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-[#171717] border-b border-white/10 px-3 md:px-6 py-3">
          <div className="flex items-center gap-3 md:gap-4">
            {!sidebarOpenLeft && (
              <button onClick={handleOpenSidebarleft}>
                <ArrowRightToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
              </button>
            )}
            <div className="rounded-full flex items-center justify-center text-white">
              <UserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base md:text-xl font-bold font-mono truncate max-w-[40vw] md:max-w-none">
                {activeRole}
              </h1>
            </div>

            {/* Search Bar */}
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[#2A2A2A] border border-white/10 rounded-lg px-2 py-1">
                <input
                  value={searchQuery}
                  onChange={onSearchChange}
                  placeholder="Search…"
                  className="bg-transparent outline-none text-sm placeholder-white/50 px-1 py-1 w-24 sm:w-36 md:w-52"
                />
                <span className="text-[11px] md:text-xs text-white/50 shrink-0">
                  {matches.length > 0 ? `${normalizedIndex + 1}/${matches.length}` : "0/0"}
                </span>
                <button
                  onClick={goToPrev}
                  disabled={!matches.length}
                  className="p-1 rounded hover:bg-white/10 disabled:opacity-40"
                  title="Previous match"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  onClick={goToNext}
                  disabled={!matches.length}
                  className="p-1 rounded hover:bg-white/10 disabled:opacity-40"
                  title="Next match"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            </div>

            {!sidebarOpenRight && (
              <button onClick={handleOpenSidebarright} className="ml-2">
                <ArrowLeftToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 px-3 md:px-6 py-3 md:py-4 overflow-y-auto relative">
          <div className="max-w-full md:max-w-4xl mx-auto space-y-3">
            {isLoading && displayMessages.length === 0 ? (
              <div className="text-center text-white/40 text-sm py-8">
                {currentSessionId
                  ? "Loading messages..."
                  : chatSessions.length > 0
                  ? "Loading your chat..."
                  : "Creating your first chat..."}
              </div>
            ) : displayMessages.length === 0 ? (
              <div className="text-center text-white/40 text-sm py-8">
                {currentSessionId ? "No messages yet. Start a conversation!" : "Setting up your chat..."}
              </div>
            ) : (
              displayMessages.map((message, idx) => {
                const messageId = message._id || `msg-${idx}`;
                const { lang, code } = extractFirstCodeBlock(message.content || "");
                const canPreview =
                  message.role !== "user" && !!lang && !!code && SUPPORTED.includes(lang as SupportedLang);

                const resolvedRole = resolveRoleForMessage(message, messageId);
                const showRoleAvatar =
                  resolvedRole && ["CEO", "CTO", "CMO", "CFO"].includes(resolvedRole) && message.role !== "user";
                const roleMeta = showRoleAvatar ? roleAvatarMap[resolvedRole as keyof typeof roleAvatarMap] : null;

                return (
                  <div
                    key={messageId}
                    ref={(el) => { messageRefs.current[messageId] = el; }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-start gap-2 md:gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      {showRoleAvatar && (
                        <div className="shrink-0 flex items-start pt-1">
                          <div
                            className="h-7 w-7 rounded-full overflow-hidden"
                            style={{
                              border: `2px solid ${roleMeta?.border}`,
                              boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
                            }}
                            title={roleMeta?.label}
                          >
                            <Image
                              src={roleMeta!.img}
                              alt={roleMeta!.label}
                              className="h-full w-full object-cover rounded-full"
                            />
                          </div>
                        </div>
                      )}

                      <div
                        className={`rounded-lg px-3 py-2 break-words ${message.role === "user"
                          ? "bg-[#2A2A2A] border border-white/10 max-w-[80vw] md:max-w-xl"
                          : message.activeRole && message.activeRole !== "Idea Validator"
                          ? "max-w-[90vw] md:max-w-4xl border-l-4"
                          : "max-w-[90vw] md:max-w-4xl"
                        } text-white`}
                        style={{
                          borderLeftColor:
                            message.activeRole && message.activeRole !== "Idea Validator"
                              ? getAdvisorHexColor(message.activeRole)
                              : (showRoleAvatar && resolvedRole
                                  ? getAdvisorHexColor(resolvedRole)
                                  : undefined),
                        }}
                      >
                        <div
                          className="text-sm leading-5 ai-md"
                          ref={(el) => { contentRefs.current[messageId] = el; }}
                        >
                          <AIResponseRenderer content={message.content} />

                          {canPreview && (
                            <div className="mt-2 flex items-center justify-end gap-2">
                              <button
                                onClick={() => code && copyText(code)}
                                className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10 hover:border-white/25 transition"
                                title="Copy code"
                              >
                                <Copy className="h-3.5 w-3.5" />
                                Copy
                              </button>

                              <button
                                onClick={() => togglePreview(messageId)}
                                className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10 hover:border-white/25 transition"
                                title="Preview code"
                              >
                                <MonitorPlay className="h-3.5 w-3.5" />
                                {openPreviews[messageId] ? "Hide Preview" : "Preview"}
                              </button>
                            </div>
                          )}

                          {canPreview && openPreviews[messageId] && code && (
                            <div className="mt-3 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                              <iframe
                                className="w-full h-64 md:h-96 bg-white"
                                sandbox="allow-scripts allow-same-origin"
                                srcDoc={buildSrcDoc(lang as SupportedLang, code)}
                              />
                              <div className="px-2 py-1 text-[10px] text-white/50 bg-black/30 border-t border-white/10">
                                Rendering {lang?.toUpperCase()} in a sandboxed preview
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start gap-3">
                  <div className="bg-[#2A2A2A] border border-white/10 rounded-lg px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                      <span className="text-xs text-white/60">Assistant is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-[#0A0A0A] px-3 md:px-6 py-3 md:py-4">
          <div className="max-w-full md:max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <div className="relative rounded-lg bg-[#2A2A2A] border border-white/10 shadow-lg shadow-black/20 hover:border-white/15 hover:bg-[#303030] transition-all duration-300">
                  <textarea
                    placeholder={
                      currentSessionId
                        ? "Type your message here..."
                        : chatSessions.length > 0
                        ? "Loading your chat..."
                        : "Creating your chat..."
                    }
                    className="w-full min-h-10 max-h-[30vh] md:max-h-[84px] resize-none bg-transparent px-3 md:px-4 py-3 text-white placeholder-white/50 focus:outline-none scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/20 rounded-t-lg"
                    rows={1}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isTyping || !currentSessionId}
                  />

                  <div className="flex justify-between items-center px-2 md:px-3 py-2 relative z-10">
                    <button
                      onClick={() => {
                        const storeKey = "idea-validator";
                        setActiveRole(storeKey); // This will reload messages without filter
                        setActiveAdvisor(null);
                        setClickedAdvisors(new Set());
                      }}
                      className={`relative rounded-lg h-9 w-9 md:h-10 md:w-10 flex items-center justify-center border transition-all duration-200 ease-out shadow-md
                     ${activeRole === "Idea Validator"
                        ? "bg-white/15 hover:bg-white/20 border-white/25"
                        : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20"
                      }
                     disabled:bg-white/5 disabled:cursor-not-allowed`}
                    >
                      <Lightbulb
                        className={`h-4 w-4 transition-all duration-200 stroke-2
                          ${activeRole === "Idea Validator"
                            ? "text-yellow-400"
                            : "text-white/60"
                          }`}
                        fill={activeRole === "Idea Validator" ? "currentColor" : "none"}
                      />
                    </button>

                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping || !currentSessionId}
                      className="relative rounded-lg h-9 w-9 md:h-10 md:w-10 flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-200 ease-out shadow-md bg-white/5 hover:bg-white/15 disabled:bg-white/5 disabled:cursor-not-allowed"
                    >
                      {isTyping ? (
                        <div aria-busy="true" className="w-4 h-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 text-white/70" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* C-SUITE ADVISOR - RIGHT */}
      <div className={`${sidebarOpenRight ? "w-[80vw] md:w-60" : "w-0"} bg-[#171717] border-l border-white/10 transition-all duration-300 overflow-hidden flex flex-col h-full`}>
        <div className="p-3 border-b border-white/10 flex items-center justify-between shrink-0">
          <h2 className="text-base md:text-lg font-mono font-bold">C-SUITE ADVISORS</h2>
          <button onClick={handleCloseSidebarright} className="p-1 rounded hover:bg-white/10 transition-colors">
            <ArrowRightToLine className="h-5 w-5 text-white/50 hover:text-white/80 transition-colors duration-200" />
          </button>
        </div>

        <div className="flex flex-col gap-2 p-3 overflow-y-auto">
          <div className="h-36 md:h-40 w-full bg-transparent">
            <CSuiteAdvisorCard
              name="CEO"
              isLocked={false}
              title="Chief Executive Officer"
              expertise="Strategic Leadership & Vision"
              avatar={CEOImage}
              isActive={activeAdvisor === "ceo"}
              isReplying={replyingAdvisor === "ceo"}
              isThinking={thinkingAdvisor === "ceo"}
              isClicked={clickedAdvisors.has("ceo")}
              primaryColor={advisorColors.ceo}
              onClick={() => handleAdvisorClick("ceo", "CEO")}
            />
          </div>
          <div className="h-36 md:h-40 w-full bg-transparent">
            <CSuiteAdvisorCard
              name="CFO"
              isLocked={false}
              title="Chief Financial Officer"
              expertise="Financial Strategy & Risk Management"
              avatar={CFOImage}
              isActive={activeAdvisor === "cfo"}
              isReplying={replyingAdvisor === "cfo"}
              isThinking={thinkingAdvisor === "cfo"}
              isClicked={clickedAdvisors.has("cfo")}
              primaryColor={advisorColors.cfo}
              onClick={() => handleAdvisorClick("cfo", "CFO")}
            />
          </div>
          <div className="h-36 md:h-40 w-full bg-transparent">
            <CSuiteAdvisorCard
              name="CTO"
              isLocked={false}
              title="Chief Technology Officer"
              expertise="Digital Transformation & Innovation"
              avatar={CTOImage}
              isActive={activeAdvisor === "cto"}
              isReplying={replyingAdvisor === "cto"}
              isThinking={thinkingAdvisor === "cto"}
              isClicked={clickedAdvisors.has("cto")}
              primaryColor={advisorColors.cto}
              onClick={() => handleAdvisorClick("cto", "CTO")}
            />
          </div>
          <div className="h-36 md:h-40 w-full bg-transparent">
            <CSuiteAdvisorCard
              name="CMO"
              isLocked={false}
              title="Chief Marketing Officer"
              expertise="Marketing Strategy & Brand Building"
              avatar={CMOImage}
              isActive={activeAdvisor === "cmo"}
              isReplying={replyingAdvisor === "cmo"}
              isThinking={thinkingAdvisor === "cmo"}
              isClicked={clickedAdvisors.has("cmo")}
              primaryColor={advisorColors.cmo}
              onClick={() => handleAdvisorClick("cmo", "CMO")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

